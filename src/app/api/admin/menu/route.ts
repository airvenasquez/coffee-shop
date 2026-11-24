import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

function isAuthorized(request: Request): boolean {
  const pin = request.headers.get("x-admin-pin")?.trim();
  const expected = process.env.ADMIN_PIN?.trim() || "2026";
  return Boolean(pin && pin === expected);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("id, name, price_aed, category, is_available, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { items: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load menu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      id?: string;
      is_available?: boolean;
      price_aed?: number;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Menu item id is required." }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof body.is_available === "boolean") {
      updates.is_available = body.is_available;
    }
    if (typeof body.price_aed === "number" && Number.isInteger(body.price_aed) && body.price_aed > 0) {
      updates.price_aed = body.price_aed;
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", body.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update menu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
