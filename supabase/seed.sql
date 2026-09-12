-- MyShop V1.0.0 non-sensitive seed data.
-- Run after the foundation migration. Admin account itself is seeded by scripts/seed-admin.mjs.

insert into public.site_settings (key, value, is_public)
values
  ('app_release', '"1.0.0"'::jsonb, true),
  ('shop_name', '"MyShop"'::jsonb, true),
  ('require_login_for_checkout', 'false'::jsonb, true),
  ('default_affiliate_button_label', '"Xem ưu đãi"'::jsonb, true),
  ('default_direct_button_label', '"Mua ngay"'::jsonb, true)
on conflict (key) do update set value = excluded.value, is_public = excluded.is_public, updated_at = now();

insert into public.categories (name, slug, sort_order, is_active)
values
  ('Gia dụng', 'gia-dung', 10, true),
  ('Mẹ & bé', 'me-va-be', 20, true),
  ('Công nghệ', 'cong-nghe', 30, true),
  ('Phụ kiện', 'phu-kien', 40, true)
on conflict (slug) do nothing;
