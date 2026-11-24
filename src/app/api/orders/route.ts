import { NextResponse } from "next/server";
import { createSupabaseClient, mapMenuRow, SupabaseMenuRow } from "@/lib/supabase";

interface OrderItemInput {
  id: string;
  quantity: number;
}

interface CreateOrderBody {
  customerName?: string;
  pickupTime?: string;
  items?: OrderItemInput[];
}

function generateOrderNumber(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `CS-${randomDigits}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderBody;
    const customerName = body.customerName?.trim() ?? "";
    const pickupTime = body.pickupTime?.trim() ?? "";
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

    if (requestedItems.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    // Aggregate quantities by item ID and validate positive integers
    const quantityById = new Map<string, number>();
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
      quantityById.set(entry.id, (quantityById.get(entry.id) ?? 0) + entry.quantity);
    }

    const itemIds = Array.from(quantityById.keys());
    const supabase = createSupabaseClient();

    // Fetch current authoritative menu prices from Supabase
    const { data: menuRows, error: menuError } = await supabase
      .from("menu_items")
      .select("id, name, price_aed, category, description, emoji, featured, sort_order, is_available")
      .in("id", itemIds)
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

    const validatedItems = [];
    let serverTotalAed = 0;

    for (const [id, quantity] of quantityById.entries()) {
      const menuRow = menuMap.get(id);
      if (!menuRow) {
        return NextResponse.json(
          { error: `Menu item "${id}" is no longer available.` },
          { status: 400 }
        );
      }

      const lineTotal = menuRow.price_aed * quantity;
      serverTotalAed += lineTotal;
      validatedItems.push({
        item: mapMenuRow(menuRow),
        quantity,
        unitPriceAed: menuRow.price_aed,
        lineTotalAed: lineTotal,
      });
    }

    const orderNumber = generateOrderNumber();

    const orderPayload = {
      order_number: orderNumber,
      customer_name: customerName,
      pickup_time: pickupTime,
      items: validatedItems.map((entry) => ({
        id: entry.item.id,
        name: entry.item.name,
        price_aed: entry.unitPriceAed,
        quantity: entry.quantity,
      })),
      total_aed: serverTotalAed,
      payment_method: "pay_at_pickup",
    };

    // Insert without .select() so anon does not need SELECT access on orders
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
        customerName,
        pickupTime,
        items: validatedItems.map(({ item, quantity }) => ({ item, quantity })),
        totalPrice: serverTotalAed,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to place order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
