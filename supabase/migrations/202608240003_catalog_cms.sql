-- MyShop V0.3.0 — Catalog & CMS Core
-- Product/catalog fields, Supabase Storage bucket and Admin-only image write policies.

alter table public.products add column if not exists badge text;
alter table public.products add column if not exists tags text[] not null default '{}'::text[];
alter table public.products add column if not exists specifications jsonb not null default '{}'::jsonb;
alter table public.products add column if not exists meta_title text;
alter table public.products add column if not exists meta_description text;
alter table public.product_images add column if not exists storage_path text;

create index if not exists idx_products_public_catalog
  on public.products(status, sort_order, created_at desc)
  where deleted_at is null;
create index if not exists idx_products_featured
  on public.products(is_featured, sort_order)
  where status = 'active' and deleted_at is null;
create index if not exists idx_products_tags on public.products using gin(tags);
create index if not exists idx_categories_public_sort on public.categories(is_active, sort_order, name);
create index if not exists idx_product_images_product_sort on public.product_images(product_id, sort_order);

-- Public bucket for storefront images. Upload/delete is still protected by storage.objects RLS.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Admin-only writes to the product-images bucket.
drop policy if exists "myshop_product_images_admin_insert" on storage.objects;
create policy "myshop_product_images_admin_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "myshop_product_images_admin_update" on storage.objects;
create policy "myshop_product_images_admin_update"
on storage.objects for update to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "myshop_product_images_admin_delete" on storage.objects;
create policy "myshop_product_images_admin_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());

-- Keep direct grants explicit. Authorization is still enforced by RLS policies.
grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images to authenticated;
