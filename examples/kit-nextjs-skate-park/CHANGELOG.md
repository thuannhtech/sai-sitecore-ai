# Changelog - Skate Park Project

## [2026-05-05]
### Added
- **Uncontrolled Bridge Pattern**: Chuyển đổi Sitecore BasicForm sang kiến trúc Uncontrolled (FormData) để đồng bộ dữ liệu an toàn với script bên ngoài.
- **Advanced Checkout Bridge**: Triển khai logic Edit/Cancel/Revert dữ liệu trong `checkout.js`.
- **Interactive Validation**: Tự động xóa lỗi real-time khi người dùng chỉnh sửa input.
- **Custom Event Handlers**: Re-binding logic cho nút Cancel để luôn sử dụng dữ liệu mới nhất (Fix stale closure bug).

### Fixed
- **State-Sync Bug**: Lỗi mất dữ liệu các field khác khi đang nhập liệu 1 field trong chế độ Bridge.
- **Accordion Logic**: Sửa lỗi tự động đóng bước checkout khi hoàn thành (giữ nguyên trạng thái do user chọn).
- **Edit/Cancel Flow**: Đảm bảo dữ liệu được khôi phục chính xác khi hủy chỉnh sửa.

### Changed
- **BasicForm Simplification**: Lược bỏ state nội bộ và `onChange` để tối ưu hiệu năng và khả năng bảo trì.
- **Modular checkout.js**: Cấu trúc lại mã nguồn theo dạng module hướng đối tượng.

## [2026-04-29]
### Added
- **SkateCheckout**: Server Component cho layout trang Checkout 2 cột.
- **SkateCheckoutStep**: Client Component Accordion để quản lý các bước thanh toán.
...
