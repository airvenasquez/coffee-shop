import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await context.params;
    const url = new URL(request.url);
    const token = url.searchParams.get("token")?.trim() ?? "";

    if (!orderNumber || !token) {
      return NextResponse.json(
        { error: "Order number and tracking token are required." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.rpc("get_order_status", {
      p_order_number: orderNumber,
      p_tracking_token: token,
    });

    if (error) {
      return NextResponse.json(
        { error: `Unable to fetch order status: ${error.message}` },
        { status: 500 }
      );
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return NextResponse.json(
        { error: "Order not found or invalid tracking link." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { order: row },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load order status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
