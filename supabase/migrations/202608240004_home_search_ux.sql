-- MyShop V0.4.0 — Home & Search UX
-- Banner CMS enhancements, configurable home sections and site-media storage.

alter table public.banners add column if not exists button_label text;
alter table public.banners add column if not exists storage_path text;

create index if not exists idx_banners_public_schedule
  on public.banners(is_active, sort_order, starts_at, ends_at);

create table if not exists public.home_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text not null,
  subtitle text,
  section_type text not null,
  item_limit integer not null default 10 check (item_limit between 1 and 24),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint home_sections_type_check check (section_type in ('FEATURED','NEWEST','BEST_PRICE','RECOMMENDED'))
);

create index if not exists idx_home_sections_public_sort
  on public.home_sections(is_active, sort_order, created_at);

do $$ begin
  create trigger home_sections_updated_at before update on public.home_sections
  for each row execute procedure public.set_updated_at();
exception when duplicate_object then null; end $$;

alter table public.home_sections enable row level security;

drop policy if exists "public_read_home_sections" on public.home_sections;
create policy "public_read_home_sections"
on public.home_sections for select to anon, authenticated
using (is_active = true or public.is_admin());

drop policy if exists "admin_all_home_sections" on public.home_sections;
create policy "admin_all_home_sections"
on public.home_sections for all to authenticated
using (public.is_admin()) with check (public.is_admin());

grant select on public.home_sections to anon, authenticated;
grant insert, update, delete on public.home_sections to authenticated;

insert into public.home_sections (section_key, title, subtitle, section_type, item_limit, is_active, sort_order)
values
  ('featured', 'Sản phẩm nổi bật', 'Những lựa chọn được cửa hàng ưu tiên giới thiệu.', 'FEATURED', 10, true, 10),
  ('newest', 'Hàng mới lên kệ', 'Sản phẩm vừa được cập nhật gần đây.', 'NEWEST', 10, true, 20),
  ('best-price', 'Giá tốt hôm nay', 'Các sản phẩm đang có mức giảm đáng chú ý.', 'BEST_PRICE', 10, true, 30),
  ('recommended', 'Có thể bạn sẽ thích', 'Gợi ý thêm từ catalog đang hoạt động.', 'RECOMMENDED', 10, true, 40)
on conflict (section_key) do nothing;

-- Public bucket for banner / site media. Writes remain Admin-only through Storage RLS.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  6291456,
  array['image/jpeg','image/png','image/webp','image/gif']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "myshop_site_media_admin_insert" on storage.objects;
create policy "myshop_site_media_admin_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "myshop_site_media_admin_update" on storage.objects;
create policy "myshop_site_media_admin_update"
on storage.objects for update to authenticated
using (bucket_id = 'site-media' and public.is_admin())
with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "myshop_site_media_admin_delete" on storage.objects;
create policy "myshop_site_media_admin_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'site-media' and public.is_admin());
