# QA — MyShop V1.0.0 Production Ready

## Kết quả kiểm tra khi đóng gói

- `npm run qa:hardening`: **22 PASS / 0 FAIL**.
- `npm run qa:production`: **22 PASS / 0 FAIL**.
- TypeScript/TSX syntax scan bằng TypeScript parser: **102 files / 0 syntax errors**.
- Internal `@/` import resolution scan: **102 files / 0 missing imports**.
- `npm install --no-audit --no-fund`: môi trường đóng gói bị timeout nên **chưa xác nhận full `typecheck/lint/build` bằng dependency thực tế**.

Vì vậy trước production deploy vẫn bắt buộc chạy đầy đủ:

```bash
npm install
npm run qa:hardening
npm run qa:production
npm run typecheck
npm run lint
npm run build
```

## Runtime production checks

Sau deploy, `/api/health` và `/admin/system` là hai điểm kiểm tra app/database cùng phiên bản. Health chỉ trả key + boolean, không expose URL/key/error detail. Admin System page hiển thị chi tiết hơn nhưng nằm sau Admin guard.

## Manual smoke test

Dùng `PRODUCTION_QA_CHECKLIST.md` để kiểm tra Auth, Catalog, Direct Checkout, Customer Account, Order Admin, Affiliate, SEO, mobile/accessibility, backup và logs.

## Backup

`npm run backup:db` cần `SUPABASE_DB_URL` cùng `pg_dump`; `npm run backup:verify -- <file>` cần `pg_restore`. Backup catalog verification không thay thế restore drill trên staging.
