# Infra

> 최종 갱신: 2026-04-09

## 배포 환경

| 항목 | 값 |
|------|-----|
| 플랫폼 | Vercel (Hobby) |
| 프로덕션 URL | https://offline-sim.vercel.app |
| 빌드 리전 | Washington D.C. (iad1) |
| 프레임워크 감지 | Vite (자동) |
| Node.js | 20.x (Vercel 기본) |
| 빌드 명령 | `npm run build` |
| 출력 디렉토리 | `dist/` |
| 함수 없음 | 정적 SPA — 서버사이드 없음 |

## GitHub 연동

| 항목 | 값 |
|------|-----|
| 저장소 | https://github.com/johnnykimZzang/offline-sim |
| 브랜치 | `main` |
| 자동 배포 | `main` push 시 Vercel이 자동 재배포 |
| 프리뷰 배포 | PR 생성 시 고유 URL 자동 생성 |

## 환경 변수

없음. 이 프로젝트는 외부 API / 시크릿 키가 없는 순수 프론트엔드입니다.

## 런타임 설정

- **외부 의존성 0** — React + Vite만. CDN 없음.
- **localStorage** — 사용자별 로컬 저장. 서버 DB 없음.
- **빌드 결과** — index.html + assets/index-*.js (~246KB gzip 74KB) + assets/index-*.css

## 재배포 방법

```bash
# 코드 수정 후 git push → Vercel 자동 재배포
git add . && git commit -m "변경 내용" && git push

# 수동 즉시 배포가 필요한 경우
vercel --prod
```

## Vercel 대시보드

https://vercel.com/kch-3784s-projects/offline-sim
