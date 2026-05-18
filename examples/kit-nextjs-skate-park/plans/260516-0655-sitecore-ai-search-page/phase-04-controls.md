# Phase 04: Blog Facets & Navigation
Status: ⬜ Pending
Dependencies: Phase 03

## Objective
Thêm các facet và điều hướng giúp người dùng thu hẹp kết quả blog mà không bị rối: facets bên trái, sort vừa đủ và pagination hoặc load more.

## Requirements
### Functional
- [ ] Có facets ở cột trái: `Categories`, `BlogTags`, `PublishDate`, `Author`.
- [ ] Có sort ít nhưng hữu ích: relevance và newest là đủ cho blog MVP.
- [ ] Có pagination hoặc load more rõ ràng.
- [ ] URL phản ánh state chính để chia sẻ link được.

### Non-Functional
- [ ] Không nhồi quá nhiều filter ngay từ phiên bản đầu.
- [ ] Trải nghiệm mobile phải ưu tiên thao tác ngắn.

## Implementation Steps
1. [ ] Thiết kế sidebar facet theo đúng 4 nhóm đã chốt.
2. [ ] Xác định facet nào mở sẵn và facet nào thu gọn.
3. [ ] Đồng bộ state facet với query string.
4. [ ] Bổ sung event handling cho pagination/load more.

## Files to Create/Modify
- `src/components/search/SitecoreSearchResults.tsx` - thêm controls và navigation state

## Test Criteria
- [ ] Chọn facet làm kết quả thay đổi đúng.
- [ ] Copy URL sang tab mới vẫn khôi phục được state chính.

## Notes
Nếu dữ liệu Sitecore Search chưa expose đủ facet ngay, ưu tiên làm `Categories` và `Author` trước, sau đó bổ sung `BlogTags` và `PublishDate`.

---
Next Phase: [Phase 05: Hardening & Content Integration](./phase-05-hardening.md)
