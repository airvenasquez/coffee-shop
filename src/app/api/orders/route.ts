import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  DrinkOptions,
  DrinkSize,
  formatOptionsLabel,
  getLineKey,
  getUnitPriceAed,
  isCustomizableDrink,
  MenuCategory,
  MilkOption,
} from "@/data/menu";
import { createSupabaseClient, mapMenuRow, SupabaseMenuRow } from "@/lib/supabase";

interface OrderItemInput {
  id: string;
  quantity: number;
  options?: DrinkOptions;
}

interface CreateOrderBody {
  customerName?: string;
  pickupTime?: string;
  items?: OrderItemInput[];
}

const VALID_SIZES = new Set<DrinkSize>(["Regular", "Large"]);
const VALID_MILKS = new Set<MilkOption>(["Whole Milk", "Oat Milk", "Almond Milk"]);

// Lightweight per-IP sliding window rate limiter (max 10 orders / minute)
const rateLimitMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, maxLen);
}

function normalizeOptions(
  raw: DrinkOptions | undefined,
  category: MenuCategory
): DrinkOptions | undefined {
  if (!raw || !isCustomizableDrink(category)) return undefined;
  const size = raw.size && VALID_SIZES.has(raw.size) ? raw.size : "Regular";
  const milk = raw.milk && VALID_MILKS.has(raw.milk) ? raw.milk : "Whole Milk";
  const extraShot = Boolean(raw.extraShot);
  if (size === "Regular" && milk === "Whole Milk" && !extraShot) {
    return undefined;
  }
  return { size, milk, extraShot };
}

function generateOrderNumber(): string {
  const randomDigits = crypto.randomInt(100000, 999999);
  return `KP-${randomDigits}`;
}

function generateTrackingToken(): string {
  return crypto.randomBytes(12).toString("hex");
}

export async function POST(request: Request) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many orders in a short time. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as CreateOrderBody;
    const customerName = sanitizeText(body.customerName, 80);
    const pickupTime = sanitizeText(body.pickupTime, 60);
    const requestedItems = Array.isArray(body.items) ? body.items : [];

    if (!customerName) {
      return NextResponse.json(
        { error: "Please enter your name for pickup." },
        { status: 400 }
      );
    }

    if (!pickupTime) {
      return NextResponse.json(
        { error: "Please select or enter a pickup time." },
        { status: 400 }
      );
    }

    if (requestedItems.length === 0 || requestedItems.length > 30) {
      return NextResponse.json(
        { error: "Your cart is empty or exceeds the maximum item count." },
        { status: 400 }
      );
    }

    for (const entry of requestedItems) {
      if (
        !entry ||
        typeof entry.id !== "string" ||
        !Number.isInteger(entry.quantity) ||
        entry.quantity <= 0 ||
        entry.quantity > 50
      ) {
        return NextResponse.json(
          { error: "Invalid item or quantity in cart." },
          { status: 400 }
        );
      }
    }

    const uniqueIds = Array.from(new Set(requestedItems.map((e) => e.id)));
    const supabase = createSupabaseClient();

    const { data: menuRows, error: menuError } = await supabase
      .from("menu_items")
      .select(
        "id, name, price_aed, category, description, emoji, image_url, tags, featured, sort_order, is_available"
      )
      .in("id", uniqueIds)
      .eq("is_available", true);

    if (menuError) {
      return NextResponse.json(
        { error: `Unable to verify menu prices: ${menuError.message}` },
        { status: 500 }
      );
    }

    const menuMap = new Map<string, SupabaseMenuRow>();
    for (const row of (menuRows ?? []) as SupabaseMenuRow[]) {
      menuMap.set(row.id, row);
    }

    // Group by item + normalized options
    const groupedLines = new Map<
      string,
      { row: SupabaseMenuRow; quantity: number; options?: DrinkOptions }
    >();

    for (const entry of requestedItems) {
      const menuRow = menuMap.get(entry.id);
      if (!menuRow) {
        return NextResponse.json(
          { error: `Menu item "${entry.id}" is no longer available.` },
          { status: 400 }
        );
      }
      const options = normalizeOptions(
        entry.options,
        menuRow.category as MenuCategory
      );
      const lineKey = getLineKey(menuRow.id, options);
      const existing = groupedLines.get(lineKey);
      if (existing) {
        existing.quantity += entry.quantity;
      } else {
        groupedLines.set(lineKey, {
          row: menuRow,
          quantity: entry.quantity,
          options,
        });
      }
    }

    const validatedItems = [];
    let serverTotalAed = 0;

    for (const [lineKey, line] of groupedLines.entries()) {
      const unitPriceAed = getUnitPriceAed(line.row.price_aed, line.options);
      const lineTotal = unitPriceAed * line.quantity;
      serverTotalAed += lineTotal;
      validatedItems.push({
        lineKey,
        item: mapMenuRow(line.row),
        quantity: line.quantity,
        options: line.options,
        optionsLabel: formatOptionsLabel(line.options),
        unitPriceAed,
        lineTotalAed: lineTotal,
      });
    }

    const orderNumber = generateOrderNumber();
    const trackingToken = generateTrackingToken();

    const orderPayload = {
      order_number: orderNumber,
      tracking_token: trackingToken,
      customer_name: customerName,
      pickup_time: pickupTime,
      items: validatedItems.map((entry) => ({
        id: entry.item.id,
        name: entry.item.name,
        options: entry.options ?? null,
        options_label: entry.optionsLabel || null,
        price_aed: entry.unitPriceAed,
        quantity: entry.quantity,
      })),
      total_aed: serverTotalAed,
      payment_method: "pay_at_pickup",
      status: "received",
    };

    const { error: insertError } = await supabase
      .from("orders")
      .insert(orderPayload);

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to place order: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        orderNumber,
        trackingToken,
        status: "received",
        customerName,
        pickupTime,
        items: validatedItems.map(({ lineKey, item, quantity, options }) => ({
          lineKey,
          item,
          quantity,
          options,
        })),
        totalPrice: serverTotalAed,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to place order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
