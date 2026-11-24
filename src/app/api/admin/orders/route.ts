import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

const VALID_STATUSES = new Set(["received", "preparing", "ready", "picked_up"]);

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
      .from("orders")
      .select(
        "id, order_number, customer_name, pickup_time, items, total_aed, payment_method, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { orders: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load orders.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { id?: string; status?: string };
    if (!body.id || !body.status || !VALID_STATUSES.has(body.status)) {
      return NextResponse.json(
        { error: "Valid order id and status are required." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: body.status })
      .eq("id", body.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
