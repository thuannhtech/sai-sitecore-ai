# Phase 03: Blog Development (List & Detail)
Status: ⬜ Pending
Progress: 0%
Dependencies: Phase 02

## 📝 Objective
Xây dựng hệ thống Blog hoàn chỉnh dựa trên phong cách thiết kế của Tailstore. Do bản gốc HTML chưa có trang Blog riêng, chúng ta sẽ phát triển 2 mẫu trang (Sample Pages) chuẩn SEO và JSS-ready.

## 🏗️ Sprint 3.1: Blog Listing (Sitecore Search Ready)
- [ ] **TailstoreBlogSearchResults:** Component hiển thị danh sách bài viết nhận dữ liệu từ Search API.
- [ ] **TailstoreBlogSearchFacets:** Thanh lọc bài viết sử dụng Sitecore Search Facets.
- [ ] **TailstoreBlogSortOptions:** Sắp xếp kết quả tìm kiếm.
- [ ] **TailstoreBlogSearchBox:** Khối tìm kiếm bài viết.
- [ ] **TailstoreBlogPagination:** Xử lý phân trang.

## 🏗️ Sprint 3.2: Blog Detail Page
- [ ] **TailstoreArticleHeader:** Banner lớn chứa tiêu đề, tác giả, ngày đăng.
- [ ] **TailstoreArticleContent:** Layout cho nội dung bài viết.
- [ ] **TailstoreSocialShare:** Cụm nút chia sẻ.
- [ ] **TailstoreAuthorBio:** Khối thông tin tác giả.
- [ ] **TailstoreRelatedArticles:** Hiển thị bài viết liên quan.

## ⚙️ Sprint 3.3: Mock Data & Structure
- [ ] **Data Modeling:** Định nghĩa cấu trúc dữ liệu `BlogPost` (Id, Title, Image, Category, Content, Excerpt).
- [ ] **Dynamic Routing:** Cấu hình Next.js Dynamic Routes để render bài viết theo slug.

## 📂 Files to Create/Modify
- `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`
- `src/components/blog/TailstoreBlogSearchFacets.tsx`
- `src/components/blog/TailstoreArticleContent.tsx`
- `src/components/blog/TailstoreRelatedArticles.tsx`
- `src/components/blog/TailstoreAuthorBio.tsx`

## ✅ Test Criteria
- [ ] Click từ Homepage Blog Section dẫn đúng sang Blog Detail.
- [ ] Layout Blog Detail hiển thị đúng font (Manrope) và màu sắc hệ thống.
- [ ] Mobile view: Blog List và Detail hiển thị gọn gàng, không tràn khung.

---
Next Phase: [Phase 04: Shop & Ordering System](phase-04-shop.md)
