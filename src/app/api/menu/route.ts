import { NextResponse } from "next/server";
import { createSupabaseClient, mapMenuRow, SupabaseMenuRow } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("id, name, price_aed, category, description, emoji, featured, sort_order, is_available")
      .eq("is_available", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to load menu: ${error.message}` },
        { status: 500 }
      );
    }

    const items = ((data ?? []) as SupabaseMenuRow[]).map(mapMenuRow);
    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load menu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
