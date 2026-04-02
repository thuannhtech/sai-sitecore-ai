# Phase 01: Cấu hình Next.js cho Azure Windows
Status: ✅ Complete

## Objective
Do Azure App Service (Windows) sử dụng `iisnode` để quản lý và khởi chạy tác vụ Node.js, ứng dụng Next.js cần phải được build ở chế độ Standalone. Ngoài ra ta cần có file `web.config` để iisnode biết cách điều hướng traffic (URL Rewrite) vào đúng entry file khởi tạo của ứng dụng (`server.js`).

## Requirements
### Functional
- [ ] Build Next.js phải ra dạng Standalone (chứa sẵn node_modules ở output để tiết kiệm copy).
- [ ] Tích hợp `web.config` để override config chạy mặc định.

## Implementation Steps
1. [ ] Sửa file `examples/kit-nextjs-skate-park/next.config.ts`, bổ sung cấu hình `output: "standalone"`.
2. [ ] Tạo file `examples/kit-nextjs-skate-park/web.config` với cấu hình url-rewrite chuyển mọi request tới `server.js` (hoặc bootstrap file tương đương).

## Files to Create/Modify
- `examples/kit-nextjs-skate-park/next.config.ts` - Thêm flag standalone.
- `examples/kit-nextjs-skate-park/web.config` - Dành cho iisnode.

---
Next Phase: `/code phase-02`
