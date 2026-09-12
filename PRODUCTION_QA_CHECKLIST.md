# MyShop V1.0.0 — Production QA Checklist

## A. Automated gates

- [ ] `npm run qa:hardening`
- [ ] `npm run qa:production`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`

## B. Environment / System

- [ ] `NEXT_PUBLIC_SITE_URL` là domain HTTPS production.
- [ ] Supabase URL + publishable key đúng production project.
- [ ] `/api/health` trả HTTP 200 và `version=1.0.0`.
- [ ] `/admin/system` tất cả checks PASS.
- [ ] Database `app_release` là `1.0.0` sau migration 010.

## C. Auth / quyền

- [ ] Customer signup/login/logout/reset password hoạt động.
- [ ] Customer không mở được Admin.
- [ ] Customer chỉ đọc profile/order của chính mình.
- [ ] Admin login và toàn bộ Admin route guard hoạt động.

## D. Catalog / Home / SEO

- [ ] Home/banner/category/search/product tải đúng dữ liệu production.
- [ ] Hidden/deleted product không public.
- [ ] Product AFFILIATE/DIRECT/HYBRID hiển thị CTA đúng.
- [ ] `/robots.txt`, `/sitemap.xml`, canonical và OpenGraph dùng domain production.

## E. Checkout / Orders

- [ ] Direct Checkout validation client + server đúng.
- [ ] Server re-price order; không tin total từ client.
- [ ] Double-click Submit chỉ tạo một order.
- [ ] Retry cùng checkout request không tạo duplicate.
- [ ] Guest checkout theo setting; login-required redirect đúng.
- [ ] Customer My Orders + order detail đúng scope.
- [ ] Admin filter/search/order detail hoạt động.
- [ ] Status transition, cancel reason, internal note và audit history đúng.

## F. Affiliate

- [ ] Outbound link chỉ http/https hợp lệ.
- [ ] Affiliate click tracking ghi nhận; click không tạo internal order.
- [ ] Link hỏng/thiếu URL quay về product với fallback an toàn.

## G. Backup / observability

- [ ] Có backup trước go-live/migration.
- [ ] `npm run backup:verify -- <file>` đọc được catalog backup.
- [ ] Đã thử restore định kỳ trên staging/sandbox theo runbook.
- [ ] Vercel logs có event JSON V1.0.0.
- [ ] Logs không chứa password/token/cookie/full email/phone/address.

## H. Mobile / accessibility

- [ ] iPhone Safari và Android Chrome không auto-zoom input bất thường.
- [ ] Sticky header/CTA không che nội dung.
- [ ] Keyboard Tab/focus/skip link hoạt động.
- [ ] Error/loading/empty states đọc hiểu được.
