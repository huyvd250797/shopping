# Deploy — MyShop V0.4.0

Production: `https://bobebunne.vercel.app`

## 1. Migration

Database đang ở V0.3.0: chạy **duy nhất file mới** trong Supabase SQL Editor:

`supabase/migrations/202608240004_home_search_ux.sql`

Database mới: chạy 001 → 002 → 003 → 004 → seed.

## 2. Auth URL

Supabase → Authentication → URL Configuration:
- Site URL: `https://bobebunne.vercel.app`
- Redirect URL: `https://bobebunne.vercel.app/auth/callback`

## 3. Vercel env

```env
NEXT_PUBLIC_SITE_URL=https://bobebunne.vercel.app
NEXT_PUBLIC_SHOP_NAME=MyShop
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxx
```

Có thể dùng legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` nếu project của bạn vẫn dùng key cũ.

## 4. Vercel build

- Framework: Next.js
- Install: mặc định `npm install`
- Build: `npm run build`
- Output Directory: **để trống**

Sau khi thêm migration hoặc env, Redeploy project.

## 5. Smoke test

- `/` load banner + Home sections.
- `/admin/banners` tạo/sửa/banner upload được.
- `/search` filter/sort/pagination hoạt động.
- `/category/[slug]` sort/pagination hoạt động.
- Mobile header/category strip/product grid không tràn ngang.
