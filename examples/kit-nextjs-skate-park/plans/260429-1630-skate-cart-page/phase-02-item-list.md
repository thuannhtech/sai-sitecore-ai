# Phase 02: Item List Component
Status: ✅ Complete

## Objective
Xây dựng component hiển thị danh sách sản phẩm trong giỏ hàng với đầy đủ tính năng tương tác.

## Tasks
- [ ] Tạo sub-component `SkateCartItemList.tsx`.
- [ ] Render danh sách sản phẩm từ `cart.items` trong `SkateCartStore`.
- [ ] Implement UI cho từng dòng sản phẩm (Hình ảnh, Tên, Giá, Thành tiền).
- [ ] Tích hợp logic tăng/giảm số lượng và nút xóa sản phẩm.
- [ ] Xử lý trạng thái giỏ hàng trống (Empty State) với nút "Back to Shopping".

## Files to Create/Modify
- `src/components/SkateCart/SkateCartItemList.tsx`

## Test Criteria
- Danh sách sản phẩm hiển thị chính xác dữ liệu từ Store.
- Nút tăng/giảm số lượng cập nhật đúng giá trị và thành tiền.
- Xóa sản phẩm hoạt động mượt mà.
