# Plan: Skate Cart Flow (Mock Edition)
Created: 2026-04-29
Status: 🟡 In Progress

## Overview
Triển khai hệ thống Giỏ hàng (Mini Cart & Add to Cart) sử dụng dữ liệu giả lập (Mock). Hệ thống được thiết kế theo kiến trúc decoupled để dễ dàng thay thế bằng OrderCloud SDK sau này.

## Tech Stack
- **State Management:** Zustand (Global Store).
- **UI Components:** Next.js + Tailwind CSS.
- **Prefix:** `Skate*`
- **Integration:** Mock Service (setTimeout simulation).

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | [Mock Cart Infrastructure](#phase-01) | ⬜ Pending | 0% |
| 02 | [Add to Cart Components](#phase-02) | ⬜ Pending | 0% |
| 03 | [Mini Cart UI (Sidebar)](#phase-03) | ⬜ Pending | 0% |
| 04 | [Integration & Sync](#phase-04) | ⬜ Pending | 0% |

---

## Phase 01: Mock Cart Infrastructure <a name="phase-01"></a>
- [ ] Định nghĩa Interface `SkateCart`, `SkateLineItem` (chuẩn OrderCloud).
- [ ] Tạo `useSkateCartStore` (Zustand) quản lý state giỏ hàng.
- [ ] Viết `mockCartService.ts` giả lập các hàm: `addToCart`, `getCart`, `removeItem`, `updateQty`.

## Phase 02: Add to Cart Components <a name="phase-02"></a>
- [ ] Code component `SkateAddToCartButton`.
- [ ] Gắn vào `SkateProductList` (PLP).
- [ ] Gắn vào `SkateProductDetail` (PDP).

## Phase 03: Mini Cart UI (Sidebar) <a name="phase-03"></a>
- [ ] Code component `SkateMiniCart` (Drawer hiệu ứng trượt).
- [ ] Render danh sách item, tính tổng tiền (Subtotal).
- [ ] Thêm logic xóa nhanh và thay đổi số lượng trực tiếp.

## Phase 04: Integration & Sync <a name="phase-04"></a>
- [ ] Gắn Cart Icon vào Header hiện tại.
- [ ] Hiển thị Badge số lượng realtime.
- [ ] Test luồng: Click Add -> Hiện Toast/Mở Mini Cart -> Xem số lượng tăng.

## Quick Commands
- Bắt đầu: `/code phase-01`
- Xem tiến độ: `/next`
- Lưu kiến thức: `/save-brain`
