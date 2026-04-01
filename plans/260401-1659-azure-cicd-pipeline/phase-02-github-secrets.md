# Phase 02: Chuẩn bị GitHub Secrets
Status: ⬜ Pending
Dependencies: Bằng tay

## Objective
Hướng dẫn cách lưu các biến môi trường nhạy cảm và file Publish Profile định danh để Github Actions có thể authen với Azure. Công việc này sẽ diễn ra bên thứ ba (Web UI của Github Repo), do vậy Phase này mang tính check-list thay vì viết code.

## Implementation Steps
1. [ ] Truy cập Portal Azure App Service > Mở tải file **Publish Profile** (XML).
2. [ ] Truy cập Repository GitHub > Settings > Secrets and variables > Actions > Chọn tính năng **New repository secret**.
3. [ ] Tạo secret có tên `AZUREAPPSERVICE_PUBLISHPROFILE` và paste toàn bộ nội dung file XML trên vào.
4. [ ] Khởi tạo lần lượt các Repo Secrets tương ứng với biến `.env.local` bạn cung cấp:
      - `SITECORE_EDGE_CONTEXT_ID`
      - `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID`
      - `NEXT_PUBLIC_DEFAULT_SITE_NAME`
      - `SITECORE_EDITING_SECRET`

---
Next Phase: `/code phase-03`
