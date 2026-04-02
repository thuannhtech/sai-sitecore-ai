# Plan: Azure CI/CD Pipeline
Created: 2026-04-01
Status: 🟡 In Progress

## Overview
Thiết lập CI/CD pipeline bằng GitHub Actions để tự động build và deploy Next.js 15 (thiết lập working-directory tại `examples/kit-nextjs-skate-park`) lên Azure App Service trên môi trường Windows (iisnode).

## Tech Stack
- Frontend: Next.js 15, React 19, Tailwind 4
- CI/CD: GitHub Actions (Node 22 LTS, `azure/webapps-deploy@v2`)
- Hosting: Azure App Service Windows (iisnode)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Cấu hình Next.js cho Azure Windows | ⬜ Pending | 0% |
| 02 | Chuẩn bị GitHub Secrets | ⬜ Pending | 0% |
| 03 | Xây dựng Github Actions YAML | ⬜ Pending | 0% |
| 04 | Chạy thử & Monitor | ⬜ Pending | 0% |

## Biến Môi Trường (Environments)
- `SITECORE_EDGE_CONTEXT_ID`
- `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID`
- `NEXT_PUBLIC_DEFAULT_SITE_NAME`
- `SITECORE_EDITING_SECRET`

## Quick Commands
- Bắt đầu xem/code Phase 1: `/code phase-01`
- Xem tiến độ: `/next`
