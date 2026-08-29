# Changelog

## V0.5.0 — Direct Checkout — 2026-08-25

### Added
- Guest checkout end-to-end cho sản phẩm `DIRECT` và nhánh Direct của `HYBRID`.
- Form giao hàng: họ tên, SĐT, email optional, tỉnh/thành, quận/huyện, phường/xã, địa chỉ, ghi chú, số lượng.
- Bước review/xác nhận trước khi tạo đơn.
- PostgreSQL RPC `create_direct_order` chạy atomic và `SECURITY DEFINER`.
- Server/database tự đọc lại giá sản phẩm và tính subtotal/total; client total không được tin cậy.
- `checkout_request_id` unique để chống tạo duplicate khi submit lại/mạng chậm.
- `access_token` riêng cho mỗi order và RPC `get_order_receipt` để Guest xem receipt an toàn.
- Trang `/order/success/[code]` hiển thị receipt thật từ database khi có token hợp lệ.
- Lưu draft checkout và recent order history vào localStorage.
- Route `/orders` để Guest xem lại đơn gần đây trên đúng trình duyệt.
- Customer đã đăng nhập được tự động gắn `user_id` vào order qua `auth.uid()`.

### Changed
- Header “Đơn hàng” chuyển sang `/orders` để Guest không bị ép login.
- DIRECT hết tồn kho sẽ không còn CTA đặt hàng; HYBRID vẫn giữ Affiliate CTA nếu có.
- Package/version nâng lên 0.5.0.

### Security / Data
- Anon/Customer không có generic INSERT policy vào `orders`; tạo đơn chỉ qua validated RPC.
- Guest receipt không tra cứu chỉ bằng order code; bắt buộc `access_token` UUID bí mật.
- Database vẫn là source of truth; localStorage chỉ lưu draft và token/history tiện ích.

### Known scope boundary
- `/admin/orders` và detail đã có read-only để kiểm tra đơn capture; workflow chỉnh trạng thái đầy đủ thuộc V0.6.0.
- Đồng bộ My Orders UX nâng cao theo account vẫn thuộc V0.8.0.

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
