# MyShop V0.5.0 — Direct Checkout

MyShop là web app bán hàng hybrid: **Affiliate / Direct Order / Hybrid**. V0.5.0 kế thừa Auth/Roles + Catalog/CMS + Home/Search và bổ sung luồng đặt hàng trực tiếp end-to-end.

Production domain: **https://bobebunne.vercel.app**

## Version history

- ✅ V0.1.0 — Foundation
- ✅ V0.2.0 — Auth & Roles
- ✅ V0.3.0 — Catalog & CMS Core
- ✅ V0.4.0 — Home & Search UX
- ✅ **V0.5.0 — Direct Checkout (current)**
- ➡️ V0.6.0 — Order Admin

## V0.5.0 đã build

### Guest + Customer checkout
- Guest không cần đăng nhập nếu `require_login_for_checkout=false` (seed mặc định).
- Customer đã đăng nhập được prefill tên/SĐT/email và order tự gắn `user_id`.
- Chỉ sản phẩm `DIRECT` hoặc `HYBRID` được checkout nội bộ.
- Sản phẩm hết kho bị chặn theo `track_stock/stock_qty`.

### Checkout flow
1. `/checkout/[product]` đọc sản phẩm active từ Supabase.
2. Khách nhập thông tin giao hàng + số lượng.
3. Draft tự lưu trong `localStorage` để refresh không mất dữ liệu.
4. Bước Review cho khách xác nhận lại.
5. Server Action validate dữ liệu rồi gọi PostgreSQL RPC.
6. RPC tự đọc lại giá/tồn kho/mode từ database.
7. RPC tạo `orders + order_items + order_status_history` trong một transaction.
8. Trả mã đơn dạng `ORD-YYYYMMDD-XXXXXX` + `access_token`.
9. Trang Success đọc receipt bằng `order_code + access_token`.
10. Trình duyệt lưu tối đa 20 đơn gần đây để `/orders` xem lại.

## Chống tạo đơn trùng

Mỗi draft có `checkout_request_id` UUID. Database có unique index và RPC idempotent: nếu cùng request được submit lại, hệ thống trả lại order đã tạo thay vì INSERT order thứ hai.

## Nguyên tắc bảo mật

- Client **không** gửi `price`, `subtotal`, `total` đáng tin cậy.
- Database đọc `products.price` và tự tính lại toàn bộ.
- Client không có generic INSERT policy vào `orders`.
- Guest receipt không được lookup chỉ bằng `order_code`; cần `access_token` UUID riêng.
- `access_token` chỉ lưu trong URL receipt và local history trên thiết bị của khách.
- localStorage không phải source of truth; Admin đọc order từ database.

## Database — nâng từ V0.4.0

Nếu Supabase production đã có migration 001 → 004, **chỉ chạy thêm**:

`supabase/migrations/202608250005_direct_checkout.sql`

Migration 005 sẽ:
- thêm `orders.checkout_request_id`;
- thêm `orders.access_token`;
- unique indexes chống duplicate/lookup token;
- tạo RPC `create_direct_order` cho anon + authenticated;
- tạo RPC `get_order_receipt` token-gated.

Database mới hoàn toàn: chạy 001 → 002 → 003 → 004 → 005 → `supabase/seed.sql`.

## Environment Variables — production

```env
NEXT_PUBLIC_SITE_URL=https://bobebunne.vercel.app
NEXT_PUBLIC_SHOP_NAME=MyShop
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxx
ADMIN_SEED_EMAIL=your-admin-email
ADMIN_SEED_PASSWORD=your-strong-password
ADMIN_SEED_NAME=Administrator
```

`SUPABASE_SECRET_KEY` chỉ dùng cho bootstrap Admin script; V0.5.0 checkout không cần service/secret key để tạo order.

## Supabase Auth URL

- Site URL: `https://bobebunne.vercel.app`
- Redirect URL: `https://bobebunne.vercel.app/auth/callback`

## Test production V0.5.0

1. Chạy migration `202608250005_direct_checkout.sql` trong Supabase SQL Editor.
2. Deploy V0.5.0 lên Vercel.
3. Tạo/đảm bảo có một sản phẩm `DIRECT`, `ACTIVE`, có `price`.
4. Logout hoàn toàn rồi mở sản phẩm → **Mua ngay**.
5. Nhập form → Review → **Xác nhận đặt hàng**.
6. Kiểm tra trang success có mã `ORD-...` và receipt đúng.
7. Mở `/orders` trên cùng trình duyệt → đơn phải xuất hiện.
8. Refresh success/history → receipt vẫn mở bằng token.
9. Login Customer và đặt thêm một đơn → kiểm tra `orders.user_id` được gắn user hiện tại.
10. Thử double-click / submit lại khi mạng chậm → chỉ một `checkout_request_id`/order được tạo.
11. Đổi giá sản phẩm trước submit cuối → total order phải lấy giá mới từ database, không lấy subtotal UI cũ.
12. Với sản phẩm `track_stock=true`, đặt quantity lớn hơn stock → phải bị chặn.

## Build / deploy

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Vercel:
- Framework Preset: Next.js
- Output Directory: để trống
- Build Command: `npm run build` hoặc mặc định

## Ranh giới version

V0.5.0 **đã tạo đơn thật**. Màn hình Admin quản lý order list/detail, search/filter, đổi trạng thái, internal note và timeline vận hành đầy đủ được triển khai ở **V0.6.0 — Order Admin**.
