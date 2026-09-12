# Deploy MyShop V0.9.0 — Hardening

Production domain: **https://bobebunne.vercel.app**

## 1. Nâng database từ V0.8.0

Trong **Supabase → SQL Editor**, chạy toàn bộ file:

`supabase/migrations/202609120009_hardening.sql`

Chỉ chạy migration 009 sau khi database đã có 001 → 008.

Migration 009:
- revoke runtime CREATE trên schema `public`;
- harden `is_admin()` và `handle_new_user()` bằng `search_path=''`;
- thêm indexes cho My Orders và catalog filter/sort;
- reassert unique index `checkout_request_id` để chống duplicate order.

## 2. Environment Variables trên Vercel

```env
NEXT_PUBLIC_SITE_URL=https://bobebunne.vercel.app
NEXT_PUBLIC_SHOP_NAME=MyShop
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

Không có biến môi trường mới bắt buộc cho V0.9.0.

## 3. Kiểm tra trước deploy

```bash
npm install
npm run qa:hardening
npm run typecheck
npm run lint
npm run build
```

## 4. Deploy source

Push source lên GitHub/Vercel theo quy trình hiện tại. Không cấu hình Output Directory thành `out`; để Next.js/Vercel dùng `.next` mặc định.

## 5. Smoke test V0.9.0

1. Home, Search, Category, Product hoạt động bình thường.
2. Đăng nhập customer/admin và kiểm tra redirect `next` chỉ đi nội bộ.
3. Double-click Direct Checkout và retry sau timeout chỉ tạo 1 order.
4. Ngắt network/Supabase test để xác nhận error state + Retry.
5. Kiểm tra `/robots.txt`, `/sitemap.xml`, canonical product/category.
6. Dùng keyboard Tab kiểm tra skip link/focus ring.
7. Test mobile Safari/Chrome: input không auto-zoom bất thường.
8. Admin Order/Affiliate/Customer Account regression test theo `HARDENING_TEST_PLAN.md`.

## 6. Sau deploy

Kiểm tra response headers production, error logs Vercel/Supabase và xác nhận không có blocker trước khi nâng **V1.0.0 Production Ready**.
