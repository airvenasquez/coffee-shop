-- 1. Create / update menu_items table
create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  price_aed integer not null check (price_aed > 0),
  category text not null,
  description text not null,
  emoji text not null default '☕',
  image_url text,
  tags text[] not null default '{}',
  featured boolean not null default false,
  sort_order integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.menu_items add column if not exists image_url text;
alter table public.menu_items add column if not exists tags text[] not null default '{}';

-- 2. Create / update orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  tracking_token text not null default encode(gen_random_bytes(12), 'hex'),
  customer_name text not null,
  pickup_time text not null,
  items jsonb not null,
  total_aed integer not null check (total_aed > 0),
  payment_method text not null default 'pay_at_pickup',
  status text not null default 'received' check (status in ('received', 'preparing', 'ready', 'picked_up')),
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists tracking_token text not null default encode(gen_random_bytes(12), 'hex');
alter table public.orders add column if not exists status text not null default 'received';

-- 3. Seed the 8 sample menu items with image_url and tags
insert into public.menu_items (id, name, price_aed, category, description, emoji, image_url, tags, featured, sort_order)
values
  ('espresso', 'Espresso', 10, 'Hot Coffee', 'Rich, velvety double shot pulled from freshly roasted Arabica beans.', '☕', '/images/menu/espresso.jpg', '{"Bold","Single Origin"}', false, 1),
  ('americano', 'Americano', 13, 'Hot Coffee', 'Smooth double espresso topped with hot filtered water.', '🫖', '/images/menu/americano.jpg', '{"Classic","Dairy-Free"}', false, 2),
  ('cappuccino', 'Cappuccino', 17, 'Hot Coffee', 'Balanced espresso, steamed milk, and a thick, creamy microfoam cap.', '🥛', '/images/menu/cappuccino.jpg', '{"Best Seller"}', true, 3),
  ('flat-white', 'Flat White', 18, 'Hot Coffee', 'Double ristretto with silky steamed milk for a bold, smooth finish.', '🤎', '/images/menu/flat-white.jpg', '{"Best Seller","House Favorite"}', true, 4),
  ('iced-latte', 'Iced Latte', 19, 'Iced Coffee', 'Chilled espresso poured over cold milk and crystal-clear ice.', '🧊', '/images/menu/iced-latte.jpg', '{"Best Seller","Refreshing"}', true, 5),
  ('cold-brew', 'Cold Brew', 20, 'Iced Coffee', 'Slow-steeped for 18 hours for natural caramel sweetness and low acidity.', '🥤', '/images/menu/cold-brew.jpg', '{"18h Steep","Dairy-Free"}', false, 6),
  ('butter-croissant', 'Butter Croissant', 12, 'Pastries', 'Flaky, golden-baked French pastry layered with cultured butter.', '🥐', '/images/menu/butter-croissant.jpg', '{"Fresh Baked","Best Seller"}', true, 7),
  ('chocolate-muffin', 'Chocolate Muffin', 14, 'Pastries', 'Warm, moist dark cocoa muffin studded with melting chocolate chunks.', '🧁', '/images/menu/chocolate-muffin.jpg', '{"Rich Cocoa"}', false, 8)
on conflict (id) do update set
  name = excluded.name,
  price_aed = excluded.price_aed,
  category = excluded.category,
  description = excluded.description,
  emoji = excluded.emoji,
  image_url = excluded.image_url,
  tags = excluded.tags,
  featured = excluded.featured,
  sort_order = excluded.sort_order;

-- 4. Enable Row Level Security (RLS)
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;

-- 5. Access rules
drop policy if exists "Public can read menu_items" on public.menu_items;
create policy "Public can read menu_items"
  on public.menu_items
  for select
  to anon, authenticated
  using (is_available = true);

drop policy if exists "Public can insert orders" on public.orders;
create policy "Public can insert orders"
  on public.orders
  for insert
  to anon, authenticated
  with check (
    char_length(trim(customer_name)) > 0
    and char_length(trim(pickup_time)) > 0
    and total_aed > 0
  );

-- 6. Scoped order-status lookup RPC (customers can only view their own order with matching token)
create or replace function public.get_order_status(p_order_number text, p_tracking_token text)
returns table (
  order_number text,
  customer_name text,
  pickup_time text,
  items jsonb,
  total_aed integer,
  payment_method text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    o.order_number,
    o.customer_name,
    o.pickup_time,
    o.items,
    o.total_aed,
    o.payment_method,
    o.status,
    o.created_at
  from public.orders o
  where o.order_number = p_order_number
    and o.tracking_token = p_tracking_token
  limit 1;
$$;

grant execute on function public.get_order_status(text, text) to anon, authenticated;
