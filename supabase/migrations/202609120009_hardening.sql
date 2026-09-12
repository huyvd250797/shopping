-- MyShop V0.9.0 — Hardening
-- Security, performance and release-candidate database safeguards.

-- Runtime roles do not need DDL privileges in the public schema.
revoke create on schema public from public;
revoke create on schema public from anon, authenticated;

-- Harden SECURITY DEFINER helpers by using an empty search_path and fully-qualified objects.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

-- Customer Account and Admin Order screens filter/sort by user/status/date.
create index if not exists idx_orders_user_created
  on public.orders(user_id, created_at desc)
  where user_id is not null;

create index if not exists idx_orders_user_status_created
  on public.orders(user_id, status, created_at desc)
  where user_id is not null;

-- Public catalog common filter/sort paths.
create index if not exists idx_products_active_category_sort
  on public.products(category_id, sort_order, created_at desc)
  where status = 'active' and deleted_at is null;

create index if not exists idx_products_active_price
  on public.products(price, created_at desc)
  where status = 'active' and deleted_at is null and price is not null;

-- The V0.5.0 unique checkout_request_id remains the database source of truth
-- for duplicate-order prevention. Reassert it idempotently for upgraded databases.
create unique index if not exists idx_orders_checkout_request_id
  on public.orders(checkout_request_id)
  where checkout_request_id is not null;

comment on function public.is_admin() is 'V0.9.0 hardened Admin-role helper with empty search_path.';
comment on function public.handle_new_user() is 'V0.9.0 hardened Auth profile bootstrap trigger with empty search_path.';
