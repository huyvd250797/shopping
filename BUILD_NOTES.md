# Build Notes — V0.6.0

V0.6.0 nâng trực tiếp từ V0.5.0 và giữ nguyên Direct Checkout, Auth/Roles, Catalog/CMS, Home/Search.

Điểm kiến trúc chính: Order Admin mutation được đưa xuống PostgreSQL RPC atomic. `admin_transition_order` khóa row order, kiểm tra allowed transition, update status, insert status history và insert audit trong cùng transaction. `admin_update_order_internal_note` cập nhật internal note và audit trong cùng transaction.

Generic Admin write policy trên `orders`, `order_items`, `order_status_history` được thay bằng Admin SELECT policy để UI không thể bỏ qua workflow/history/audit bằng direct Data API update.

Production URL dùng xuyên suốt: `https://bobebunne.vercel.app`.

Static QA đã parse 75 TS/TSX files với 0 syntax errors, 0 internal import missing và 0 route collision. Package registry không phản hồi trong giới hạn của môi trường đóng gói nên full dependency typecheck/lint/build không được tuyên bố PASS.
