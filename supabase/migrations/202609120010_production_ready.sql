-- MyShop V1.0.0 — Production Ready
-- Safe, idempotent release marker + operational defaults/indexes.

begin;

insert into public.site_settings as existing (key, value, is_public, updated_at)
values
  ('app_release', '"1.0.0"'::jsonb, true, now()),
  ('shop_name', '"MyShop"'::jsonb, true, now()),
  ('require_login_for_checkout', 'false'::jsonb, true, now()),
  ('default_affiliate_button_label', '"Xem ưu đãi"'::jsonb, true, now()),
  ('default_direct_button_label', '"Mua ngay"'::jsonb, true, now())
on conflict (key) do update
set is_public = excluded.is_public,
    updated_at = now(),
    value = case
      when excluded.key = 'app_release' then excluded.value
      else existing.value
    end;

-- Operational queries: newest audit events and affiliate events.
create index if not exists idx_admin_audit_logs_created_at
  on public.admin_audit_logs(created_at desc);

create index if not exists idx_affiliate_clicks_created_at
  on public.affiliate_clicks(created_at desc);

-- Keep the release marker public/read-only through existing RLS; Admin remains the only writer.
comment on table public.site_settings is 'Application/site configuration. app_release is a non-sensitive public production health marker.';

commit;
