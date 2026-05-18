# Phase 02: Two-Column Search Shell
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Dựng khung trang search blog 2 cột để người dùng vừa mở vào là hiểu họ có thể tìm bài viết gì, lọc ở đâu, và kết quả xuất hiện ở đâu.

## Requirements
### Functional
- [ ] Có layout 2 cột: sidebar trái và results phải.
- [ ] Có ô nhập từ khóa nổi bật, đặt giữa phần nội dung cột phải, sync với URL query.
- [ ] Có phần microcopy hướng dẫn ngắn.
- [ ] Có summary bar hiển thị số lượng kết quả và từ khóa hiện tại.

### Non-Functional
- [ ] Ưu tiên mobile-first.
- [ ] UI phải giữ đúng visual language hiện có của repo.

## Implementation Steps
1. [ ] Thiết kế phần header của page: eyebrow, title, helper copy.
2. [ ] Tổ chức layout 2 cột: trái là facets, phải là search bar + summary + results.
3. [ ] Căn search bar theo trục giữa của vùng content chính để nhìn rõ điểm bắt đầu.
4. [ ] Đồng bộ input với query string mà không phá editor/dynamic routing.
5. [ ] Chuẩn hóa spacing, typography và container width.

## Files to Create/Modify
- `src/components/search/SitecoreSearchResults.tsx` - tạo shell mới cho page search

## Test Criteria
- [ ] Nhập từ khóa và submit sẽ cập nhật URL đúng.
- [ ] Reload trang vẫn giữ lại từ khóa.
- [ ] Layout 2 cột không bị vỡ trên desktop và thu về 1 cột hợp lý trên mobile.

## Notes
Đây là phase “nhìn ra hình” đầu tiên. Nếu cần, có thể chụp screenshot để review UX trước khi đi tiếp.

---
Next Phase: [Phase 03: Blog Results Experience](./phase-03-results.md)
