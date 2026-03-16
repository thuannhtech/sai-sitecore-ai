# Phase 02: Homepage Construction (Full UI)
Status: ⬜ Pending
Progress: 0%
Dependencies: Phase 01

## 🏗️ Sprint 2.1: Navigation & Structure
- [ ] **Component 0 - TailstoreHeader:** Logo, Menu đa cấp, Search bar, Quick Cart toggle.
- [ ] **Component 8 - TailstoreFooter:** Link columns, Social links, Payment icons, Copyright.
- [ ] **TailstoreGlobalLayout:** Next.js Layout wrapper with Header/Footer.

## 🖼️ Sprint 2.2: Hero & Banners
- [ ] **Component 1 - TailstoreHeroSlider:** Tích hợp Swiper.js, support multiple slides.
- [ ] **Component 2 - TailstoreCategoryBanners:** Khối 3 cột (Men, Women, Accessories) với hiệu ứng hover.
- [ ] **Component 5 - TailstorePromoBanner:** Banner giữa trang với danh sách các nút CTA.

## 🛒 Sprint 2.3: Commerce UI Components
- [ ] **TailstoreProductCard (Molecule):** Thẻ sản phẩm chuẩn style Tailstore.
- [ ] **Component 3 - TailstoreProductGrid:** Container hiển thị danh sách sản phẩm.

## 📢 Sprint 2.4: Content & Engagement
- [ ] **Component 4 - TailstoreBrandSlider:** Logo carousel cho các đối tác thương hiệu.
- [ ] **Component 6 - TailstoreBlogGrid:** Grid hiển thị 3 bài viết mới nhất.
- [ ] **Component 7 - TailstoreNewsletter:** Khối đăng ký email.

## 📂 Files to Create/Modify
- `src/components/layout/TailstoreHeader.tsx`, `TailstoreFooter.tsx`
- `src/components/home/TailstoreHeroSlider.tsx`, `TailstoreCategoryBanners.tsx`, `TailstorePromoBanner.tsx`
- `src/components/home/TailstoreBrandSlider.tsx`, `TailstoreBlogGrid.tsx`, `TailstoreNewsletter.tsx`
- `src/components/shared/TailstoreProductCard.tsx`, `TailstoreProductGrid.tsx`

## ✅ Test Criteria
- [ ] Toàn bộ UI khớp với bản gốc Tailstore HTML.
- [ ] Các Component nhận Props chuẩn sẵn sàng cho Sitecore JSS Mapping.
- [ ] Swiper Cloud/Sliders hoạt động mượt mà trên Mobile & Desktop.

---
Next Phase: [Phase 03: Blog Development](phase-03-blog.md)
