# MyShop V0.3.0 — Build Notes

## QA đã thực hiện trong môi trường đóng gói

- Kiểm tra cú pháp toàn bộ file `.ts` / `.tsx` bằng TypeScript parser.
- Kiểm tra alias import nội bộ `@/` không trỏ tới file thiếu.
- Kiểm tra route page không bị trùng.
- Kiểm tra thứ tự migration V0.1 → V0.2 → V0.3.
- Kiểm tra toàn bộ cấu hình và tài liệu production đều dùng domain thật.
- Kiểm tra ZIP sau khi đóng gói bằng `unzip -t`.

## Giới hạn môi trường

`npm install` bị timeout khi truy cập npm registry trong môi trường đóng gói, vì vậy chưa thể chạy `npm run typecheck`, `npm run lint` và `npm run build` bằng dependency thực tế tại đây.

Sau khi deploy/import source, nên để Vercel chạy build và kiểm tra log. Nếu build báo lỗi dependency hoặc TypeScript, xử lý theo log trước khi promote production.

## Production

Domain chính của dự án: `https://bobebunne.vercel.app`
