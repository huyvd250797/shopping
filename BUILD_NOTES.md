# Build Notes — V0.6.1

V0.6.1 là patch của V0.6.0, giữ nguyên Direct Checkout, Auth/Roles, Catalog/CMS, Home/Search và Order Admin. Không có migration mới.

Điểm kiến trúc chính: Order Admin mutation được đưa xuống PostgreSQL RPC atomic. `admin_transition_order` khóa row order, kiểm tra allowed transition, update status, insert status history và insert audit trong cùng transaction. `admin_update_order_internal_note` cập nhật internal note và audit trong cùng transaction.

Generic Admin write policy trên `orders`, `order_items`, `order_status_history` được thay bằng Admin SELECT policy để UI không thể bỏ qua workflow/history/audit bằng direct Data API update.

Production URL dùng xuyên suốt: `https://bobebunne.vercel.app`.

Static QA đã parse 75 TS/TSX files với 0 syntax errors, 0 internal import missing và 0 route collision. Package registry không phản hồi trong giới hạn của môi trường đóng gói nên full dependency typecheck/lint/build không được tuyên bố PASS.

V0.6.1 sửa production type-check: narrow `order.status` / `current.status` bằng `isOrderStatus()` trước khi index `ORDER_STATUS_TRANSITIONS`; `nextStatuses` được typed `OrderStatus[]`.
