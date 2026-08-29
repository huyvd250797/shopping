# Deploy MyShop V0.5.0 — Production

Domain: **https://bobebunne.vercel.app**

## 1. Nâng database

Supabase → SQL Editor → chạy toàn bộ:

`supabase/migrations/202608250005_direct_checkout.sql`

Chỉ chạy migration 005 nếu production đã có V0.1 → V0.4.

## 2. Kiểm tra Site Setting

`require_login_for_checkout` trong `public.site_settings` nên là `false` nếu muốn Guest đặt hàng không cần login.

SQL kiểm tra:

```sql
select key, value from public.site_settings where key = 'require_login_for_checkout';
```

## 3. Vercel Environment Variables

```env
NEXT_PUBLIC_SITE_URL=https://bobebunne.vercel.app
NEXT_PUBLIC_SHOP_NAME=MyShop
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

Admin bootstrap secret giữ server-only nếu bạn còn dùng script seed Admin.

## 4. Deploy

Push source lên GitHub/Vercel hoặc upload theo quy trình hiện tại. Không cấu hình Output Directory thành `out`; để Next.js/Vercel dùng `.next` mặc định.

## 5. Smoke test production

- Guest đặt một DIRECT order.
- Receipt mở đúng bằng token.
- `/orders` thấy recent order.
- Supabase `orders`, `order_items`, `order_status_history` có row tương ứng.
- Đặt lại cùng request không tạo order trùng.
- Customer login đặt order → `user_id` khác null.
