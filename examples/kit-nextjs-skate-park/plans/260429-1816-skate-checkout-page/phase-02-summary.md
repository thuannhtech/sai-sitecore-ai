# Phase 02: Checkout Summary Update
Status: ⬜ Pending

## Objective
Nâng cấp component `SkateCartSummary` hiện tại để hỗ trợ luồng Checkout.

## Requirements
### Functional
- [ ] Nhận prop `isCheckout`.
- [ ] Nếu `isCheckout={true}`:
    - Thay đổi text nút bấm thành **"PLACE ORDER"**.
    - Link nút bấm dẫn đến trang `/thank-you` (hoặc xử lý submit).
    - Hiển thị tóm tắt đơn hàng ngắn gọn hơn.

### UI/UX
- [ ] Giữ nguyên phong cách thiết kế cao cấp đã có.

## Implementation Steps
1. [ ] Chỉnh sửa `src/components/SkateCart/SkateCartSummary.tsx`.
2. [ ] Thêm logic kiểm tra prop `isCheckout`.
3. [ ] Cập nhật text và behavior cho nút Action chính.

## Files to Create/Modify
- `src/components/SkateCart/SkateCartSummary.tsx` - Cập nhật logic.

## Test Criteria
- [ ] Nút bấm đổi text chính xác khi ở trang Checkout.
- [ ] Không làm ảnh hưởng đến hiển thị ở trang Cart Page cũ.
