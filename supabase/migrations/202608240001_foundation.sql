-- MyShop V0.1.0 Foundation
-- Base schema designed for Affiliate + Direct Order + Hybrid.

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.purchase_mode as enum ('AFFILIATE', 'DIRECT', 'HYBRID');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  sku text unique,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  price numeric(14,2),
  compare_at_price numeric(14,2),
  currency text not null default 'VND',
  thumbnail_url text,
  purchase_mode public.purchase_mode not null default 'DIRECT',
  affiliate_url text,
  button_label text,
  secondary_button_label text,
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  track_stock boolean not null default false,
  stock_qty integer,
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_affiliate_url_check check (affiliate_url is null or affiliate_url ~* '^https?://'),
  constraint products_price_check check (price is null or price >= 0),
  constraint products_compare_price_check check (compare_at_price is null or compare_at_price >= 0)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  province text,
  district text,
  ward text,
  address_line text not null,
  note text,
  status public.order_status not null default 'NEW',
  subtotal numeric(14,2) not null default 0,
  shipping_fee numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  sku_snapshot text,
  image_snapshot text,
  unit_price_snapshot numeric(14,2) not null,
  quantity integer not null default 1 check (quantity > 0),
  line_total numeric(14,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  note text,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image_url text,
  link_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  target_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status_created on public.orders(status, created_at desc);
create index if not exists idx_orders_phone on public.orders(phone);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_history_order on public.order_status_history(order_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Security helper. SECURITY DEFINER prevents recursive RLS checks on profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

do $$ begin
  create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger categories_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger products_updated_at before update on public.products for each row execute procedure public.set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger banners_updated_at before update on public.banners for each row execute procedure public.set_updated_at();
exception when duplicate_object then null; end $$;

-- RLS foundation. V0.2.0 will expand/customer-test policies in detail.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.banners enable row level security;
alter table public.site_settings enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Customer self-edit is intentionally deferred to V0.2.0.
-- Do not grant a generic own-row UPDATE here because it would allow role escalation.

drop policy if exists "public_read_active_categories" on public.categories;
create policy "public_read_active_categories" on public.categories for select to anon, authenticated using (is_active = true or public.is_admin());

drop policy if exists "public_read_active_products" on public.products;
create policy "public_read_active_products" on public.products for select to anon, authenticated using ((status = 'active' and deleted_at is null) or public.is_admin());

drop policy if exists "public_read_product_images" on public.product_images;
create policy "public_read_product_images" on public.product_images for select to anon, authenticated using (
  exists (select 1 from public.products p where p.id = product_id and p.status = 'active' and p.deleted_at is null)
  or public.is_admin()
);

drop policy if exists "public_read_active_banners" on public.banners;
create policy "public_read_active_banners" on public.banners for select to anon, authenticated using (is_active = true or public.is_admin());

drop policy if exists "public_read_public_settings" on public.site_settings;
create policy "public_read_public_settings" on public.site_settings for select to anon, authenticated using (is_public = true or public.is_admin());

-- Admin-only write/read policies for operational tables at Foundation stage.
do $$
declare t text;
begin
  foreach t in array array['categories','products','product_images','orders','order_items','order_status_history','banners','site_settings','affiliate_clicks','admin_audit_logs']
  loop
    execute format('drop policy if exists "admin_all_%s" on public.%I', t, t);
    execute format('create policy "admin_all_%s" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- Grant Data API privileges; RLS remains the authorization boundary.
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_images, public.banners, public.site_settings to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
