# Changelog

## [2026-04-29]
### Added
- **Skate Cart System**: Toàn bộ hệ thống giỏ hàng giả lập (Mock).
- **Zustand Store**: Quản lý trạng thái giỏ hàng (`src/lib/cart/store.ts`).
- **SkateMiniCart**: Sidebar giỏ hàng trượt từ phải sang với hiệu ứng mượt mà.
- **SkateAddToCartButton**: Nút bấm thêm vào giỏ hàng với trạng thái loading độc lập.
- **SkateCartToggle**: Nút giỏ hàng trên Header tích hợp badge số lượng realtime.
- **Persistence**: Tự động lưu giỏ hàng vào `localStorage`.

### Changed
- **MenuHeader**: Chuyển về Server Component và tách logic giỏ hàng ra `SkateCartToggle`.
- **Product Details & List**: Tích hợp nút Add to Cart thực tế.
- **Layout**: Tích hợp Mini Cart toàn cục.

### Fixed
- Lỗi `useSyncExternalStore` trong Server Component.
- Lỗi mất dữ liệu giỏ hàng khi chuyển trang/refresh.
- Lỗi toàn bộ nút bấm hiện loading cùng lúc.
