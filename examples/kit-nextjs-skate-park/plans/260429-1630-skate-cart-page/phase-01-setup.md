# Phase 01: Setup & Layout Structure
Status: ✅ Complete

## Objective
Thiết lập cấu trúc Rendering chuẩn Sitecore JSS và chia layout cho trang Cart.

## Tasks
- [ ] Tạo component `SkateCart.tsx` tại `src/components/SkateCart/SkateCart.tsx`.
- [ ] Thiết lập kiểu dữ liệu `Fields` và `Props` theo chuẩn Sitecore.
- [ ] Phân chia layout sử dụng Tailwind Grid (2/3 Main Content, 1/3 Sidebar Summary).
- [ ] Đăng ký component vào component factory (nếu cần, thường Next.js App Router sẽ tự động nhận nếu dùng đúng cấu trúc).

## Files to Create/Modify
- `src/components/SkateCart/SkateCart.tsx`

## Test Criteria
- Rendering `SkateCart` hiển thị được trên Sitecore Page (với placeholder dữ liệu).
- Layout chia đúng 2 cột trên Desktop và 1 cột trên Mobile.
