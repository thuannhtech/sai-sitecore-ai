# Multi-Step Checkout Architecture (v2.0)

Hệ thống Checkout hiện tại là sự kết hợp giữa **Sitecore Component-driven Layout** và **Modern React State Management**.

## 1. Thành phần cốt lõi
- **Orchestrator**: `SkateCheckoutClient.tsx` & `SkateCheckoutStore.ts` (Zustand).
- **UI Components**: `SkateCheckoutStep` (Accordion wrapper), `ShippingMethodForm`, `SkateCheckoutSummaryAction`.
- **Legacy Bridge**: `BasicForm.tsx` (Generic) + `checkout.js` (Custom logic).

## 2. Luồng xử lý (Data Flow)
1. **Bước 1 & 2 (Addresses)**: 
   - Render bởi Sitecore `BasicForm`.
   - Script `/public/storefront/js/checkout.js` đánh chặn sự kiện `submit`.
   - Validate client-side.
   - Gọi `window.SkateCheckoutStore.getState().setShippingAddress(data)` để lưu vào React State.
   - Gọi `setStep(n)` để mở accordion tiếp theo.
2. **Bước 3 (Shipping Method)**: 
   - Render bởi React Component chuyên biệt.
   - Validate qua local state và lưu vào store.
3. **Bước 4 (Payment)**: 
   - Tích hợp Braintree Drop-in.
   - `SkateCheckoutSummaryAction` kiểm tra tổng thể (Validation Orchestrator) trước khi gọi API Submit Order.

## 3. Quy ước đặt tên (Naming Conventions)
Để script `checkout.js` nhận diện đúng form, các Item Sitecore phải đặt tên (Name) chính xác:
- Shipping Form: `CheckoutShippingAddressForm`
- Billing Form: `CheckoutBillingAddressFrom`

## 4. Global API
- Truy cập store từ JS bên ngoài: `window.SkateCheckoutStore.getState()`
