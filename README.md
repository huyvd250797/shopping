# MyShop V0.7.0 — Affiliate & Hybrid

Production: **https://bobebunne.vercel.app**

MyShop là web bán hàng hybrid gồm **Direct Order + Affiliate**. V0.7.0 hoàn thiện outbound affiliate tracking và analytics mà không thay đổi luồng Direct Checkout/Order Admin hiện có.

## V0.7.0 có gì mới?

- Affiliate CTA đi qua `/go/[slug]` thay vì mở URL đối tác trực tiếp.
- Redirect chỉ xảy ra khi sản phẩm:
  - đang `active`
  - chưa xóa mềm
  - mode là `AFFILIATE` hoặc `HYBRID`
  - URL là `http/https` hợp lệ
- Click được ghi vào `affiliate_clicks` trước khi redirect.
- Guest được gắn một session cookie ẩn danh để thống kê visitor và chống đếm trùng nhẹ.
- Cùng session/user bấm cùng sản phẩm trong 10 giây vẫn được redirect nhưng chỉ tính một click.
- Admin Analytics tại `/admin/affiliate`.
- Không lưu IP.
- Affiliate click **không phải order** và không được tính doanh thu nội bộ.

## Hybrid behavior

### DIRECT
CTA → `/checkout/[slug]` → tạo order nội bộ.

### AFFILIATE
CTA → `/go/[slug]` → validate + track → redirect website đối tác.

### HYBRID
Hiển thị đồng thời:
- CTA Direct → checkout nội bộ.
- CTA Affiliate → tracked outbound route.

## Nâng database

Nếu production đang ở V0.6.0/V0.6.1, chạy duy nhất:

`supabase/migrations/202608290007_affiliate_hybrid.sql`

Xem `DEPLOY.md` để test production.

## Admin routes

- `/admin` — Dashboard
- `/admin/products` — Catalog
- `/admin/orders` — Order Admin
- `/admin/affiliate` — Affiliate Analytics
- `/admin/audit` — Audit Log

## Version history

V0.1.0 Foundation → V0.2.0 Auth & Roles → V0.3.0 Catalog → V0.4.0 Home/Search → V0.5.0 Direct Checkout → V0.6.0 Order Admin → V0.6.1 Type Fix → **V0.7.0 Affiliate & Hybrid**.

Next roadmap: **V0.8.0 — Customer Account**.
