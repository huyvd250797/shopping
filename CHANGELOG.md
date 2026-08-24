# Changelog — MyShop

## V0.3.0 — Catalog & CMS Core — 2026-08-24

### Added
- Admin CRUD danh mục: tạo, sửa, sắp xếp, bật/tắt, xóa khi chưa được sử dụng.
- Admin CRUD sản phẩm với SKU, slug, giá, giá gạch, mô tả, category, badge, tags, Featured, stock cơ bản.
- Purchase Mode `DIRECT`, `AFFILIATE`, `HYBRID`.
- Affiliate URL, button label và secondary button label theo từng sản phẩm.
- Product status `draft / active / archived` + soft-delete/restore.
- Supabase Storage public bucket `product-images`; chỉ Admin được upload/update/delete qua RLS.
- Upload trực tiếp browser → Supabase Storage, tối đa 6 ảnh/lần, tối đa 5MB/ảnh, kiểm tra JPEG/PNG/WEBP/GIF.
- Gallery ảnh, đặt ảnh đại diện, xóa ảnh và dọn file Storage.
- Public catalog thật: Home, Category, Basic Search và Product Detail.
- CTA public thay đổi theo Purchase Mode.
- Admin catalog KPI và audit events cho thay đổi catalog.
- Migration `202608240003_catalog_cms.sql`.

### Changed
- Version app lên `0.3.0`.
- Home không còn dùng `foundation-preview` cho catalog.
- Hướng dẫn deploy dùng domain production `https://bobebunne.vercel.app` làm URL chính.

### Security
- Catalog write tiếp tục yêu cầu Admin role bằng server guard + Supabase RLS.
- Storage write policy gọi `public.is_admin()`; public chỉ dùng URL bucket để đọc ảnh.
- Upload giới hạn MIME và kích thước; path file sinh ngẫu nhiên theo product UUID.
- Soft-delete sản phẩm giữ dữ liệu phục vụ order history tương lai.

### Known Scope Limits
- Banner/Home section CMS nâng cao: V0.4.0.
- Filter/sort catalog nâng cao: V0.4.0.
- Direct checkout tạo order thật: V0.5.0.
- Order Admin: V0.6.0.
- Affiliate click tracking: V0.7.0.

## V0.2.0 — Auth & Roles — 2026-08-24
- Customer signup/login/logout, email confirmation, password recovery.
- Protected Account + profile RPC allow-list.
- Customer own-order RLS foundation.
- Admin role guard preserved.

## V0.1.0 — Foundation — 2026-08-24
- Next.js/TypeScript/Supabase foundation, schema, Admin bootstrap, responsive shell.
