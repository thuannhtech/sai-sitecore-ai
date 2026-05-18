# Phase 03: Blog Results Experience
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Làm cho kết quả search blog dễ đọc và đáng tin hơn: card bài viết rõ ràng, trạng thái loading tốt, empty state có hướng dẫn và error state tử tế.

## Requirements
### Functional
- [ ] Kết quả hiển thị theo card/list có visual hierarchy rõ.
- [ ] Có loading skeleton thay vì chỉ text.
- [ ] Có empty state với hướng dẫn đổi từ khóa.
- [ ] Có error state có thể retry hoặc đổi keyword.
- [ ] Có metadata bài viết như author hoặc publish date nếu dữ liệu có.

### Non-Functional
- [ ] Hình ảnh phải có tỷ lệ ổn định để tránh layout jump.
- [ ] Các text dài cần truncate an toàn.

## Implementation Steps
1. [ ] Refactor `ResultCard` theo dữ liệu blog.
2. [ ] Thêm skeleton/loading block đồng bộ với layout thật.
3. [ ] Tạo empty state giàu ngữ cảnh hơn bản hiện tại.
4. [ ] Tạo error state có CTA hợp lý.

## Files to Create/Modify
- `src/components/search/SitecoreSearchResults.tsx` - refactor card và states

## Test Criteria
- [ ] Loading, error, no result, success đều có UI riêng.
- [ ] Title, description, image fallback hoạt động khi field thiếu.

## Notes
Đây là phase quyết định “trang search blog có đủ cảm giác biên tập và đọc nội dung hay không”.

---
Next Phase: [Phase 04: Blog Facets & Navigation](./phase-04-controls.md)
