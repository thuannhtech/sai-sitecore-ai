# 💡 BRIEF: Tailstore Headless E-commerce (Sitecore + OrderCloud)

**Ngày tạo:** 2026-03-16
**Trạng thái:** Brainstorming Finalized

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Chuyển đổi bộ static HTML Tailstore sang một Headless Commerce hoàn chỉnh, cho phép quản lý nội dung linh hoạt (Sitecore) và vận hành thương mại mạnh mẽ (OrderCloud).

## 2. GIẢI PHÁP ĐỀ XUẤT
Sử dụng **Next.js JSS** làm Rendering Host.
- **UI:** Tailwind CSS (giữ nguyên style từ Tailstore).
- **CMS:** Sitecore (Atomic Design - Author có thể tùy chỉnh đến mức atom/molecule).
- **Commerce:** OrderCloud SDK (Quản lý Catalog, Cart, Checkout, Auth).

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **End-user:** Khách mua hàng (Guest & Member).
- **Content Author:** Nhân viên marketing sửa nội dung trên Sitecore.

## 4. TÍNH NĂNG (Features)

### 🚀 MVP (Bắt buộc có):
- [ ] **Home Page Construction:** Hoàn thiện giao diện trang chủ từ `index.html`.
- [ ] **Home Page Sitecore Integration:** Map các thành phần trang chủ vào Sitecore Renderings (Hero, Featured Products, Banners).
- [ ] **Atomic UI Kit (Home focus):** Xây dựng các Atoms/Molecules cần thiết cho trang chủ.
- [ ] **Product Catalog (Read-only):** Hiển thị danh sách sản phẩm trên trang chủ từ OrderCloud.
- [ ] **Fundamental Setup:** Next.js + OrderCloud SDK base.

### 🎁 Phase 2 (Làm sau):
- [ ] **Shopping Cart & Checkout:** Chuyển sang `cart.html` và `checkout.html`.
- [ ] **Authentication:** Login/Logout.
- [ ] **Product Detail Page.**

## 5. CẤU TRÚC COMPONENT DỰ KIẾN (Sitecore)
- **Atoms:** `Button`, `Badge`, `Heading`, `Input`.
- **Molecules:** `ProductCard`, `CartItem`, `NavLink`.
- **Organisms:** `ProductGrid`, `CheckoutForm`, `Header`, `Footer`.

## 6. ƯỚC TÍNH & RỦI RO
- **Độ phức tạp:** Trung bình - Cao (do việc map Atomic Design vào Sitecore JSS đòi hỏi cấu trúc Datasource kỹ lưỡng).
- **Rủi ro:** Cần đảm bảo Token của OrderCloud được quản lý an toàn trong Next.js (client-side vs server-side tokens).

---

## 7. BƯỚC TIẾP THEO
1. Chạy `/plan` để thiết kế chi tiết các Component Mapping và API Flow.
2. Initialize Project nếu chưa có.
