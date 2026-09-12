# Deploy MyShop V0.8.0 — Customer Account

Production domain: **https://bobebunne.vercel.app**

## 1. Nâng database từ V0.7.x

Trong **Supabase → SQL Editor**, chạy toàn bộ file:

`supabase/migrations/202609120008_customer_account.sql`

Chỉ chạy migration 008 khi database production đã có migration 001 → 007.

Migration 008 bổ sung:
- `profiles.province`
- `profiles.district`
- `profiles.ward`
- `profiles.address_line`
- RPC `update_my_customer_profile(...)`
- RPC `claim_recent_order(...)`

## 2. Environment Variables trên Vercel

```env
NEXT_PUBLIC_SITE_URL=https://bobebunne.vercel.app
NEXT_PUBLIC_SHOP_NAME=MyShop
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

Không có biến môi trường mới bắt buộc cho V0.8.0.

## 3. Deploy source

Push source lên GitHub/Vercel theo quy trình hiện tại. Không cấu hình Output Directory thành `out`; để Vercel/Next.js dùng `.next` mặc định.

## 4. Smoke test Customer Account

1. Đăng nhập customer → `/account`.
2. Lưu họ tên, SĐT và địa chỉ mặc định.
3. Mở Direct Checkout → các trường profile/address phải tự điền.
4. Tạo đơn khi đang đăng nhập → đơn xuất hiện tại `/account/orders`.
5. Mở chi tiết đơn → items, tổng tiền, địa chỉ snapshot và timeline phải đúng.
6. Đăng xuất, tạo một guest order (nếu Guest Checkout bật), rồi đăng nhập lại cùng trình duyệt → `/account/orders` phải đồng bộ đơn guest bằng token trình duyệt.
7. Vào `/admin/settings`, bật **Bắt buộc đăng nhập** → guest mở checkout phải bị chuyển sang Login rồi quay lại checkout.
8. Tắt lại → guest checkout hoạt động bình thường.

## 5. Security check

- Customer A không mở được `/account/orders/[id]` của Customer B.
- Không có API/RPC nào claim đơn bằng số điện thoại/email đơn thuần.
- `claim_recent_order` chỉ chạy cho authenticated user và yêu cầu đúng `order_code + access_token`.
- Customer update profile không được phép sửa `role` hoặc `email`.
