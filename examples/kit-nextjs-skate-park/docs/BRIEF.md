# 💡 BRIEF: Tailstore Headless E-commerce (Sitecore + OrderCloud + Braintree)

**Ngày tạo:** 2026-03-16
**Trạng thái:** 🟢 Brainstorming Finalized (v2.0)

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Chuyển đổi bộ static HTML Tailstore sang một Headless Commerce hoàn chỉnh, tích hợp hệ thống thanh toán quốc tế và khả năng tìm kiếm thông minh.

## 2. GIẢI PHÁP ĐỀ XUẤT
Sử dụng **Next.js 15 (App Router)** làm nền tảng.
- **UI:** Tailwind CSS với quy tắc đặt tên component `Tailstore*`.
- **CMS:** Sitecore XM Cloud (Headless JSS).
- **Commerce:** OrderCloud SDK (Catalog & Order).
- **Search:** Sitecore Search (Headless Search cho Blog & Catalog).
- **Payment:** Braintree Payment Gateway (PayPal Service).

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Khách hàng:** Trải nghiệm mua sắm nhanh, thanh toán an toàn, tìm kiếm thông minh.
- **Quản trị viên:** Biên tập nội dung linh hoạt qua Sitecore, quản lý sản phẩm qua OrderCloud.

## 4. LỘ TRÌNH PHÁT TRIỂN (Phases)

### 🚀 Phase 1: Nền tảng (Foundation)
- Thiết lập Next.js, Sitecore SDK và OrderCloud SDK.
- Cấu hình môi trường Sandbox.

### 🖼️ Phase 2: Trang chủ (Homepage - Full UI)
- Toàn bộ các component `TailstoreHeader`, `TailstoreHeroSlider`, `TailstoreProductGrid`, `TailstoreFooter`...
- Đảm bảo 100% UI khớp bản gốc HTML.

### ✍️ Phase 3: Blog (Sitecore Search Ready)
- Trang danh sách bài viết dùng Sitecore Search (Facets, Sort).
- Trang chi tiết bài viết (Rich Text, Metadata).

### 🛒 Phase 4: Shop & Sản phẩm
- Catalog sản phẩm thực tế từ OrderCloud.
- Trang chi tiết sản phẩm.

### 💳 Phase 5: Thanh toán Braintree
- Tích hợp Braintree Drop-in UI.
- Luồng Checkout an toàn (Transaction logic).

### ⚙️ Phase 6: Sitecore JSS Integration
- Mapping Renderings lên Sitecore XM Cloud.
- Final Testing & Optimization.

## 5. QUY TẮC PHÁT TRIỂN (Ground Rules)
- **Naming:** Tất cả Component phải bắt đầu bằng prefix `Tailstore` (VD: `TailstoreButton`).
- **Atomic Design:** Chia nhỏ UI thành Molecule/Organism để tối ưu khả năng biên tập trong Sitecore.
- **Search-First:** Xây dựng UI Blog/Shop sẵn sàng cho việc cắm Sitecore Search API.

## 6. ƯỚC TÍNH & RỦI RO
- **Độ phức tạp:** Cao (Kết hợp 3 hệ thống lớn: Sitecore, OrderCloud, Braintree).
- **Rủi ro:** Cần quản lý kỹ việc đồng bộ dữ liệu Payment giữa Braintree và OrderCloud để tránh mất đơn hàng.

---

## 7. BƯỚC TIẾP THEO
→ Chạy `/code phase-01` để bắt đầu thiết lập Project.
