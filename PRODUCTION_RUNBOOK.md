# MyShop V1.0.0 — Production Runbook

Tài liệu này dùng cho deploy, backup, xử lý sự cố và rollback production.

## 1. Trước deploy

- Chốt commit/tag V1.0.0; không deploy source chưa qua `qa:hardening`, `qa:production`, typecheck, lint và build.
- Kiểm tra Vercel Environment Variables theo `.env.example`.
- Tạo database backup trước migration 010.
- Kiểm tra Supabase Auth Site URL/Redirect URLs trùng domain production.

## 2. Backup

### Tạo backup thủ công

Máy chạy backup cần PostgreSQL client tools và biến `SUPABASE_DB_URL` server-only:

```bash
npm run backup:db
```

Script tạo custom-format dump trong `backups/`. Thư mục này bị `.gitignore`; không commit backup production.

### Verify backup

```bash
npm run backup:verify -- "backups/<file>.dump"
```

Verify catalog không thay thế restore test. Tối thiểu định kỳ restore một backup gần nhất vào database staging/sandbox rồi kiểm tra các bảng `orders`, `order_items`, `products`, `profiles`, `site_settings`.

### Lưu giữ

- Không lưu backup production công khai hoặc trong Git.
- Ưu tiên storage mã hóa và quyền truy cập tối thiểu.
- Retention cụ thể phụ thuộc chính sách vận hành; phải có ít nhất một bản trước migration/release quan trọng.

## 3. Migration / Release

1. Backup + verify.
2. Chạy migration `202609120010_production_ready.sql`.
3. Deploy V1.0.0.
4. Kiểm tra `/api/health` và `/admin/system`.
5. Chạy smoke test trong `PRODUCTION_QA_CHECKLIST.md`.
6. Ghi commit/tag, thời gian deploy và người thực hiện vào hệ thống quản lý thay đổi nội bộ nếu có.

## 4. Logging / quan sát lỗi

Server logs là JSON một dòng, có các trường `ts`, `level`, `event`, `app`, `version`. Logger tự redact các key nhạy cảm phổ biến. Không đưa password, token, cookie, full email/phone/address vào custom context mới.

Event V1.0.0 hiện có:
- `checkout_order_created`
- `checkout_create_order_failed`
- `affiliate_redirect_unavailable`
- `affiliate_redirect_failed`

Dùng Vercel/Supabase logs để điều tra; audit nghiệp vụ Admin vẫn nằm trong `admin_audit_logs`.

## 5. Rollback

Nếu lỗi chỉ ở source và migration 010 đã chạy thành công, migration 010 chủ yếu release marker/default/index nên có thể rollback source về V0.9.0 mà không cần xóa dữ liệu ngay. Nếu lỗi liên quan dữ liệu/migration, dừng thao tác ghi quan trọng, đánh giá phạm vi trước khi restore backup. Không restore đè production khi chưa xác định rõ thời điểm và dữ liệu sẽ mất.

## 6. Health incident

- `/api/health` 503 + `supabase_env=false`: kiểm tra Vercel env và redeploy.
- `database=false`: kiểm tra Supabase project/status/network/RLS.
- `release_marker=false`: app và DB lệch version; chạy đúng migration hoặc rollback source đồng bộ.
- `site_url=false`: sửa `NEXT_PUBLIC_SITE_URL` thành HTTPS production URL và redeploy.
