# 🚀 POC Ecommerce: Sitecore XM Cloud + Headless Commerce (v2.0)

## 1. Tổng quan dự án (Project Overview)
Dự án Proof of Concept (POC) triển khai hệ thống thương mại điện tử Headless sử dụng bộ giải pháp hiện đại của Sitecore.

- **CMS:** Sitecore XM Cloud
- **Commerce:** Headless Commerce (v2.0)
- **Frontend SDK:** Next.js Content SDK
- **Framework:** Next.js 15 (App Router)
- **Naming Convention:** Tất cả các component phục vụ POC sử dụng prefix **`Skate`**.

---

## 2. Các thành phần đã triển khai (Implemented Components)

### 📝 Biểu mẫu cơ bản (Basic Form)
- **File:** `src/components/forms/BasicForm.tsx`
- **Chức năng:** Tự động chuyển đổi dữ liệu từ Sitecore Datasource thành Form động. 
- **Tính năng:**
    - Hỗ trợ nhiều loại field: `text`, `email`, `password`, `checkbox`, `select`, `textarea`, `link`.
    - Tích hợp Skeleton loading state.
    - Xử lý Validation (Required, Min/Max Length, Email format).
    - Hỗ trợ Redirect sau khi submit thành công.

### 🛒 Giỏ hàng (Skate Cart)
- **Folder:** `src/components/SkateCart/`
- **Chức năng:** Quản lý trạng thái giỏ hàng và các tương tác thêm sản phẩm.
- **Thành phần chính:** `SkateAddToCartButton` (Nút thêm vào giỏ hàng với hiệu ứng animation).

### 🔍 Danh sách sản phẩm (Skate Product List)
- **Folder:** `src/components/SkateProductList/`
- **Chức năng:** Hiển thị danh mục sản phẩm từ Sitecore/OrderCloud.

### 🖼️ Chi tiết sản phẩm (Skate Product Detail)
- **Folder:** `src/components/SkateProductDetail/`
- **Chức năng:** Trang hiển thị chi tiết thông tin sản phẩm.
- **UI:** Bao gồm Gallery ảnh, thông tin giá, trạng thái kho hàng, mô tả (Rich Text) và các Trust Badges (Warranty, Shipping).

---

## 3. Chi tiết Model sản phẩm (Product Detail Model)

Model `ProductDetail` được định nghĩa trong `src/lib/products.ts` để đảm bảo tính nhất quán dữ liệu giữa Sitecore và Frontend.

```typescript
export type ProductDetail = {
  id: string;               // ID của sản phẩm trong Sitecore
  slug: string;             // Đường dẫn thân thiện (Item Name)
  modelName: string;        // Tên hiển thị của sản phẩm
  descriptionHtml: string;  // Mô tả định dạng HTML (Rich Text từ CMS)
  descriptionPlain: string; // Mô tả dạng text thuần (Dùng cho SEO/Metadata)
  price: number;            // Giá sản phẩm
  quantity: number;         // Số lượng tồn kho
  images: string[];         // Danh sách URL hình ảnh
  orderCloudId?: string;    // ID liên kết với hệ thống OrderCloud (nếu có)
};
```

### Cách thức hoạt động:
1. **Fetching:** Dữ liệu được lấy thông qua GraphQL query trong hàm `getProductBySlug`.
2. **Normalization:** Hàm xử lý slug (decodeURIComponent và replace hyphen) để khớp với Item Name trong Sitecore.
3. **Mapping:** Chuyển đổi từ `jsonValue` của trường Images (Sitecore) sang mảng `string[]` để dễ dàng render trong React.

---

## 4. Ghi chú phát triển (Development Notes)
- Đảm bảo các component tương tác (Interactive) được đánh dấu `'use client'`.
- Sử dụng Atomic Design để tách nhỏ các bộ phận (ví dụ: `SkateAddToCartButton` dùng chung cho cả List và Detail).
- Đồng bộ `rounded-2xl` cho toàn bộ UI cards để giữ tính nhất quán thương hiệu "Skate".
