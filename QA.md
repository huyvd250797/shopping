# QA — MyShop V0.6.1

## Functional checklist
- [ ] `/admin/orders` search theo mã đơn/tên/SĐT.
- [ ] Filter status hoạt động.
- [ ] Filter Guest/Customer hoạt động.
- [ ] Filter date from/to theo ngày vận hành Việt Nam.
- [ ] Pagination giữ nguyên query filter.
- [ ] NEW → CONFIRMED thành công.
- [ ] CONFIRMED → PROCESSING thành công.
- [ ] PROCESSING → SHIPPING thành công.
- [ ] SHIPPING → COMPLETED thành công.
- [ ] COMPLETED → ARCHIVED thành công.
- [ ] CANCELLED chỉ cho phép từ NEW/CONFIRMED/PROCESSING/SHIPPING.
- [ ] CANCELLED bắt buộc lý do.
- [ ] ARCHIVED không còn transition tiếp theo.
- [ ] Mỗi transition tạo status history + audit.
- [ ] Internal note lưu/reload đúng và có audit.
- [ ] Copy mã đơn/SĐT/địa chỉ hoạt động trên HTTPS production.
- [ ] `/admin/audit` hiển thị order audit và link detail.

## Security checklist
- [ ] Customer/Guest không execute được Order Admin RPC.
- [ ] Generic direct UPDATE `orders` qua client bị RLS chặn.
- [ ] Direct INSERT `order_status_history` qua client bị RLS chặn.
- [ ] RPC pin `search_path` và chỉ grant `authenticated`.
- [ ] RPC tự check `public.is_admin()`.
- [ ] Không có secret thật trong repository/ZIP.

## Static QA kết quả đóng gói
- TypeScript parser: **75 TS/TSX files, 0 syntax errors**.
- Internal import missing: **0**.
- Page routes: **24**.
- Page route collisions: **0**.
- Direct order table mutations trong `src`: **0**; V0.6.0 mutation dùng RPC.
- Migration chain: **001 → 002 → 003 → 004 → 005 → 006**.
- Package version: **0.6.1**.
- Local-development URL references: **0**.
- Production domain: `https://bobebunne.vercel.app`.
- Hard-coded production secret scan: **0**.
- `npm install`: package registry không phản hồi trong giới hạn thời gian của môi trường đóng gói; vì vậy không tuyên bố `typecheck/lint/build` dependency-level đã PASS.

## V0.6.1 regression fix
- `ORDER_STATUS_TRANSITIONS` chỉ được index bằng biến đã narrow về `OrderStatus`.
- `nextStatuses` được khai báo `OrderStatus[]`, loại bỏ TS7053/TS7006 đã xuất hiện trên Vercel.
- `order-actions.ts` dùng cùng type-guard pattern để tránh lỗi tương tự.

## Kiểm tra bản vá production
- Focused TypeScript strict check cho pattern `OrderStatus`/`ORDER_STATUS_TRANSITIONS`: **PASS**.
- TS/TSX syntax parse toàn source: **76 files, 0 syntax diagnostics**.
- Internal import resolver: **0 missing**.
- Database migration mới: **không có**; tiếp tục dùng migration 001–006.
