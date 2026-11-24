-- 1. Create menu_items table
create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  price_aed integer not null check (price_aed > 0),
  category text not null,
  description text not null,
  emoji text not null default '☕',
  featured boolean not null default false,
  sort_order integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  pickup_time text not null,
  items jsonb not null,
  total_aed integer not null check (total_aed > 0),
  payment_method text not null default 'pay_at_pickup',
  created_at timestamptz not null default now()
);

-- 3. Seed the 8 sample menu items
insert into public.menu_items (id, name, price_aed, category, description, emoji, featured, sort_order)
values
  ('espresso', 'Espresso', 10, 'Hot Coffee', 'Rich, velvety double shot pulled from freshly roasted Arabica beans.', '☕', false, 1),
  ('americano', 'Americano', 13, 'Hot Coffee', 'Smooth double espresso topped with hot filtered water.', '🫖', false, 2),
  ('cappuccino', 'Cappuccino', 17, 'Hot Coffee', 'Balanced espresso, steamed milk, and a thick, creamy microfoam cap.', '🥛', true, 3),
  ('flat-white', 'Flat White', 18, 'Hot Coffee', 'Double ristretto with silky steamed milk for a bold, smooth finish.', '🤎', true, 4),
  ('iced-latte', 'Iced Latte', 19, 'Iced Coffee', 'Chilled espresso poured over cold milk and crystal-clear ice.', '🧊', true, 5),
  ('cold-brew', 'Cold Brew', 20, 'Iced Coffee', 'Slow-steeped for 18 hours for natural caramel sweetness and low acidity.', '🥤', false, 6),
  ('butter-croissant', 'Butter Croissant', 12, 'Pastries', 'Flaky, golden-baked French pastry layered with cultured butter.', '🥐', true, 7),
  ('chocolate-muffin', 'Chocolate Muffin', 14, 'Pastries', 'Warm, moist dark cocoa muffin studded with melting chocolate chunks.', '🧁', false, 8)
on conflict (id) do update set
  name = excluded.name,
  price_aed = excluded.price_aed,
  category = excluded.category,
  description = excluded.description,
  emoji = excluded.emoji,
  featured = excluded.featured,
  sort_order = excluded.sort_order;

-- 4. Enable Row Level Security (RLS)
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;

-- 5. Access rules:
-- Customers can read available menu items
drop policy if exists "Public can read menu_items" on public.menu_items;
create policy "Public can read menu_items"
  on public.menu_items
  for select
  to anon, authenticated
  using (is_available = true);

-- Customers can place (insert) orders, but have NO SELECT policy
-- so they cannot read other customers' orders
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
