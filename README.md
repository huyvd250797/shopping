# MyShop V0.3.0 — Catalog & CMS Core

MyShop là web app bán hàng hybrid: mỗi sản phẩm có thể là **Affiliate**, **Direct Order** hoặc **Hybrid**. V0.3.0 kế thừa trực tiếp V0.2.0 Auth & Roles và đưa Catalog/CMS từ skeleton sang dữ liệu Supabase thật.

Production domain hiện tại:

**https://bobebunne.vercel.app**

## 1. Version history

- ✅ V0.1.0 — Foundation
- ✅ V0.2.0 — Auth & Roles
- ✅ **V0.3.0 — Catalog & CMS Core (current)**
- ➡️ V0.4.0 — Home & Search UX

## 2. V0.3.0 đã build

### Admin Categories
- Tạo danh mục.
- Sửa tên, slug, icon URL, thứ tự.
- Bật/tắt hiển thị.
- Xóa danh mục nếu chưa có sản phẩm đang sử dụng.

### Admin Products
- Tạo/sửa sản phẩm.
- SKU, slug, category.
- Giá bán + giá gạch.
- Mô tả ngắn + mô tả chi tiết.
- Badge, tags, Featured.
- Theo dõi tồn kho cơ bản.
- Trạng thái Draft / Active / Archived.
- Xóa mềm + khôi phục.
- Quick action Ẩn/Hiện.

### Purchase Mode
- `DIRECT` — CTA nội bộ tới `/checkout/[slug]`.
- `AFFILIATE` — CTA mở Affiliate URL.
- `HYBRID` — CTA Direct + Affiliate.
- Label nút chính/phụ chỉnh riêng từng sản phẩm.
- `AFFILIATE` bắt buộc URL http/https hợp lệ.

### Product Images
- Supabase Storage bucket `product-images`.
- Public đọc ảnh.
- Chỉ Admin được upload/update/delete qua Storage RLS.
- Upload trực tiếp từ trình duyệt lên Supabase Storage, tối đa 6 ảnh/lần.
- Mỗi ảnh tối đa 5MB.
- Chấp nhận JPEG, PNG, WEBP, GIF.
- Ảnh đầu tiên tự thành thumbnail nếu chưa có thumbnail.
- Admin đổi thumbnail hoặc xóa ảnh.

### Public Catalog
- `/` — Home đọc danh mục + sản phẩm thật.
- `/category/[slug]` — sản phẩm theo danh mục.
- `/search?q=...` — tìm kiếm cơ bản.
- `/product/[slug]` — gallery, giá, mô tả, CTA theo Purchase Mode.
- Chỉ sản phẩm `active` và chưa xóa mềm được public đọc.

## 3. Database — nâng từ V0.2.0

Nếu Supabase của MyShop đã có V0.1.0 + V0.2.0, chỉ chạy thêm:

`supabase/migrations/202608240003_catalog_cms.sql`

Trong **Supabase Dashboard → SQL Editor**, mở file trên, copy toàn bộ SQL và chạy.

Migration sẽ:
- bổ sung field Catalog/CMS cho `products`;
- bổ sung `storage_path` cho `product_images`;
- tạo index catalog;
- tạo public bucket `product-images`;
- tạo Storage policies chỉ Admin được ghi/xóa ảnh.

Nếu database mới hoàn toàn, chạy migration theo thứ tự 001 → 002 → 003 rồi chạy `supabase/seed.sql`.

## 4. Environment Variables — production

Vercel → MyShop → Settings → Environment Variables:

```env
NEXT_PUBLIC_SITE_URL=https://bobebunne.vercel.app
NEXT_PUBLIC_SHOP_NAME=MyShop
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxx
ADMIN_SEED_EMAIL=your-admin-email
ADMIN_SEED_PASSWORD=your-strong-password
ADMIN_SEED_NAME=Administrator
```

Source vẫn hỗ trợ key legacy bằng:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Không đặt Secret/Service Role key vào biến có prefix `NEXT_PUBLIC_`.

## 5. Supabase Authentication URL

Supabase → Authentication → URL Configuration:

```text
Site URL
https://bobebunne.vercel.app

Redirect URL
https://bobebunne.vercel.app/auth/callback
```

## 6. Tạo Admin ban đầu

Sau khi điền env, chạy một lần:

```bash
npm run seed:admin
```

Script dùng `SUPABASE_SECRET_KEY` hoặc `SUPABASE_SERVICE_ROLE_KEY` để bootstrap user Auth và gán `profiles.role = admin`.

Sau khi seed xong, Admin login tại:

`https://bobebunne.vercel.app/admin/login`

## 7. Quy trình test V0.3.0 trên production

1. Login Admin.
2. Vào **Danh mục** → tạo ít nhất một danh mục Active.
3. Vào **Sản phẩm → Thêm sản phẩm**.
4. Tạo DIRECT, nhập giá, chọn Active → Lưu.
5. Ở màn sửa sản phẩm, upload ảnh → đặt thumbnail.
6. Mở Home/public product detail và kiểm tra dữ liệu.
7. Tạo AFFILIATE + Affiliate URL + label ví dụ `Mua trên Shopee`.
8. Mở public product → CTA phải mở đúng URL.
9. Tạo HYBRID → public có Direct CTA và Affiliate CTA.
10. Admin bấm Ẩn → sản phẩm biến mất public.
11. Bấm Hiện → sản phẩm xuất hiện lại.
12. Xóa mềm → public không còn đọc được; record vẫn được giữ trong database.

## 8. Ranh giới V0.3.0

V0.3.0 **chưa tạo order thật**. DIRECT CTA đã đi đúng route `/checkout/[slug]`, nhưng form checkout + insert `orders/order_items` nằm ở V0.5.0.

V0.3.0 cũng chưa ghi `affiliate_click`. Tracking Affiliate nằm ở V0.7.0 để tránh coi click là đơn hàng.

Banner CMS, Home sections, filter/sort/search UX hoàn chỉnh nằm ở V0.4.0.

## 9. Kiểm tra source trước khi deploy

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Vercel:
- Framework Preset: Next.js
- Output Directory: **để trống**
- Build Command: mặc định hoặc `npm run build`

## 10. Security

- Admin guard vẫn chạy server-side.
- Catalog tables có RLS: public chỉ SELECT active data; Admin mới được write.
- Storage write policy yêu cầu `public.is_admin()`.
- Không lưu password trong database app.
- Customer không thể tự đổi role Admin.
- Product delete là soft-delete để bảo toàn lịch sử order tương lai.
- Description được render dạng text, không render HTML chưa sanitize.

## 11. Version tiếp theo

**V0.4.0 — Home & Search UX**

Sẽ tập trung vào Banner CMS, home sections, search/filter/sort, mobile header và polish product card/catalog UX trước khi bước vào Direct Checkout V0.5.0.
