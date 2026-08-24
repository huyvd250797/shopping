# MyShop V0.1.0 — Foundation

Phiên bản đầu tiên theo blueprint **Web App Bán Hàng Affiliate + Đơn Hàng**.

## 1. Scope đã build

- Next.js 16 + TypeScript + App Router.
- Tailwind CSS 4 + design tokens riêng, marketplace-inspired nhưng không clone Shopee.
- Public shell responsive: header/search, banner hero, category cards, product cards, footer.
- Skeleton routes cho Home, Search, Category, Product, Checkout, Order Success, Customer Account.
- Supabase SSR cookie client theo mô hình `@supabase/ssr`.
- `src/proxy.ts` để refresh auth cookie theo convention Next.js 16.
- Admin Login thật bằng Supabase Auth.
- Admin server guard: ngoài role `admin` không vào `/admin` được.
- Admin Console skeleton responsive.
- Schema nền cho profiles/categories/products/orders/banners/settings/affiliate/audit.
- RLS foundation + public read cho catalog active + admin policies.
- Script seed Admin an toàn bằng server-only key.
- `.env.example`, migration, seed data, CHANGELOG, VERSION, hướng dẫn deploy Vercel.

**Chưa build đúng theo roadmap:** Customer Auth đầy đủ, CRUD sản phẩm thật, checkout tạo đơn, quản lý đơn, affiliate tracking thật.

## 2. Yêu cầu máy

- Node.js >= 20.9
- npm
- Một Supabase project
- Git/GitHub nếu deploy qua Vercel

## 3. Chạy local từng bước

### Bước 1 — Cài package

```bash
npm install
```

### Bước 2 — Tạo `.env.local`

Tại **thư mục gốc dự án**, cùng cấp với `package.json`, copy:

```bash
cp .env.example .env.local
```

Windows có thể tạo file `.env.local` thủ công rồi copy nội dung từ `.env.example`.

Điền tối thiểu:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SHOP_NAME=MyShop
SUPABASE_SECRET_KEY=...
ADMIN_SEED_EMAIL=...
ADMIN_SEED_PASSWORD=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> Nếu Supabase project của bạn còn dùng key kiểu cũ, có thể dùng `NEXT_PUBLIC_SUPABASE_ANON_KEY` và `SUPABASE_SERVICE_ROLE_KEY`. Server secret/service-role key **không được** có prefix `NEXT_PUBLIC_`.

### Bước 3 — Tạo database schema

Cách đơn giản nhất cho V0.1.0:

1. Mở Supabase Dashboard.
2. SQL Editor → New query.
3. Copy toàn bộ file `supabase/migrations/202608240001_foundation.sql` → Run.
4. Chạy tiếp `supabase/seed.sql`.

### Bước 4 — Seed tài khoản Admin

Sau khi schema đã có bảng `profiles`:

```bash
npm run seed:admin
```

Script sẽ:

- tạo Auth user nếu chưa có;
- xác nhận email cho bootstrap account;
- upsert `public.profiles`;
- gán `role = admin`.

### Bước 5 — Chạy app

```bash
npm run dev
```

Mở:

- Public: `http://localhost:3000`
- Admin Login: `http://localhost:3000/admin/login`

## 4. Kiểm tra trước khi deploy

```bash
npm run typecheck
npm run lint
npm run build
```

## 5. Deploy Vercel

1. Push source lên GitHub.
2. Vercel → Add New Project → Import repository.
3. Framework Preset: **Next.js**.
4. Build Command: để mặc định `next build` / `npm run build`.
5. **Output Directory: để trống / mặc định. Không nhập `out`.**
6. Thêm các environment variables giống `.env.local` cho Preview/Production.
7. Deploy.
8. Sau deploy, đổi `NEXT_PUBLIC_SITE_URL` thành domain thật.

> Project này không dùng `output: 'export'`, không dùng custom `distDir`, vì vậy Vercel phải tự nhận `.next`. Không cấu hình Output Directory thành `out`.

## 6. Security notes

- Password nằm trong Supabase Auth, không lưu trong `profiles`.
- Admin quyền được kiểm tra ở server, không chỉ ẩn menu.
- RLS được bật ngay từ nền tảng.
- `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` chỉ phục vụ bootstrap server-side; tuyệt đối không commit `.env.local`.
- Sau khi seed Admin xong, có thể xóa `ADMIN_SEED_PASSWORD` khỏi Vercel nếu không dùng script seed trên môi trường đó.

## 7. Guest checkout

Theo quyết định hiện tại, guest checkout được thiết kế **cho phép mặc định** (`require_login_for_checkout=false`). V0.1.0 mới seed setting; luồng đặt hàng thật sẽ build ở V0.5.0.

## 8. Roadmap tiếp theo

- **Built:** V0.1.0 — Foundation
- **Next:** V0.2.0 — Auth & Roles
- V0.3.0 — Catalog & CMS Core
- V0.4.0 — Home & Search UX
- V0.5.0 — Direct Checkout
- V0.6.0 — Order Admin
- V0.7.0 — Affiliate & Hybrid
- V0.8.0 — Customer Account
- V0.9.0 — Hardening
- V1.0.0 — Production Ready

Xem `VERSION.md` và `CHANGELOG.md` để tránh nhầm version khi phát triển tiếp.
