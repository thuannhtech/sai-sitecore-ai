# Changelog - Skate Park Project

## [2026-04-29]
### Added
- **SkateCheckout**: Server Component cho layout trang Checkout 2 cột.
- **SkateCheckoutStep**: Client Component Accordion để quản lý các bước thanh toán.
- **SkateShipmentMethod**: Component lựa chọn phương thức vận chuyển với mockup dữ liệu.
- **SkatePaymentMethod**: Component lựa chọn thanh toán với Mockup Credit Card cao cấp.
- **CSS Overrides**: Hệ thống style cho Sitecore BasicForm để đồng bộ thiết kế Skate.
- **Visual Guides**: Thêm khung chỉ dẫn và min-height cho Placeholder trong chế độ Sitecore Editor.

### Fixed
- Lỗi Circular Dependency trong `component-map.ts` gây crash trang.
- Lỗi `ReferenceError` khi khởi tạo các component có dùng `AppPlaceholder`.
- Tối ưu hóa việc sử dụng `component-map.client` cho các Client Components.

### Changed
- Cập nhật `SkateCartSummary` hỗ trợ chế độ Checkout (nút Place Order).
- Chuyển `SkateCheckout` sang Server Component để tương thích tốt hơn với Sitecore Pages.
