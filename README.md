# MyShop V0.4.0 — Home & Search UX

MyShop là web app bán hàng hybrid: **Affiliate / Direct Order / Hybrid**. V0.4.0 kế thừa nguyên Auth/Roles + Catalog/CMS của V0.3.0 và hoàn thiện trải nghiệm Home/Search.

Production domain:

**https://bobebunne.vercel.app**

## Version history

- ✅ V0.1.0 — Foundation
- ✅ V0.2.0 — Auth & Roles
- ✅ V0.3.0 — Catalog & CMS Core
- ✅ **V0.4.0 — Home & Search UX (current)**
- ➡️ V0.5.0 — Direct Checkout

## V0.4.0 đã build

### Home CMS
- Banner tạo/sửa/xóa tại `/admin/banners`.
- Banner gồm title, subtitle, link, button label, thứ tự, active, thời gian bắt đầu/kết thúc.
- Upload ảnh banner trực tiếp browser → Supabase Storage `site-media`, không đi qua Vercel Function.
- Home sections trong DB: `FEATURED`, `NEWEST`, `BEST_PRICE`, `RECOMMENDED`.
- Admin chỉnh title/subtitle/type/item limit/active/sort order.

### Public Home
- Banner CMS thật.
- Category quick cards, horizontal scroll trên mobile.
- Các section sản phẩm do Admin điều khiển.
- Product cards marketplace-style, responsive 2 cột mobile.

### Search UX
`/search` hỗ trợ query URL:

- `q` — từ khóa
- `category` — category UUID
- `min` / `max` — khoảng giá
- `mode` — `DIRECT` / `AFFILIATE` / `HYBRID`
- `sort` — `relevant` / `newest` / `price_asc` / `price_desc`
- `page` — phân trang

Mặc định 24 sản phẩm/trang. Back/Forward trình duyệt hoặc copy URL vẫn giữ đúng filter.

### Resilience UX
- `loading.tsx` skeleton cho public shop.
- `error.tsx` retry state.
- Search empty state có hướng dẫn reset filter.

## Database — nâng từ V0.3.0

Nếu Supabase đã có V0.1 → V0.3, **chỉ chạy thêm**:

`supabase/migrations/202608240004_home_search_ux.sql`

Migration sẽ:
- bổ sung `button_label`, `storage_path` cho banners;
- tạo `home_sections` + RLS + seed 4 section mặc định;
- tạo bucket `site-media` tối đa 6MB/ảnh;
- tạo Storage policies chỉ Admin được ghi/xóa.

Database mới hoàn toàn: chạy 001 → 002 → 003 → 004 → `supabase/seed.sql`.

## Environment Variables — production

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

Legacy key vẫn được source hỗ trợ qua `NEXT_PUBLIC_SUPABASE_ANON_KEY` và `SUPABASE_SERVICE_ROLE_KEY`.

## Supabase Auth URL

- Site URL: `https://bobebunne.vercel.app`
- Redirect URL: `https://bobebunne.vercel.app/auth/callback`

## Test production V0.4.0

1. Chạy migration 004.
2. Login `/admin/login`.
3. Vào **Banner** → tạo banner → upload ảnh → bật Hiển thị.
4. Kiểm tra Home xuất hiện banner.
5. Chỉnh 4 Home Sections, đổi title/số SP/thứ tự → Home phản ánh đúng.
6. Vào `/search`, thử keyword + category + price + Purchase Mode.
7. Sort giá tăng/giảm và mới nhất.
8. Chuyển trang rồi Back/Forward để kiểm tra URL giữ filter.
9. Test mobile: search header, category strip, 2-column product grid.
10. Tắt banner/section trong Admin → public phải biến mất sau refresh.

## Build / deploy

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Vercel:
- Framework Preset: Next.js
- Output Directory: để trống
- Build Command: `npm run build` hoặc mặc định

## Ranh giới version

V0.4.0 **chưa tạo đơn Direct thật**. `/checkout/[product]` vẫn là route chuẩn bị từ roadmap. Tạo `orders + order_items`, guest checkout, validation và lịch sử local sẽ được triển khai ở **V0.5.0 — Direct Checkout**.
