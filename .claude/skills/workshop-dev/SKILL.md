---
name: workshop-dev
description: "워크샵 관리 앱 개발 가이드. Next.js 16 + Firebase + TypeScript 프로젝트의 코딩 컨벤션, Firestore 데이터 모델, 컴포넌트 패턴, 에러 처리 규칙을 정의한다. 워크샵 앱 코드를 수정하거나 기능을 추가할 때 반드시 이 스킬을 참조하라."
---

# Workshop Dev — 워크샵 앱 개발 가이드

## Firestore 데이터 모델

```
courses/{courseId}
  ├── sessions/{sessionId}
  │     ├── participants/{participantId}
  │     ├── attendance/{participantId}
  │     ├── introCards/{participantId}
  │     ├── posts/{postId}
  │     ├── teams/{teamId}
  │     ├── announcements/{announcementId}
  │     ├── lunchPolls/{pollId}
  │     ├── lunchVotes/{participantId}
  │     ├── restaurants/{restaurantId}
  │     ├── menuOrders/{participantId}
  │     ├── reviews/{participantId}
  │     └── surveyResponses/{participantId}
  └── sessionCodes/{codeId}
```

## 역할별 라우트 구분

| 역할 | 라우트 그룹 | 인증 방식 |
|------|-----------|----------|
| 어드민 | `(admin)/dashboard/*` | Firebase Auth (email/password) |
| 퍼실리테이터 | `(facilitator)/present/*` | Firebase Auth |
| 학습자 | `(learner)/session/*` | 세션 코드 (6자리, 인증 없음) |

## 컴포넌트 패턴

- UI 기본 컴포넌트: `src/components/ui/` — button, toast, modal, skeleton, tabs, avatar, badge, card, input, empty-state, feature-closed
- 도메인 컴포넌트: `src/components/{domain}/` — announcements, attendance, board, intro, lunch, review, survey, team
- 레이아웃: `src/components/layout/` — AdminSidebar, FacilitatorToolbar, LearnerHeader, RoleSelector

## 에러 처리 규칙

1. Firestore 작업은 반드시 try/catch로 감싸라
2. 사용자에게 보이는 에러는 toast로 알림: `useToast().addToast({ type: 'error', message: '...' })`
3. 개발자 로그는 `console.error`로 출력
4. API Route에서는 적절한 HTTP 상태 코드 + JSON 응답 반환

## Firestore 유틸 사용법

```typescript
import { getDocument, addDocument, updateDocument, deleteDocument, queryDocuments } from '@/lib/firebase/firestore'

// 조회
const doc = await getDocument<Type>('courses/abc/sessions/xyz')
// 추가
const id = await addDocument('courses/abc/sessions', data)
// 수정
await updateDocument('courses/abc/sessions/xyz', { field: value })
// 삭제
await deleteDocument('courses/abc/sessions/xyz')
// 쿼리
const docs = await queryDocuments<Type>('courses/abc/sessions', [where('status', '==', 'active')])
```

## Zustand 스토어 패턴

세션 상태는 `useSession` 훅 (Zustand + localStorage 퍼시스트):
```typescript
const { sessionCode, courseId, sessionId, participantId, participantName, role } = useSession()
```

## 빌드 & 검증

```bash
npm run build    # Next.js 빌드 (필수)
npm run lint     # ESLint
npx tsc --noEmit # TypeScript 타입 체크
```
