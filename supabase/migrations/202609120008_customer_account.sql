-- MyShop V0.8.0 — Customer Account
-- Customer profile/address, secure recent-order claim, and account order history foundation.

alter table public.profiles
  add column if not exists province text,
  add column if not exists district text,
  add column if not exists ward text,
  add column if not exists address_line text;

-- Customer self-service profile update with optional default shipping address.
-- Role/email are deliberately not writable through this RPC.
create or replace function public.update_my_customer_profile(
  p_full_name text,
  p_phone text default null,
  p_province text default null,
  p_district text default null,
  p_ward text default null,
  p_address_line text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.profiles;
  v_full_name text := trim(coalesce(p_full_name, ''));
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
  v_province text := nullif(trim(coalesce(p_province, '')), '');
  v_district text := nullif(trim(coalesce(p_district, '')), '');
  v_ward text := nullif(trim(coalesce(p_ward, '')), '');
  v_address_line text := nullif(trim(coalesce(p_address_line, '')), '');
begin
  if auth.uid() is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  if length(v_full_name) < 1 or length(v_full_name) > 120 then
    raise exception 'INVALID_FULL_NAME';
  end if;
  if v_phone is not null and length(v_phone) > 30 then
    raise exception 'INVALID_PHONE';
  end if;
  if v_province is not null and length(v_province) > 120 then
    raise exception 'INVALID_PROVINCE';
  end if;
  if v_district is not null and length(v_district) > 120 then
    raise exception 'INVALID_DISTRICT';
  end if;
  if v_ward is not null and length(v_ward) > 120 then
    raise exception 'INVALID_WARD';
  end if;
  if v_address_line is not null and length(v_address_line) > 250 then
    raise exception 'INVALID_ADDRESS';
  end if;

  update public.profiles
  set full_name = v_full_name,
      phone = v_phone,
      province = v_province,
      district = v_district,
      ward = v_ward,
      address_line = v_address_line
  where id = auth.uid()
  returning * into result;

  if result.id is null then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  return result;
end;
$$;

revoke all on function public.update_my_customer_profile(text,text,text,text,text,text) from public;
grant execute on function public.update_my_customer_profile(text,text,text,text,text,text) to authenticated;

-- Securely attach a guest order saved on this device to the currently signed-in user.
-- Possession of the random access_token is required; phone/email alone are never enough.
create or replace function public.claim_recent_order(
  p_order_code text,
  p_access_token uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  if p_order_code is null or length(trim(p_order_code)) < 6 or p_access_token is null then
    return 'INVALID_INPUT';
  end if;

  select * into v_order
  from public.orders o
  where o.order_code = trim(p_order_code)
    and o.access_token = p_access_token
  for update;

  if not found then
    return 'NOT_FOUND';
  end if;

  if v_order.user_id is null then
    update public.orders
    set user_id = v_user_id
    where id = v_order.id;
    return 'CLAIMED';
  end if;

  if v_order.user_id = v_user_id then
    return 'ALREADY_OWNED';
  end if;

  return 'OWNED_BY_ANOTHER_ACCOUNT';
end;
$$;

revoke all on function public.claim_recent_order(text,uuid) from public;
grant execute on function public.claim_recent_order(text,uuid) to authenticated;

comment on function public.update_my_customer_profile is 'V0.8.0 safe customer profile/default-address update without role escalation.';
comment on function public.claim_recent_order is 'V0.8.0 securely links a token-protected guest order from browser history to the signed-in customer.';
