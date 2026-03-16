# Phase 05: Checkout & Braintree Payment
Status: ⬜ Pending
Progress: 0%
Dependencies: Phase 04

## 📝 Objective
Tích hợp quy trình thanh toán an toàn sử dụng **Braintree Gateway** (PayPal Service). Đảm bảo luồng từ Giỏ hàng -> Thanh toán -> Xác nhận đơn hàng mượt mà.

## 🏗️ Sprint 5.1: Braintree Setup & SDK
- [ ] **Braintree Sandbox:** Cấu hình Merchant ID, Public Key, Private Key trong `.env`.
- [ ] **SDK Integration:** Cài đặt `braintree-web-drop-in-react`.
- [ ] **Client Token API:** Viết API route để fetch Client Token từ Braintree server.

## 🏗️ Sprint 5.2: Checkout UI & TailstorePayment
- [ ] **TailstoreCheckoutForm:** Thông tin giao hàng và liên lạc.
- [ ] **TailstoreBraintreeDropIn:** Component hiển thị giao diện thanh toán (Credit Card, PayPal).
- [ ] **Order Summary:** Hiển thị tổng tiền, thuế và phí vận chuyển.

## ⚙️ Sprint 5.3: OrderCloud & Payment Logic
- [ ] **Transaction Processing:** Gửi nonce từ Braintree lên server để thực hiện giao dịch (Authorized/Settle).
- [ ] **OrderCloud Sync:** Cập nhật trạng thái Payment vào Đơn hàng trong OrderCloud.
- [ ] **Success/Fail Pages:** Trang thông báo kết quả giao dịch.

## 📂 Files to Create/Modify
- `src/app/checkout/page.tsx`
- `src/components/checkout/TailstorePaymentForm.tsx`
- `src/lib/braintree.ts`
- `src/app/api/braintree/token/route.ts`

## ✅ Test Criteria
- [ ] Thực hiện giao dịch thành công bằng thẻ Test của Braintree.
- [ ] Token thanh toán được gán đúng vào OrderCloud Order.
- [ ] Xử lý lỗi khi thẻ hết hạn hoặc không đủ số dư.

---
Next Phase: [Phase 06: Sitecore JSS Integration](phase-06-jss.md)
