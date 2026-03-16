# 🎨 Sitecore Component Mapping: Tailstore Home Page

Dưới đây là danh sách chi tiết các Rendering và các Field cho phép Content Author biên tập.

---

## 0. TailstoreHeader (Global Organism)
Thanh điều hướng chính của website.
- **Editable Fields:**
  - `Logo`: (Image) Logo thương hiệu.
  - `Main Menu`: (Treelist/Multilist) Danh sách các Navigation Items. Mỗi Item sẽ có:
    - `Title`: (Single-Line Text).
    - `Link`: (General Link).
    - `Sub Menu Items`: (Treelist/Children) Các menu cấp con (VD: Men Item 1, 2, 3...).
  - `Login Label`: (Single-Line Text) VD: "Login".
  - `Register Label`: (Single-Line Text) VD: "Register".
  - `Enable Search`: (Checkbox) Bật/tắt thanh tìm kiếm.
  - `Enable Cart Preview`: (Checkbox) Bật/tắt dropdown giỏ hàng nhanh.

## 1. TailstoreHeroSlider (Organism)
Bộ chuyển động banner đầu trang.
- **Data Structure:** List of Hero Slides (Datasource lồng nhau hoặc Content List).
- **Editable Fields (per Slide):**
  - `Background Image`: (Image) Ảnh nền banner.
  - `Title`: (Single-Line Text) VD: "Women", "Men".
  - `Description`: (Rich Text) VD: "Experience the best in sportswear...".
  - `CTA Label`: (Single-Line Text) VD: "Shop now".
  - `CTA Link`: (General Link) URL đích khi click.

## 2. TailstoreCategoryBanners (Organism)
Khối 3 cột (Men, Women, Accessories).
- **Editable Fields (per Banner):**
  - `Image`: (Image) Ảnh minh họa category.
  - `Category Name`: (Single-Line Text).
  - `Link`: (General Link) Link tới trang Shop tương ứng.

## 3. TailstoreProductGrid (Organism)
Dùng cho "Popular Products" và "Latest Products".
- **Editable Fields:**
  - `Section Title`: (Single-Line Text) VD: "Popular products".
  - `OrderCloud Category ID`: (Single-Line Text) ID của Category trong OrderCloud để component tự fetch sản phẩm.
  - `Max Items`: (Number) Số lượng sản phẩm hiển thị (mặc định 4).

## 4. TailstoreBrandSlider (Organism)
Dải logo các thương hiệu.
- **Editable Fields:**
  - `Heading`: (Single-Line Text) VD: "Discover Our Brands".
  - `Subheading`: (Single-Line Text) VD: "Explore the top brands...".
  - `Brand Logos`: (Treelist/Multilist) Danh sách các item chứa ảnh logo (SVG/PNG).

## 5. TailstorePromoBanner (Organism)
Banner lớn ở giữa trang ("Welcome to Our Shop").
- **Editable Fields:**
  - `Background Image`: (Image).
  - `Main Title`: (Single-Line Text).
  - `CTA Links`: (General Link List) Cho phép tạo nhiều nút như "Shop Now", "New Arrivals", "Sale".

## 6. TailstoreBlogGrid (Organism)
Hiển thị danh sách các bài viết Blog từ các Page có sẵn.
- **Editable Fields:**
  - `Section Title`: (Single-Line Text).
  - `Description`: (Single-Line Text).
  - `Blog Source`: (Treelist/Multilist) Người dùng chọn các **Blog Page Items**. Component sẽ tự động lấy dữ liệu từ các Page này:
    - `Image`: Lấy từ field `Blog Thumbnail` của Page.
    - `Category`: Lấy từ field `Category` của Page.
    - `Title`: Lấy từ `Page Title`.
    - `Summary`: Lấy từ `Meta Description` hoặc `Excerpt` của Page.
    - `Link`: Tự động trỏ về URL của Page đó.

## 7. TailstoreNewsletter (Organism)
Sử dụng **Sitecore Forms** để quản lý việc đăng ký.
- **Editable Fields:**
  - `Heading`: (Rich Text) VD: "Join our newsletter and **get $50 discount**...".
  - `Form Selection`: (Form Selector) Chọn Sitecore Form tương ứng.
  - `Submit Success Message`: (Rich Text) Thông báo sau khi đăng ký thành công.

## 8. TailstoreFooter (Global Organism)
- **Editable Fields:**
  - `Menu Columns`: (Multilist) Các cột link (Shop, Pages, Account).
  - `Shop Description`: (Rich Text).
  - `Contact Info`: (Rich Text).
  - `Social Links`: (General Link List).
  - `Payment Icons`: (Image List).
  - `Copyright Text`: (Single-Line Text) VD: "&copy; 2024 Your Company. All rights reserved."
