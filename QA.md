# QA — MyShop V0.4.0

## Static QA đã chạy trong môi trường build

- TypeScript compiler parser: **64 TS/TSX files, 0 syntax errors**.
- Internal import resolver: **0 missing imports**.
- Next page routes: **23 routes, 0 duplicate routes**.
- Không phát hiện `any` explicit trong source.
- Không phát hiện secret key thật trong source.
- Không chứa cấu hình môi trường phát triển cục bộ trong gói V0.4.0.
- Migration chain có đủ 001 → 002 → 003 → 004.

## Build dependency limitation

`npm install` đã được thử nhưng npm registry bị timeout trong môi trường đóng gói, vì vậy chưa thể chạy `npm run typecheck`, `npm run lint`, `npm run build` với dependency thật ở đây.

Vercel khi deploy phải chạy lại:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

## Smoke test production cần thực hiện

1. Chạy migration 004 trong Supabase SQL Editor.
2. Login Admin và mở `/admin/banners`.
3. Tạo banner, upload ảnh, lưu nội dung, kiểm tra Home.
4. Bật/tắt Home section và thay đổi thứ tự/số sản phẩm.
5. Search theo keyword/category/mode/price.
6. Sort newest/price asc/price desc.
7. Pagination + browser Back/Forward giữ filter.
8. Mobile kiểm tra header, search input không auto zoom, category horizontal scroll và product grid 2 cột.
9. Tắt banner hoặc đặt lịch hết hạn, Home không còn hiển thị.
