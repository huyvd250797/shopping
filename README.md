# MyShop V0.9.0 — Hardening

Production hiện tại: **https://bobebunne.vercel.app**

MyShop là web bán hàng hybrid **Direct Order + Affiliate**. V0.9.0 bám đúng roadmap Hardening trước Release Candidate: tập trung bảo mật, error/recovery states, chống tạo đơn trùng, hiệu năng, SEO và accessibility; không thay đổi business flow đã hoàn thiện ở V0.8.0.

## V0.9.0 có gì mới?

- **Security**
  - response security headers + CSP baseline;
  - chặn open redirect sau login/auth callback bằng same-origin URL guard;
  - harden `SECURITY DEFINER` helper với `search_path=''`;
  - revoke quyền CREATE schema `public` cho runtime roles;
  - private/Admin routes `noindex`.
- **Duplicate prevention**
  - giữ database idempotency bằng `checkout_request_id`;
  - thêm client submit lock để chặn double-click trước khi transition state cập nhật;
  - retry cùng request id vẫn trả về cùng order.
- **Error recovery**
  - root/global/Admin error boundaries;
  - lỗi public catalog/home không còn bị nuốt thành “0 dữ liệu”;
  - checkout giữ form và cho retry an toàn khi mạng gián đoạn.
- **Performance**
  - composite indexes cho My Orders / filter status / catalog category-price;
  - request memoization cho category và product slug lookups.
- **SEO**
  - `/robots.txt`, `/sitemap.xml`;
  - canonical + OpenGraph cho Product/Category;
  - Search/filter pages `noindex,follow`.
- **Accessibility / Mobile**
  - skip link, focus ring, reduced motion;
  - error/loading semantics;
  - form controls 16px trên mobile để tránh Safari auto-zoom.

## Database migration

Nếu production đang ở V0.8.0 / migration 008, chạy:

`supabase/migrations/202609120009_hardening.sql`

Migration 009 không đổi business data; chủ yếu harden security helper, quyền schema và thêm indexes.

## QA nhanh

```bash
npm run qa:hardening
npm run typecheck
npm run lint
npm run build
```

`qa:hardening` không cần dependency ngoài Node và kiểm tra các guard quan trọng của V0.9.0. Full test scenario nằm trong `HARDENING_TEST_PLAN.md`.

## Admin routes

- `/admin` — Dashboard
- `/admin/products` — Catalog
- `/admin/orders` — Order Admin
- `/admin/affiliate` — Affiliate Analytics
- `/admin/settings` — Guest Checkout policy
- `/admin/audit` — Audit Log

## Version history

V0.1.0 Foundation → V0.2.0 Auth & Roles → V0.3.0 Catalog → V0.4.0 Home/Search → V0.5.0 Direct Checkout → V0.6.0 Order Admin → V0.6.1 Type Fix → V0.7.0 Affiliate & Hybrid → V0.7.1 Affiliate Redirect Type Fix → V0.8.0 Customer Account → **V0.9.0 Hardening**.

Next roadmap: **V1.0.0 — Production Ready**.
