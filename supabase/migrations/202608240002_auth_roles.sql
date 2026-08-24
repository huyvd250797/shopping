-- MyShop V0.2.0 — Auth & Roles
-- Customer auth/profile hardening + own-order read policies.

-- Keep auth metadata -> profile bootstrap in sync with the V0.2.0 signup form.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = case when public.profiles.full_name is null or public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
        phone = coalesce(public.profiles.phone, excluded.phone);
  return new;
end;
$$;

-- Safe self-service profile update. Role/email are deliberately not parameters.
create or replace function public.update_my_profile(p_full_name text, p_phone text default null)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_full_name is null or length(trim(p_full_name)) = 0 or length(trim(p_full_name)) > 120 then
    raise exception 'Invalid full_name';
  end if;

  if p_phone is not null and length(trim(p_phone)) > 30 then
    raise exception 'Invalid phone';
  end if;

  update public.profiles
  set full_name = trim(p_full_name),
      phone = nullif(trim(p_phone), '')
  where id = auth.uid()
  returning * into result;

  if result.id is null then
    raise exception 'Profile not found';
  end if;

  return result;
end;
$$;

revoke all on function public.update_my_profile(text, text) from public;
grant execute on function public.update_my_profile(text, text) to authenticated;

-- Explicit profile read policy remains own-row or admin.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

-- Direct profile UPDATE remains Admin-only; customer edits use update_my_profile RPC,
-- preventing role escalation through a generic own-row update.
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Future-proof customer order visibility before Checkout/Order UI is implemented.
drop policy if exists "customer_read_own_orders" on public.orders;
create policy "customer_read_own_orders"
on public.orders for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "customer_read_own_order_items" on public.order_items;
create policy "customer_read_own_order_items"
on public.order_items for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()
  )
);

drop policy if exists "customer_read_own_order_history" on public.order_status_history;
create policy "customer_read_own_order_history"
on public.order_status_history for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.orders o
    where o.id = order_status_history.order_id and o.user_id = auth.uid()
  )
);

-- No customer INSERT/UPDATE/DELETE policies for orders yet. V0.5.0 will create
-- orders through a validated server-side/atomic flow and recalculate prices server-side.
