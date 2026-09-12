# MyShop V0.8.0 — Customer Account

Production hiện tại: **https://bobebunne.vercel.app**

MyShop là web bán hàng hybrid gồm **Direct Order + Affiliate**. V0.8.0 hoàn thiện roadmap **Customer Account**: hồ sơ + địa chỉ mặc định, lịch sử đơn theo tài khoản, đồng bộ an toàn đơn guest từ trình duyệt và cấu hình Guest Checkout trong Admin.

## V0.8.0 có gì mới?

- `/account`:
  - cập nhật họ tên, số điện thoại;
  - lưu địa chỉ giao hàng mặc định: Tỉnh/Thành phố, Quận/Huyện, Phường/Xã, địa chỉ chi tiết;
  - KPI tổng đơn / đang xử lý / hoàn tất.
- `/account/orders`:
  - danh sách đơn theo `user_id`;
  - lọc theo trạng thái;
  - phân trang;
  - đồng bộ các đơn guest gần đây còn `order_code + access_token` trên thiết bị.
- `/account/orders/[id]`:
  - chi tiết sản phẩm;
  - snapshot thông tin nhận hàng;
  - tổng tiền;
  - timeline trạng thái.
- Direct Checkout tự điền hồ sơ + địa chỉ mặc định khi customer đã đăng nhập.
- `/admin/settings` cho phép bật/tắt **Require login for checkout**.
- Không tự liên kết đơn guest chỉ bằng số điện thoại/email; phải có access token ngẫu nhiên của chính đơn đó.

## Database migration

Nếu database production đang ở migration 007, chạy:

`supabase/migrations/202609120008_customer_account.sql`

Migration 008 bổ sung địa chỉ mặc định vào `profiles`, RPC `update_my_customer_profile(...)` và RPC `claim_recent_order(...)`.

## Admin routes

- `/admin` — Dashboard
- `/admin/products` — Catalog
- `/admin/orders` — Order Admin
- `/admin/affiliate` — Affiliate Analytics
- `/admin/settings` — Guest Checkout policy
- `/admin/audit` — Audit Log

## Version history

V0.1.0 Foundation → V0.2.0 Auth & Roles → V0.3.0 Catalog → V0.4.0 Home/Search → V0.5.0 Direct Checkout → V0.6.0 Order Admin → V0.6.1 Type Fix → V0.7.0 Affiliate & Hybrid → V0.7.1 Affiliate Redirect Type Fix → **V0.8.0 Customer Account**.

Next roadmap: **V0.9.0 — Hardening**.
