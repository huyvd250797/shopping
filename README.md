# MyShop V1.0.0 — Production Ready

Production hiện tại: **https://bobebunne.vercel.app**

MyShop là web bán hàng hybrid **Direct Order + Affiliate**. V1.0.0 hoàn tất roadmap trước production: giữ nguyên business flow V0.9.0, bổ sung health/readiness, structured logging, database release marker, backup tooling/runbook và final QA để vận hành thật.

## V1.0.0 có gì mới?

- **Production health & readiness**
  - `GET /api/health` trả trạng thái app/database không lộ secret;
  - Admin `/admin/system` kiểm tra production URL, Supabase, DB connectivity, migration/release marker và runtime mode;
  - migration 010 ghi `app_release=1.0.0` để app và DB xác nhận cùng phiên bản.
- **Observability**
  - structured JSON logger cho server runtime;
  - tự redact password/token/cookie/email/phone/address/note;
  - checkout failure/success và affiliate redirect failure có event rõ để tra Vercel logs.
- **Backup / Recovery**
  - `npm run backup:db` tạo PostgreSQL custom-format dump bằng `pg_dump`;
  - `npm run backup:verify -- "backups/<file>.dump"` kiểm tra catalog bằng `pg_restore --list`;
  - `PRODUCTION_RUNBOOK.md` mô tả backup, restore drill và rollback.
- **Release QA**
  - `npm run qa:production` kiểm tra release metadata, migration, health route, logger redaction, Admin System page, docs và secret boundary;
  - `PRODUCTION_QA_CHECKLIST.md` dùng cho smoke test trước/sau deploy.
- **Operational defaults**
  - migration 010 bảo toàn cấu hình đang có, chỉ seed default khi thiếu;
  - thêm index cho audit/affiliate event theo thời gian.

## Database migration

Nếu production đang ở V0.9.0 / migration 009, chạy:

`supabase/migrations/202609120010_production_ready.sql`

Migration 010 idempotent và không reset business data.

## QA trước deploy

```bash
npm install
npm run qa:hardening
npm run qa:production
npm run typecheck
npm run lint
npm run build
```

Sau deploy mở `/admin/system` và `/api/health` để xác nhận app/database cùng V1.0.0.

## Backup trước migration/deploy

Máy chạy backup cần PostgreSQL client tools (`pg_dump`, `pg_restore`) và `SUPABASE_DB_URL`:

```bash
npm run backup:db
npm run backup:verify -- "backups/myshop-YYYY-MM-DDTHH-MM-SS.dump"
```

Không commit backup production hoặc connection string vào repository.

## Admin routes

- `/admin` — Dashboard
- `/admin/products` — Catalog
- `/admin/orders` — Order Admin
- `/admin/affiliate` — Affiliate Analytics
- `/admin/settings` — Site/Guest Checkout settings
- `/admin/system` — Production/System Readiness
- `/admin/audit` — Audit Log

## Version history

V0.1 Foundation → V0.2 Auth → V0.3 Catalog → V0.4 Home/Search → V0.5 Checkout → V0.6 Order Admin → V0.7 Affiliate → V0.8 Customer Account → V0.9 Hardening → **V1.0.0 Production Ready**.

Backlog kế tiếp: **V1.1 — Multi-item Direct Cart + shipping fee logic**.
