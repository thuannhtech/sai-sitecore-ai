# Phase 04: Chạy thử & Monitor
Status: ⬜ Pending

## Objective
Kiểm chứng xem pipeline chạy thành công hay không, khắc phục (troubleshoot) các lỗi phát sinh (đặc biệt liên quan đến start Node App thông qua iisnode).

## Implementation Steps
1. [ ] Nhấn Commit & Push các file NextJS (`next.config.ts`, `web.config`) và Github pipeline (`deploy-azure.yml`) thẳng lên branch `main`.
2. [ ] Theo dõi mục "Actions" của GitHub Repo > Check logs realtime.
3. [ ] Nếu deploy thành công, truy cập public domain của ứng dụng Azure xem trang NextJS lên hình chưa.
4. [ ] Check log console trên Kudu (Advanced Tools) trong trường hợp iisnode trả về lỗi HTTP ERROR 500.
