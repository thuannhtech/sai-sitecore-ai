# Plan: Sitecore AI Blog Search Page
Created: 2026-05-16T06:55:00+07:00
Status: 🟡 In Progress

## Overview
Thiết kế lại trang search blog dùng Sitecore Search cho dự án Skate Park. Mục tiêu là biến component `SitecoreSearchResults` hiện tại từ một danh sách kết quả cơ bản thành một trang tìm bài viết hoàn chỉnh: ô tìm kiếm rõ ràng, bộ lọc bên trái, kết quả bên phải, và trải nghiệm đọc nội dung mạch lạc.

## Product Direction
- Scope chỉ search blog.
- Layout 2 cột trên desktop.
- Thanh tìm kiếm đặt ở giữa phần nội dung cột phải.
- Cột trái hiển thị facets: `Categories`, `BlogTags`, `PublishDate`, `Author`.
- Luồng chính: nhập từ khóa → lọc facet → xem kết quả → đi tới blog detail.

## Current Context
- Đã có `src/components/search/SitecoreSearchResults.tsx` dùng `@sitecore-search/react`.
- Đã có `SitecoreSearchProvider` để bọc widget khi env hợp lệ.
- Giao diện hiện tại mới có: ô search, số lượng kết quả, danh sách card đơn giản.
- Chưa có layout 2 cột, blog facets sidebar, loading skeleton, empty state giàu ngữ cảnh hoặc cấu hình `rfkId` thực tế.

## Tech Stack
- Frontend: Next.js App Router + React client component
- Search: Sitecore Search widgets (`@sitecore-search/react`)
- Styling: Tailwind CSS theo pattern hiện có
- CMS Integration: Sitecore XM Cloud rendering/component mapping

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | [Blog Search Scope & Widget Contract](./phase-01-scope.md) | ⬜ Pending | 0% |
| 02 | [Two-Column Search Shell](./phase-02-shell.md) | ⬜ Pending | 0% |
| 03 | [Blog Results Experience](./phase-03-results.md) | ⬜ Pending | 0% |
| 04 | [Blog Facets & Navigation](./phase-04-controls.md) | ⬜ Pending | 0% |
| 05 | [Hardening & Content Integration](./phase-05-hardening.md) | ⬜ Pending | 0% |

## Success Criteria
- Người dùng có thể search bằng từ khóa từ URL query `q`.
- Trang search chỉ trả về kết quả blog.
- Desktop có layout 2 cột rõ ràng: trái là facets, phải là search + results.
- Trang hiển thị trạng thái rõ ràng: loading, success, no result, error.
- Kết quả có hierarchy thị giác tốt hơn bản hiện tại.
- Team content có thể cắm component này vào Sitecore page như một rendering bình thường.

## Quick Commands
- Start implementation: `/code phase-02`
- Review the detailed spec: `docs/specs/sitecore-ai-search-page-spec.md`
- Continue with detailed design: `/design`
