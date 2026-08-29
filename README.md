# MyShop V0.6.1 — Order Admin Type Fix

MyShop là web app bán hàng hybrid: **Affiliate / Direct Order / Hybrid**. V0.6.1 là bản vá production của Order Admin V0.6.0, sửa lỗi TypeScript khi deploy và giữ nguyên toàn bộ nghiệp vụ/database.

Production domain: **https://bobebunne.vercel.app**

## Version history

- ✅ V0.1.0 — Foundation
- ✅ V0.2.0 — Auth & Roles
- ✅ V0.3.0 — Catalog & CMS Core
- ✅ V0.4.0 — Home & Search UX
- ✅ V0.5.0 — Direct Checkout
- ✅ V0.6.0 — Order Admin
- ✅ **V0.6.1 — Order Admin Type Fix (current)**
- ➡️ V0.7.0 — Affiliate & Hybrid

## V0.6.1 đã build

### Order list + filter
- Search theo mã đơn, tên khách hoặc số điện thoại.
- Filter theo trạng thái đơn.
- Filter Guest / Customer có tài khoản.
- Filter theo khoảng ngày tạo đơn.
- Pagination 20 đơn/trang.
- KPI: Đơn mới / Đang xử lý / Hoàn tất / Đã hủy.

### Order detail
- Thông tin khách hàng + địa chỉ snapshot.
- Copy mã đơn, SĐT và địa chỉ nhanh.
- Danh sách item + giá snapshot tại thời điểm đặt.
- Tổng tiền, thời gian tạo/cập nhật.
- Ghi chú của khách.
- Ghi chú nội bộ chỉ Admin thấy.

### Status workflow
Workflow V0.6.0:

`NEW → CONFIRMED → PROCESSING → SHIPPING → COMPLETED → ARCHIVED`

Có thể chuyển sang `CANCELLED` từ `NEW / CONFIRMED / PROCESSING / SHIPPING`, sau đó `CANCELLED → ARCHIVED`.

- Không cho đi ngược workflow.
- `ARCHIVED` là trạng thái kết thúc.
- Hủy đơn bắt buộc nhập lý do.
- Mỗi lần đổi trạng thái tạo `order_status_history`.
- Mỗi lần đổi trạng thái tạo `admin_audit_logs`.

### Internal note + audit
- Admin lưu `orders.internal_note` tối đa 2.000 ký tự.
- Thay đổi internal note được audit.
- `/admin/audit` hiển thị audit log gần nhất và link về order tương ứng.
- Chi tiết order hiển thị cả timeline nghiệp vụ và audit vận hành.

## Kiến trúc bảo mật V0.6.0

V0.6.0 không cập nhật order trực tiếp từ form Admin.

Hai RPC chính:

- `admin_transition_order(...)`
- `admin_update_order_internal_note(...)`

Cả hai:
- `SECURITY DEFINER`;
- pin `search_path`;
- yêu cầu `auth.uid()` có role Admin;
- chỉ cấp `EXECUTE` cho `authenticated`;
- cập nhật dữ liệu + history/audit trong cùng transaction.

Migration 006 cũng bỏ generic Admin write policy trực tiếp trên `orders`, `order_items`, `order_status_history`; Admin chỉ SELECT các bảng này qua Data API, mutation nghiệp vụ dùng RPC.

## Database — nâng từ V0.5.0

Nếu Supabase production đã có migration 001 → 005, **chỉ chạy thêm**:

`supabase/migrations/202608290006_order_admin.sql`

Migration 006 sẽ:
- thêm index phục vụ audit/order list;
- siết write policy order operational tables;
- tạo RPC `admin_transition_order`;
- tạo RPC `admin_update_order_internal_note`.

Database mới hoàn toàn: chạy 001 → 002 → 003 → 004 → 005 → 006 → `supabase/seed.sql`.

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

`SUPABASE_SECRET_KEY` là server-only; không đưa vào biến `NEXT_PUBLIC_*`.

## Supabase Auth URL

- Site URL: `https://bobebunne.vercel.app`
- Redirect URL: `https://bobebunne.vercel.app/auth/callback`

## Test production V0.6.0

1. Chạy migration `202608290006_order_admin.sql` trong Supabase SQL Editor.
2. Deploy V0.6.1 lên Vercel.
3. Đăng nhập Admin tại `https://bobebunne.vercel.app/admin/login`.
4. Mở `/admin/orders` và thử search/filter.
5. Mở một đơn `NEW` → chuyển `CONFIRMED`.
6. Kiểm tra timeline xuất hiện `NEW → CONFIRMED`.
7. Kiểm tra Audit vận hành xuất hiện `order_status_changed`.
8. Tiếp tục `CONFIRMED → PROCESSING → SHIPPING → COMPLETED → ARCHIVED`.
9. Với một đơn khác, chọn `CANCELLED` mà không nhập lý do → phải bị chặn.
10. Nhập lý do → hủy thành công → timeline/audit phải có row.
11. Sửa ghi chú nội bộ → lưu → reload vẫn còn và audit có action tương ứng.
12. Logout Customer/Guest không thể gọi RPC Order Admin thành công.

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

V0.6.0 hoàn thiện **Direct Order Admin**. Affiliate outbound tracking và behavior `AFFILIATE/HYBRID` đầy đủ được triển khai ở **V0.7.0 — Affiliate & Hybrid**.
