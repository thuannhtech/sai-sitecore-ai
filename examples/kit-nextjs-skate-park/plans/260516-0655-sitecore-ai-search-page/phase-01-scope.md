# Phase 01: Blog Search Scope & Widget Contract
Status: ⬜ Pending
Dependencies: None

## Objective
Chốt phạm vi blog-only cho search page, đồng thời xác định rõ widget này sẽ lấy field nào để render bài viết và facet nào sẽ xuất hiện ở sidebar trái.

## Requirements
### Functional
- [ ] Chốt page này chỉ search blog.
- [ ] Chốt `rfkId` thật thay cho giá trị `TEST`.
- [ ] Chốt bộ field tối thiểu để render blog card: title, url, image, summary/description, publish date, author, categories, tags.
- [ ] Chốt query param đầu vào: `q`, `page`, `sort`, `category`, `tag`, `author`, `date`.

### Non-Functional
- [ ] Tên field fallback phải an toàn khi dữ liệu blog không đồng nhất.
- [ ] Facet labels phải dễ hiểu với content editor và người đọc.

## Implementation Steps
1. [ ] Review dữ liệu blog trong Sitecore Search và mapping field hiện có.
2. [ ] Định nghĩa data contract cho blog result card.
3. [ ] Chốt naming cho query params và trạng thái URL cho blog search.
4. [ ] Xác nhận 4 facet sidebar: `Categories`, `BlogTags`, `PublishDate`, `Author`.

## Files to Create/Modify
- `src/components/search/SitecoreSearchResults.tsx` - thay placeholder assumptions bằng contract rõ ràng
- `docs/specs/sitecore-ai-search-page-spec.md` - cập nhật nếu scope đổi

## Test Criteria
- [ ] Có danh sách field được dùng thống nhất giữa UI và widget.
- [ ] Không còn hardcoded `TEST` trong kế hoạch triển khai production.

## Notes
Phase này cố ý không chạm DB/API. Mục tiêu chỉ là chốt “trang này đang search blog gì và lọc theo cách nào”.

---
Next Phase: [Phase 02: Two-Column Search Shell](./phase-02-shell.md)
