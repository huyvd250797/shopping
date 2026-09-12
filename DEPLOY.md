# Deploy MyShop V1.0.0 — Production Ready

Production domain hiện tại: **https://bobebunne.vercel.app**

## 0. Tạo backup trước khi migration

Khuyến nghị tạo backup database và verify file trước mọi production migration:

```bash
# local/CI only; cần SUPABASE_DB_URL + pg_dump/pg_restore
npm run backup:db
npm run backup:verify -- "backups/<backup-file>.dump"
```

Xem thêm `PRODUCTION_RUNBOOK.md`.

## 1. Nâng database từ V0.9.0

Trong **Supabase → SQL Editor**, chạy toàn bộ file:

`supabase/migrations/202609120010_production_ready.sql`

Chỉ chạy migration 010 sau khi database đã có 001 → 009.

Migration 010:
- ghi public release marker `app_release = 1.0.0` cho health/readiness;
- seed các setting nền nếu thiếu nhưng không ghi đè setting vận hành hiện tại;
- thêm index newest-first cho audit log và affiliate click.

## 2. Environment Variables trên Vercel

```env
NEXT_PUBLIC_SITE_URL=https://bobebunne.vercel.app
NEXT_PUBLIC_SHOP_NAME=MyShop
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

`SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` không được expose ra client. `SUPABASE_DB_URL` chỉ cần trên máy/CI chạy backup, không bắt buộc cho Vercel runtime.

## 3. Final QA trước deploy

```bash
npm install
npm run qa:hardening
npm run qa:production
npm run typecheck
npm run lint
npm run build
```

Không deploy nếu bất kỳ lệnh nào fail.

## 4. Deploy source

Push source lên GitHub/Vercel theo quy trình hiện tại. Không cấu hình Output Directory thành `out`; để Next.js/Vercel dùng `.next` mặc định.

## 5. Smoke test sau deploy

1. Mở `/api/health`: production phải trả HTTP 200, `status=ok`, `version=1.0.0`.
2. Vào `/admin/system`: tất cả production checks phải PASS.
3. Home, Search, Category, Product hoạt động.
4. Đăng ký/login/logout/reset password customer; Admin login/guard đúng.
5. Direct Checkout tạo đúng một order; double-click/retry không duplicate.
6. Customer My Orders chỉ thấy đơn của chính mình.
7. Admin chuyển status + internal note + audit log đúng.
8. Affiliate redirect chạy đúng và click được tracking.
9. `/robots.txt`, `/sitemap.xml`, canonical/OG đúng production URL.
10. Kiểm tra Vercel logs có structured events nhưng không lộ PII/secret.

## 6. Go-live

- Xác nhận backup gần nhất có thể đọc bằng `pg_restore --list`.
- Xác nhận domain/HTTPS và Supabase Redirect URLs.
- Xác nhận ít nhất một Admin thật, đổi/rotate bootstrap password.
- Xác nhận sản phẩm/banner/settings production không còn dữ liệu test ngoài ý muốn.
- Lưu thời điểm deploy và commit/tag release V1.0.0.
