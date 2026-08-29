# Deploy MyShop V0.6.0 — Production

Domain: **https://bobebunne.vercel.app**

## 1. Nâng database

Supabase → SQL Editor → chạy toàn bộ:

`supabase/migrations/202608290006_order_admin.sql`

Chỉ chạy migration 006 nếu production đã có V0.1 → V0.5.

## 2. Vercel Environment Variables

```env
NEXT_PUBLIC_SITE_URL=https://bobebunne.vercel.app
NEXT_PUBLIC_SHOP_NAME=MyShop
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

Nếu còn dùng script bootstrap Admin, giữ `SUPABASE_SECRET_KEY` ở server-only.

## 3. Deploy

Push source lên GitHub/Vercel theo quy trình hiện tại. Không cấu hình Output Directory thành `out`; để Next.js/Vercel dùng `.next` mặc định.

## 4. Smoke test Order Admin

- Đăng nhập `/admin/login`.
- `/admin/orders` tải danh sách đơn.
- Search mã đơn/tên/SĐT hoạt động.
- Filter trạng thái, Guest/Customer, ngày hoạt động.
- NEW → CONFIRMED thành công.
- Timeline có history mới.
- `/admin/audit` có audit mới.
- Hủy đơn không có lý do bị chặn.
- Lưu internal note thành công.
- Customer không truy cập `/admin` và không gọi RPC Admin được.
