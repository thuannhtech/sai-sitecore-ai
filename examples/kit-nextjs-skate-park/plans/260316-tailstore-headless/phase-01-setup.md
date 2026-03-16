# Phase 01: Environment & SDK Setup
Status: ✅ Complete
Dependencies: None

## Objective
Thiết lập môi trường phát triển, cài đặt các SDK cần thiết và cấu hình kết nối tới OrderCloud Sandbox.

## Implementation Steps
1. [x] **Install Dependencies:** Cài đặt `ordercloud-javascript-sdk`, `axios`, và các thư viện hỗ trợ.
2. [x] **Configuration:** Tạo file `.env` chứa `ORDERCLOUD_CLIENT_ID`, `ORDERCLOUD_MARKETPLACE_ID`, `ORDERCLOUD_BASE_API_URL`.
3. [x] **SDK Provider:** Khởi tạo OrderCloud SDK Provider (Context) trong Next.js để quản lý Token toàn ứng dụng.
4. [x] **Connectivity Test:** Viết một script/component nhỏ để fetch list sản phẩm từ Sandbox để test kết nối.

## Files to Create/Modify
- `.env.local` - Cấu hình biến môi trường.
- `src/lib/ordercloud.ts` - Singleton instance cho SDK.
- `src/providers/OrderCloudProvider.tsx` - React Context cho Auth/SDK.

## Test Criteria
- [ ] Chạy `npm run dev` không lỗi.
- [ ] Log được Product List từ OrderCloud Sandbox ra Console.

---
Next Phase: [Phase 02: Homepage Construction](phase-02-homepage.md)
