-- MyShop V0.7.0 — Affiliate & Hybrid
-- Safe outbound redirect, click tracking, lightweight anti-spam and Admin analytics.

alter table public.affiliate_clicks
  add column if not exists source_path text;

create index if not exists idx_affiliate_clicks_created_at
  on public.affiliate_clicks(created_at desc);
create index if not exists idx_affiliate_clicks_product_created
  on public.affiliate_clicks(product_id, created_at desc);
create index if not exists idx_affiliate_clicks_session_created
  on public.affiliate_clicks(session_id, created_at desc)
  where session_id is not null;

create or replace function public.is_valid_affiliate_url(p_url text)
returns boolean
language sql
immutable
set search_path = pg_catalog
as $$
  select p_url is not null
    and length(p_url) between 8 and 2000
    and p_url ~* '^https?://[^[:space:]]+$';
$$;

-- NOT VALID keeps the migration safe for historical rows while enforcing the rule
-- for every new/updated product from this version onward.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_affiliate_url_http'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_affiliate_url_http
      check (affiliate_url is null or public.is_valid_affiliate_url(affiliate_url)) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'products_affiliate_mode_requires_url'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_affiliate_mode_requires_url
      check (purchase_mode <> 'AFFILIATE' or affiliate_url is not null) not valid;
  end if;
end $$;

create or replace function public.record_affiliate_click(
  p_product_slug text,
  p_session_id text default null,
  p_source_path text default null
)
returns table(target_url text, recorded boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
  v_target_url text;
  v_mode public.purchase_mode;
  v_user_id uuid := auth.uid();
  v_session_id text;
  v_source_path text;
  v_recorded boolean := false;
begin
  if p_product_slug is null or length(trim(p_product_slug)) = 0 or length(p_product_slug) > 120 then
    return;
  end if;

  select p.id, p.affiliate_url, p.purchase_mode
    into v_product_id, v_target_url, v_mode
  from public.products p
  where p.slug = trim(p_product_slug)
    and p.status = 'active'
    and p.deleted_at is null
  limit 1;

  if v_product_id is null
     or v_mode not in ('AFFILIATE', 'HYBRID')
     or not public.is_valid_affiliate_url(v_target_url) then
    return;
  end if;

  v_session_id := nullif(left(regexp_replace(coalesce(p_session_id, ''), '[^A-Za-z0-9_-]', '', 'g'), 96), '');
  v_source_path := nullif(left(regexp_replace(coalesce(p_source_path, ''), '[^A-Za-z0-9_./?-]', '', 'g'), 160), '');

  -- Lightweight duplicate suppression: repeated clicks on the same product by the
  -- same signed-in user or anonymous session within 10 seconds are redirected but
  -- only counted once.
  if not exists (
    select 1
    from public.affiliate_clicks ac
    where ac.product_id = v_product_id
      and ac.created_at >= now() - interval '10 seconds'
      and (
        (v_user_id is not null and ac.user_id = v_user_id)
        or (v_session_id is not null and ac.session_id = v_session_id)
      )
  ) then
    insert into public.affiliate_clicks(product_id, user_id, session_id, target_url, source_path)
    values (v_product_id, v_user_id, v_session_id, v_target_url, v_source_path);
    v_recorded := true;
  end if;

  return query select v_target_url, v_recorded;
end;
$$;

revoke all on function public.record_affiliate_click(text, text, text) from public;
grant execute on function public.record_affiliate_click(text, text, text) to anon, authenticated;

create or replace function public.admin_affiliate_kpis(p_days integer default 30)
returns table(
  total_clicks bigint,
  unique_visitors bigint,
  clicks_today bigint,
  active_affiliate_products bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 365));
  v_today_start timestamptz;
begin
  if not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  v_today_start := date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh';

  return query
  select
    (select count(*) from public.affiliate_clicks ac where ac.created_at >= now() - make_interval(days => v_days)),
    (select count(distinct coalesce(ac.user_id::text, nullif(ac.session_id, ''), ac.id::text))
       from public.affiliate_clicks ac
      where ac.created_at >= now() - make_interval(days => v_days)),
    (select count(*) from public.affiliate_clicks ac where ac.created_at >= v_today_start),
    (select count(*) from public.products p
      where p.status = 'active'
        and p.deleted_at is null
        and p.purchase_mode in ('AFFILIATE', 'HYBRID')
        and public.is_valid_affiliate_url(p.affiliate_url));
end;
$$;

revoke all on function public.admin_affiliate_kpis(integer) from public;
grant execute on function public.admin_affiliate_kpis(integer) to authenticated;

create or replace function public.admin_affiliate_product_stats(p_days integer default 30)
returns table(
  product_id uuid,
  product_name text,
  slug text,
  purchase_mode text,
  product_status text,
  clicks bigint,
  unique_visitors bigint,
  last_clicked_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 365));
begin
  if not public.is_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.name,
    p.slug,
    p.purchase_mode::text,
    p.status::text,
    count(ac.id) filter (where ac.created_at >= now() - make_interval(days => v_days)),
    count(distinct coalesce(ac.user_id::text, nullif(ac.session_id, ''), ac.id::text))
      filter (where ac.created_at >= now() - make_interval(days => v_days)),
    max(ac.created_at)
  from public.products p
  left join public.affiliate_clicks ac on ac.product_id = p.id
  where p.deleted_at is null
    and p.purchase_mode in ('AFFILIATE', 'HYBRID')
  group by p.id, p.name, p.slug, p.purchase_mode, p.status
  order by count(ac.id) filter (where ac.created_at >= now() - make_interval(days => v_days)) desc,
           p.name asc;
end;
$$;

revoke all on function public.admin_affiliate_product_stats(integer) from public;
grant execute on function public.admin_affiliate_product_stats(integer) to authenticated;
