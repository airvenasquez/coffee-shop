import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { MenuCategory, MenuItem } from "@/data/menu";

export interface SupabaseMenuRow {
  id: string;
  name: string;
  price_aed: number;
  category: string;
  description: string;
  emoji: string;
  image_url?: string | null;
  tags?: string[] | null;
  featured: boolean;
  sort_order: number;
  is_available: boolean;
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local."
    );
  }

  return { url, key };
}

export function createSupabaseClient(): SupabaseClient {
  const { url, key } = getSupabaseConfig();
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    throw new Error("Admin Supabase credentials are not configured on the server.");
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function mapMenuRow(row: SupabaseMenuRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    priceAed: row.price_aed,
    category: row.category as MenuCategory,
    description: row.description,
    emoji: row.emoji,
    imageUrl: row.image_url ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    featured: row.featured,
  };
}
