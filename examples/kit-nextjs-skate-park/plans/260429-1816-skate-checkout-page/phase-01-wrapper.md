# Phase 01: SkateCheckoutStep Wrapper
Status: ⬜ Pending

## Objective
Tạo component bọc (Wrapper) cho từng bước trong Checkout, hỗ trợ đóng/mở mượt mà và chứa Placeholder cho các form bên trong.

## Requirements
### Functional
- [ ] Hiển thị tiêu đề bước (VD: 1. SHIPPING ADDRESS).
- [ ] Hỗ trợ Placeholder `step-content` để kéo thả component khác vào.
- [ ] Logic Toggle: Click vào header để đóng/mở nội dung.
- [ ] Trạng thái "Completed": Hiển thị dấu checkmark khi bước đó đã xong.

### UI/UX
- [ ] Bo góc `rounded-2xl`, border tinh tế.
- [ ] Hiệu ứng chuyển động (Transition) khi đóng/mở nội dung.
- [ ] Style đồng bộ với hệ thống `Skate*`.

## Implementation Steps
1. [ ] Khởi tạo component `SkateCheckoutStep` bằng skill `/component`.
2. [ ] Thiết lập cấu trúc `Placeholder` của Sitecore JSS.
3. [ ] Viết logic quản lý trạng thái `isOpen` (có thể dùng cục bộ hoặc truyền từ props).
4. [ ] Thiết kế Header với Typography đậm nét (Skate Style).

## Files to Create/Modify
- `src/components/SkateCheckoutStep/SkateCheckoutStep.tsx` - Component chính.

## Test Criteria
- [ ] Component hiển thị đúng tiêu đề.
- [ ] Có thể kéo thả component khác vào bên trong (qua Experience Editor).
- [ ] Hiệu ứng đóng/mở hoạt động mượt mà.
