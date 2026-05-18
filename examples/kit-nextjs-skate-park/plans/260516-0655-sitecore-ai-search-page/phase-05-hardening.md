# Phase 05: Hardening & Content Integration
Status: ⬜ Pending
Dependencies: Phase 04

## Objective
Hoàn thiện search page để có thể giao cho team content và QA: cấu hình thật, xử lý biên, theo dõi hành vi cơ bản và kiểm tra responsive.

## Requirements
### Functional
- [ ] Dùng cấu hình Sitecore Search thật từ env.
- [ ] Chốt cách component này được gắn vào page trong Sitecore.
- [ ] Có xử lý khi Search Provider không được cấu hình.
- [ ] Có tracking cơ bản cho submit/search result click nếu stack hiện tại hỗ trợ.

### Non-Functional
- [ ] Không làm crash page khi Sitecore Search thiếu config.
- [ ] Giữ component dễ mở rộng cho AI suggestions hoặc featured results sau này.

## Implementation Steps
1. [ ] Rà soát fallback khi `WidgetsProvider` không active.
2. [ ] Chuẩn hóa props và rendering identifier.
3. [ ] Kiểm tra responsive, accessibility cơ bản và copywriting.
4. [ ] Chốt checklist handoff cho QA/content.

## Files to Create/Modify
- `src/components/search/SitecoreSearchResults.tsx` - hardening cuối
- `src/providers/SitecoreSearchProvider.tsx` - nếu cần cải thiện fallback handling

## Test Criteria
- [ ] Trang không crash khi env search thiếu.
- [ ] Component render ổn trong page Sitecore thật.
- [ ] Keyboard navigation cho input/button/card vẫn dùng được.

## Notes
Sau phase này có thể chuyển sang `/design` để chốt chi tiết hơn về data contract và behavior, hoặc `/code phase-02` để bắt đầu dựng UI.
