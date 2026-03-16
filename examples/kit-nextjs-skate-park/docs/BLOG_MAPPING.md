# 🎨 Sitecore Component Mapping: Blog System

Tài liệu này định nghĩa các Rendering và Field cho hệ thống Blog (Listing & Detail).

---

## 1. TailstoreBlogListingHero (Organism)
Banner đầu trang cho danh sách tin tức.
- **Editable Fields:**
  - `Title`: (Single-Line Text) VD: "Discover Our Blog".
  - `Description`: (Single-Line Text) VD: "Stay updated with the latest trends...".
  - `Background Image`: (Image).

## 2. TailstoreBlogSearchFacets (Molecule)
Thanh lọc bài viết dựa trên Facets của Sitecore Search.
- **Fields:**
  - `Facet Name`: (Single-Line Text) VD: "Categories".
  - `Display Mode`: (Droplist) Checkbox / Pills.

## 3. TailstoreBlogSearchResults (Organism)
Container quản lý việc hiển thị kết quả từ Sitecore Search API.
- **Editable Fields:**
  - `Results Per Page`: (Number).
  - `No Results Message`: (Single-Line Text).
- **Sub-components:**
  - `Sorting`: Danh sách các tiêu chí sort.
  - `Result Item`: Template cho từng bài viết.

## 4. TailstoreArticleHeader (Organism)
Phần đầu của trang chi tiết bài viết.
- **Editable Fields (Lấy trực tiếp từ Page Item):**
  - `Title`: (Single-Line Text).
  - `Cover Image`: (Image).
  - `Publish Date`: (Date).
  - `Category`: (Single-Line Text/Drop-tree).
  - `Author Name`: (Single-Line Text).

## 5. TailstoreArticleContent (Organism)
Khối nội dung chính.
- **Editable Fields:**
  - `Main Content`: (Rich Text) Cho phép biên tập văn bản, chèn ảnh, video, quote.

## 6. TailstoreAuthorBio (Molecule)
Thanh thông tin tác giả cuối bài viết.
- **Editable Fields:**
  - `Author Avatar`: (Image).
  - `Author Bio`: (Rich Text).
  - `Social Links`: (General Link List).

## 7. TailstoreRelatedArticles (Organism)
Gợi ý các bài viết liên quan.
- **Editable Fields:**
  - `Section Title`: (Single-Line Text) VD: "Related Posts".
  - `Selection Mode`: (Droplist) "Auto by Category" hoặc "Manual Selection".
  - `Manual List`: (Multilist) Chỉ dùng nếu chọn Manual.

---
## 📄 Blog Page Template (Content Metadata)
Mỗi **Blog Page Item** cần có các field ẩn để phục vụ SEO và hiển thị ở Listing:
- `Browser Title`: (Single-Line Text).
- `Meta Description`: (Rich Text).
- `Blog Thumbnail`: (Image) - Dùng khi hiển thị ở Grid.
- `Excerpt`: (Single-Line Text) - Đoạn tóm tắt ngắn.
