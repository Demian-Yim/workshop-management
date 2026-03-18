# workshop-management — CLAUDE.md

> Antigravity FLOW~ 워크샵 관리 웹앱

## 프로젝트 개요

워크샵 참가자 관리, 출석 체크, 팀 배정, 설문, 점심 관리, 게시판 등을 통합 제공하는
웹 애플리케이션. 어드민 / 퍼실리테이터 / 학습자 3가지 역할로 UI가 분리되어 있다.

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS 4 |
| 상태 관리 | Zustand |
| 백엔드/DB | Firebase (Firestore + Auth) |
| 차트 | Recharts |
| QR 코드 | qrcode |

## 폴더 구조

```
src/
├── app/
│   ├── (admin)/        ← 어드민 전용 페이지
│   ├── (facilitator)/  ← 퍼실리테이터 전용 페이지
│   ├── (learner)/      ← 학습자 전용 페이지
│   ├── api/            ← Next.js API 라우트
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── announcements/
│   ├── attendance/
│   ├── board/
│   ├── intro/
│   ├── layout/
│   ├── lunch/
│   ├── review/
│   ├── survey/
│   ├── team/
│   └── ui/
├── hooks/
├── lib/
├── providers/
└── types/
```

## 실행 방법

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm run start
```

## 환경 변수

`.env.local` 파일에 아래 항목을 설정한다 (`.gitignore`에 포함됨):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Claude CLI 작업 원칙

- 파일 수정 전 반드시 해당 파일을 먼저 읽는다
- `(admin)`, `(facilitator)`, `(learner)` 라우트 그룹의 역할 구분을 유지한다
- Firestore 보안 규칙(`firestore.rules`) 변경 시 승인 후 진행한다
- 컴포넌트 추가 시 `src/components/` 하위 기능별 폴더에 배치한다
- 코드 수정 후 `npm run build`로 빌드 성공 확인 필수

## 보안 원칙

- Firebase 설정 값은 `.env.local`에만 저장, 코드에 하드코딩 금지
- Firestore 규칙은 역할별 권한을 명시적으로 정의한다
- 민감 정보가 포함된 파일은 커밋 전 반드시 확인
