# Phase 04: Styling & Integration
Status: ⬜ Pending

## Objective
Hoàn thiện layout trang Checkout, tối ưu CSS cho BasicForm và hướng dẫn tích hợp Sitecore.

## Requirements
### Functional
- [ ] Tạo layout grid 2 cột (Main content + Sidebar).
- [ ] Viết CSS override cho `BasicForm` để đồng bộ phong cách `Skate`.

### UI/UX
- [ ] Kiểm tra tính phản hồi (Responsive) trên Mobile.

## Implementation Steps
1. [ ] Tạo trang `/checkout` (hoặc rendering bọc ngoài cùng).
2. [ ] Viết CSS cho class `.sc-BasicForm` để bo góc `rounded-2xl` và đổi font.
3. [ ] Viết tài liệu hướng dẫn kéo thả component trong Sitecore.

## Files to Create/Modify
- `src/assets/main.css` - (Hoặc file CSS liên quan) để override BasicForm.
- `src/components/SkateCheckout/SkateCheckout.tsx` - Layout tổng.

## Test Criteria
- [ ] Trang checkout hiển thị đồng bộ tất cả các bước.
- [ ] BasicForm trông đẹp và khớp với các component xung quanh.
