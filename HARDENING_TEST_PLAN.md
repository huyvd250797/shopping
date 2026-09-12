# MyShop V0.9.0 — Hardening Test Plan

## 1. Security & authorization
- Customer/Guest gọi route hoặc Server Action Admin phải bị chặn bởi server guard/RLS.
- `/admin/*`, `/account/*`, `/checkout/*`, `/order/*` không được index trong robots/meta phù hợp.
- Response production có các header: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS.
- Affiliate URL chỉ cho phép HTTP/HTTPS; tab mới luôn dùng `noopener noreferrer sponsored`.
- Không có service-role/secret key trong client bundle hoặc repository.

## 2. Duplicate-order prevention
- Double-click nút Xác nhận chỉ tạo 1 order.
- Giả lập request timeout sau khi server đã tạo order, bấm lại cùng checkout draft phải trả lại cùng order.
- Refresh ở bước review và submit lại cùng `checkout_request_id` không tạo order thứ hai.
- Hai checkout mới khác nhau phải có request id khác nhau.

## 3. Error & recovery states
- Ngắt Supabase/network trên Home/Search/Product phải đi vào error state thay vì hiển thị nhầm “0 sản phẩm”.
- Admin query lỗi phải hiển thị Admin Error + nút Tải lại.
- Checkout RPC lỗi phải giữ dữ liệu form và hiển thị message có `role=alert`.
- Invalid affiliate redirect phải quay lại product với trạng thái unavailable, không redirect tới URL sai.

## 4. Performance
- Customer My Orders sử dụng phân trang 10 records/trang.
- Catalog Search sử dụng pagination tối đa 48 records/trang.
- Migration 009 có composite indexes cho customer orders và public catalog filter/sort.
- Home không tải toàn bộ catalog; mỗi section có item limit.

## 5. SEO
- `/robots.txt` và `/sitemap.xml` render thành công.
- Product/Category có canonical URL; Product có OpenGraph image nếu có thumbnail.
- Search/filter pages là `noindex,follow` để tránh index hàng loạt query combinations.
- Admin/private transaction pages là `noindex`.

## 6. Accessibility & mobile
- Keyboard Tab thấy focus ring rõ.
- Skip link đưa focus tới main content ở Shop và Admin.
- Loading/Error dùng `role=status`/`role=alert` phù hợp.
- Mobile input/select/textarea >= 16px để tránh Safari auto-zoom.
- `prefers-reduced-motion` giảm animation/transition.

## 7. Release-candidate regression
- Auth Customer/Admin, Catalog CRUD, Home/Search, Direct Checkout, Order Admin, Affiliate/Hybrid, Customer Account đều chạy lại happy path.
- `npm run qa:hardening`, `npm run typecheck`, `npm run lint`, `npm run build` phải PASS trong môi trường có dependencies + env test trước khi promote V1.0.0.
