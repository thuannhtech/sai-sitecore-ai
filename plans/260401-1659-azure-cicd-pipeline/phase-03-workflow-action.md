# Phase 03: Xây dựng Github Actions YAML
Status: ✅ Complete
Dependencies: Xong Phase 01

## Objective
Tạo file Pipeline Workflow `.github/workflows/deploy-azure.yml`. 
Tự động kích hoạt khi có code push vào `examples/kit-nextjs-skate-park` trên nhánh `main`. Tiến hành install dependencies, set environment variables, build code, nén zip thư mục standalone cùng config, và deploy sang Azure Windows App.

## Implementation Steps
1. [ ] **Trigger Configurations**: Đặt branch là `main` và giới hạn thư mục chứa thay đổi (`paths`).
2. [ ] **Environment Setup**: Define chạy trên `ubuntu-latest`. Set `working-directory` trỏ tới project folder.
3. [ ] **Chạy Job "Build"**:
    - Checkout repo code.
    - Cài đặt `Node v22`.
    - Phục hồi/Lưu Cache `.npm` và `.next/cache` để các lần build tới tốc độ cực nhanh.
    - Export các Github Repo Secrets ra file `.env.production` để NextJS pre-render, hoặc truyền vào step `env`.
    - Chạy `npm ci`.
    - Chạy `npm run build`.
4. [ ] **Prepare Release Payload**: Do NextJS đã build standalone, ta chỉ cần thư mục `public/`, `.next/standalone/`, `.next/static/` và `web.config`.
    - Copy các tài nguyên lại vào nhánh `standalone`.
    - Nén thành 1 gói release.zip bằng run command.
5. [ ] **Chạy Job "Deploy"**: Sử dụng action Microsoft `azure/webapps-deploy` với secret publish_profile để đẩy payload zip lên.

## Files to Create/Modify
- `.github/workflows/deploy-azure.yml` - File chứa toàn bộ pipeline script.

---
Next Phase: `/code phase-04`
