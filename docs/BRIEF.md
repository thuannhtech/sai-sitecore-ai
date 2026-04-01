# 💡 BRIEF: CI/CD Pipeline cho Next.js Skate Park trên Azure Windows

**Ngày tạo:** 2026-04-01
**Dự án:** Next.js Skate Park (repo: sai-sitecore-ai)
**Vị trí source code:** `examples/kit-nextjs-skate-park`

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Tự động hóa hoàn toàn quá trình build và deploy mã nguồn ứng dụng (Next.js 15, React 19, Tailwind 4, TypeScript 5.8, Node.js 22 LTS) từ GitHub lên Azure App Service.

## 2. GIẢI PHÁP ĐỀ XUẤT
Sử dụng **GitHub Actions** để thiết lập một CI/CD pipeline:
- **Trigger:** Lắng nghe commit/push trên branch `main`. Pipeline chỉ chạy nếu có file thay đổi nằm trong thư mục `examples/kit-nextjs-skate-park`.
- **Môi trường Build:** Sẽ trỏ `working-directory` vào thư mục con `examples/kit-nextjs-skate-park`.
- **Deploy Đích:** Web App chạy trên hệ điều hành **Windows** của Azure.

## 3. TÍNH NĂNG (Thành phần chính của Pipeline)

### 🚀 MVP (Bắt buộc có):
- [ ] Checkout code, thiết lập thư mục làm việc.
- [ ] Cài đặt Node.js v22 LTS trên runner.
- [ ] **Bảo mật & Biến môi trường:** Map các biến được cung cấp (`SITECORE_EDGE_CONTEXT_ID`, `NEXT_PUBLIC_*`, `SITECORE_EDITING_SECRET`) từ **GitHub Secrets** ra file `.env` hoặc truyền trực tiếp vào bước build.
- [ ] Cache thư mục node_modules / .next cache để tăng tốc build.
- [ ] Tiến hành `npm install` & `npm run build`.
- [ ] Deploy lên Azure App Service (Windows) bằng `azure/webapps-deploy@v2` qua Publish Profile.

## 4. ƯỚC TÍNH SƠ BỘ & RỦI RO KỸ THUẬT
- **Độ phức tạp:** Trung bình
- **Lưu ý đặc biệt:** 
  - Pipeline cần phải `cd` và thao tác chuẩn trong không gian `working-directory`.
  - Do đích đến là môi trường **Azure Windows** với iisnode, Next.js build có thể cần sinh ra file `server.js` (dùng cấu hình Output Standalone) kèm file `web.config`, hoặc tùy chỉnh start script `npm start` trên App Service để tránh lỗi khi port được giao.

## 5. BƯỚC TIẾP THEO
→ Chạy `/plan` để bắt đầu lên danh sách code cần viết, file cần cấu hình.
