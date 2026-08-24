# Changelog

## V0.4.0 — Home & Search UX — 2026-08-24

### Added
- Banner CMS thật tại `/admin/banners`.
- Upload/replace ảnh banner trực tiếp lên Supabase Storage bucket `site-media`.
- Lịch hiển thị banner theo `starts_at` / `ends_at`.
- `home_sections` database: Featured, Newest, Best Price, Recommended.
- Admin bật/tắt, đổi title/subtitle/type/item limit/sort order của Home sections.
- Home đọc banner, category và section thật từ Supabase.
- Search filter: keyword, category, price range, Purchase Mode.
- Sort: relevant, newest, price ascending, price descending.
- Pagination 24 sản phẩm/trang, trạng thái filter nằm trong URL.
- Mobile category navigation dưới header.
- Skeleton loading, empty state, route error state.

### Changed
- Product card được polish theo hướng marketplace, có short description/stock/meta trên desktop.
- Category page có sort + pagination.
- Admin Dashboard cập nhật KPI Home CMS.
- Package/version nâng lên 0.4.0.

### Security / Data
- `site-media` Storage write được bảo vệ bằng `public.is_admin()`.
- Public chỉ đọc `home_sections` active; Admin mới có quyền ghi.
- Banner schedule được lọc ở server khi render Home.

### Known scope boundary
- V0.4.0 chưa tạo order Direct. Direct Checkout end-to-end nằm ở V0.5.0.
- Affiliate click tracking vẫn nằm ở V0.7.0.

## V0.3.0 — Catalog & CMS Core — 2026-08-24
- Admin CRUD danh mục/sản phẩm, Purchase Mode, soft-delete/restore.
- Supabase Storage `product-images`, gallery/thumbnail.
- Public Home/Category/Search cơ bản/Product Detail đọc Catalog thật.

## V0.2.0 — Auth & Roles — 2026-08-24
- Customer signup/login/logout, email confirmation, password recovery.
- Protected Account + profile RPC allow-list.
- Customer own-order RLS foundation, Admin guard.

## V0.1.0 — Foundation — 2026-08-24
- Next.js/TypeScript/Supabase foundation, schema, Admin bootstrap, responsive shell.
