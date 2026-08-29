-- MyShop V0.5.0 — Direct Checkout
-- Safe guest checkout through atomic SECURITY DEFINER RPC.
-- Client never supplies trusted price/total/order status.

alter table public.orders
  add column if not exists checkout_request_id uuid,
  add column if not exists access_token uuid not null default gen_random_uuid();

create unique index if not exists idx_orders_checkout_request_id
  on public.orders(checkout_request_id)
  where checkout_request_id is not null;

create unique index if not exists idx_orders_access_token
  on public.orders(access_token);

create or replace function public.create_direct_order(
  p_product_id uuid,
  p_quantity integer,
  p_customer_name text,
  p_phone text,
  p_email text,
  p_province text,
  p_district text,
  p_ward text,
  p_address_line text,
  p_note text,
  p_checkout_request_id uuid
)
returns table (
  order_id uuid,
  order_code text,
  access_token uuid,
  subtotal numeric,
  shipping_fee numeric,
  total numeric,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product public.products%rowtype;
  v_order public.orders%rowtype;
  v_name text := trim(coalesce(p_customer_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_province text := trim(coalesce(p_province, ''));
  v_district text := trim(coalesce(p_district, ''));
  v_ward text := trim(coalesce(p_ward, ''));
  v_address text := trim(coalesce(p_address_line, ''));
  v_note text := nullif(trim(coalesce(p_note, '')), '');
  v_code text;
  v_subtotal numeric(14,2);
  v_attempt integer := 0;
begin
  if auth.uid() is null and exists (
    select 1 from public.site_settings s
    where s.key = 'require_login_for_checkout' and s.value = 'true'::jsonb
  ) then
    raise exception 'LOGIN_REQUIRED';
  end if;

  if p_checkout_request_id is null then
    raise exception 'CHECKOUT_REQUEST_ID_REQUIRED';
  end if;

  -- Serialize the same idempotency key so concurrent double-submit cannot race.
  perform pg_advisory_xact_lock(hashtextextended(p_checkout_request_id::text, 0));

  -- Idempotency: the same browser request id always resolves to the same order.
  select * into v_order
  from public.orders o
  where o.checkout_request_id = p_checkout_request_id
  limit 1;

  if found then
    return query
      select v_order.id, v_order.order_code, v_order.access_token,
             v_order.subtotal, v_order.shipping_fee, v_order.total, v_order.created_at;
    return;
  end if;

  if p_quantity is null or p_quantity < 1 or p_quantity > 99 then
    raise exception 'INVALID_QUANTITY';
  end if;

  if length(v_name) < 2 or length(v_name) > 120 then
    raise exception 'INVALID_CUSTOMER_NAME';
  end if;

  if length(v_phone) < 8 or length(v_phone) > 15 then
    raise exception 'INVALID_PHONE';
  end if;

  if v_email is not null and (length(v_email) > 180 or v_email !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$') then
    raise exception 'INVALID_EMAIL';
  end if;

  if length(v_province) < 2 or length(v_province) > 120 then
    raise exception 'INVALID_PROVINCE';
  end if;
  if length(v_district) < 1 or length(v_district) > 120 then
    raise exception 'INVALID_DISTRICT';
  end if;
  if length(v_ward) < 1 or length(v_ward) > 120 then
    raise exception 'INVALID_WARD';
  end if;
  if length(v_address) < 3 or length(v_address) > 250 then
    raise exception 'INVALID_ADDRESS';
  end if;
  if v_note is not null and length(v_note) > 500 then
    raise exception 'INVALID_NOTE';
  end if;

  select * into v_product
  from public.products p
  where p.id = p_product_id
    and p.status = 'active'
    and p.deleted_at is null
  for share;

  if not found then
    raise exception 'PRODUCT_NOT_AVAILABLE';
  end if;

  if v_product.purchase_mode not in ('DIRECT', 'HYBRID') then
    raise exception 'PRODUCT_NOT_DIRECT';
  end if;

  if v_product.price is null or v_product.price < 0 then
    raise exception 'PRODUCT_PRICE_INVALID';
  end if;

  if v_product.track_stock and coalesce(v_product.stock_qty, 0) < p_quantity then
    raise exception 'INSUFFICIENT_STOCK';
  end if;

  v_subtotal := round((v_product.price * p_quantity)::numeric, 2);

  -- Generate a human-readable code. Unique constraint is still the final guard.
  loop
    v_attempt := v_attempt + 1;
    v_code := 'ORD-' || to_char(current_date, 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.orders where orders.order_code = v_code);
    if v_attempt >= 8 then
      raise exception 'ORDER_CODE_GENERATION_FAILED';
    end if;
  end loop;

  insert into public.orders (
    order_code,
    user_id,
    customer_name,
    phone,
    email,
    province,
    district,
    ward,
    address_line,
    note,
    status,
    subtotal,
    shipping_fee,
    discount,
    total,
    checkout_request_id
  ) values (
    v_code,
    auth.uid(),
    v_name,
    v_phone,
    v_email,
    v_province,
    v_district,
    v_ward,
    v_address,
    v_note,
    'NEW',
    v_subtotal,
    0,
    0,
    v_subtotal,
    p_checkout_request_id
  ) returning * into v_order;

  insert into public.order_items (
    order_id,
    product_id,
    product_name_snapshot,
    sku_snapshot,
    image_snapshot,
    unit_price_snapshot,
    quantity,
    line_total
  ) values (
    v_order.id,
    v_product.id,
    v_product.name,
    v_product.sku,
    v_product.thumbnail_url,
    v_product.price,
    p_quantity,
    v_subtotal
  );

  insert into public.order_status_history (
    order_id,
    from_status,
    to_status,
    note,
    changed_by
  ) values (
    v_order.id,
    null,
    'NEW',
    'Đơn được tạo từ Direct Checkout V0.5.0',
    auth.uid()
  );

  return query
    select v_order.id, v_order.order_code, v_order.access_token,
           v_order.subtotal, v_order.shipping_fee, v_order.total, v_order.created_at;
end;
$$;

revoke all on function public.create_direct_order(uuid,integer,text,text,text,text,text,text,text,text,uuid) from public;
grant execute on function public.create_direct_order(uuid,integer,text,text,text,text,text,text,text,text,uuid) to anon, authenticated;

create or replace function public.get_order_receipt(
  p_order_code text,
  p_access_token uuid
)
returns table (
  order_id uuid,
  order_code text,
  customer_name text,
  phone text,
  email text,
  province text,
  district text,
  ward text,
  address_line text,
  note text,
  status public.order_status,
  subtotal numeric,
  shipping_fee numeric,
  total numeric,
  created_at timestamptz,
  product_name text,
  sku text,
  image_url text,
  unit_price numeric,
  quantity integer,
  line_total numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    o.id,
    o.order_code,
    o.customer_name,
    o.phone,
    o.email,
    o.province,
    o.district,
    o.ward,
    o.address_line,
    o.note,
    o.status,
    o.subtotal,
    o.shipping_fee,
    o.total,
    o.created_at,
    oi.product_name_snapshot,
    oi.sku_snapshot,
    oi.image_snapshot,
    oi.unit_price_snapshot,
    oi.quantity,
    oi.line_total
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  where o.order_code = p_order_code
    and o.access_token = p_access_token
  order by oi.created_at asc;
$$;

revoke all on function public.get_order_receipt(text,uuid) from public;
grant execute on function public.get_order_receipt(text,uuid) to anon, authenticated;

comment on function public.create_direct_order is 'V0.5.0 atomic Direct Checkout. Re-prices from products and supports guest/authenticated users.';
comment on function public.get_order_receipt is 'V0.5.0 token-gated receipt lookup for guest/local order history.';
