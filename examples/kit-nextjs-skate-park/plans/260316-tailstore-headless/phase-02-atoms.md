# Phase 02: Home UI Kit (Atoms & Molecules)
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Trích xuất toàn bộ giao diện từ `Tailstore-main/index.html` thành các React Components có thể tái sử dụng.

## Implementation Steps
1. [ ] **Global Layout:** Header & Footer hoàn chỉnh (bao gồm Social links, Payment icons).
2. [ ] **Hero Slider:** Chuyển đổi Swiper slider đầu trang.
3. [ ] **Category Banners:** Khối 3 cột Men/Women/Accessories.
4. [ ] **Brand Slider:** Khối "Discover Our Brands" sử dụng Swiper.
5. [ ] **Blog Grid:** Khối "Discover Our Blog" hiển thị 3 bài viết.
6. [ ] **Newsletter Section:** Khối subscribe hưởng $50 discount.
7. [ ] **Promo Banner:** Khối banner "Welcome to Our Shop" ở giữa trang.
8. [ ] **Product Card Molecule:** Thẻ sản phẩm chuẩn style trang chủ.

## Files to Create/Modify
- `src/components/layout/Header.tsx`, `Footer.tsx`
- `src/components/home/HeroSlider.tsx`, `BrandSlider.tsx`
- `src/components/home/BlogGrid.tsx`, `Newsletter.tsx`
- `src/components/home/PromoBanner.tsx`
- `src/components/shared/ProductCard.tsx`

## Test Criteria
- [ ] Chạy preview layout trang Home giống 90% so với file HTML gốc.

---
Next Phase: [Phase 03: Home Page Assembly](phase-03-home-assembly.md)
