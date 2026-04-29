# IMPLEMENTATION — Workshop Management Platform
## Padlet + Slido + AhaSlides 대체 통합 플랫폼

> v2.0 · 2026-04-30 · 임정훈 소장 / FLOW~ AX Design Lab  
> 현재 단계: **✅ Phase 1~5 전체 완료 — 프로덕션 운영 중**

---

## 0. 한눈에 보기

| 항목 | 내용 |
|------|------|
| **앱 이름** | Workshop Management Platform |
| **목표** | Padlet + Slido + AhaSlides를 하나로 대체 |
| **기반 앱** | workshop-management (주) + collabstage (인터랙션 이식) |
| **기술 스택** | Next.js 16 · TypeScript · Tailwind CSS 4 · Firebase |
| **역할 구분** | Admin / Facilitator / Learner / Display(프로젝터) |
| **통합 대상** | collabstage · marble-roulette-manager · break-timer |
| **주요 MCP** | Kakao Place API (식당) |

### 대체 목표 매핑

| 기존 도구 | 이 앱의 대응 기능 |
|---------|----------------|
| **Padlet** | 팀 칼럼 보드 · 섹션 · 포스트카드(이미지/PDF/링크) · 댓글 · 좋아요 |
| **Slido** | Live Q&A · 실시간 투표 · 워드클라우드 |
| **AhaSlides** | 퀴즈 · 투표 차트 · 팀 포인트 |
| **Mentimeter** | 워드클라우드 · 감정표현 반응 |

---

## 1. WHY — 왜 통합하는가

### 현재 문제

- workshop-management: 운영(출석·팀·점심)은 갖췄으나 **라이브 인터랙션 부재**
- collabstage: Poll·Q&A·WordCloud는 완성이나 **참가자 관리 인프라 없음**
- 강의 현장에서 Padlet·Slido를 별도로 쓰는 불편함 → 도구 전환 비용 발생

### 통합 후 기대 효과

```
강의 전: 세션 생성 → QR 공유 → 참가자 입장
강의 중: 팀 배정(룰렛) → 보드 작성 → Q&A → 투표 → 워드클라우드
강의 후: 리뷰 수집 → 점심 주문 → 결과 내보내기
```

**모든 단계가 하나의 앱에서, 하나의 Firebase 프로젝트로.**

---

## 2. DDD 도메인 모델

### 바운디드 컨텍스트 (7개)

```
┌─────────────────────────────────────────────────────────────┐
│                   Workshop Platform                          │
│                                                             │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │ Session  │  │ Participant │  │       Team           │   │
│  │ 생성·코드 │  │ 합류·출석   │  │ 배정·룰렛·리더       │   │
│  └────┬─────┘  └──────┬──────┘  └──────────────────────┘   │
│       │               │                                     │
│  ┌────▼───────────────▼──────────────────────────────────┐  │
│  │                  Board (Padlet)                        │  │
│  │  팀 칼럼 · 섹션 · 포스트(이미지/PDF) · 댓글 · 좋아요   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Engagement (Slido/AhaSlides)             │   │
│  │        Q&A · Poll · WordCloud · Quiz · Timer         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────┐  ┌──────────────────────────────────┐   │
│  │     Lunch      │  │           Display                │   │
│  │ 식당·메뉴·주문  │  │  프로젝터 모드 · 실시간 피드백    │   │
│  └────────────────┘  └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 핵심 도메인 이벤트 (Event Storming)

```
[Session]
SessionCreated → QRCodeGenerated → SessionActivated → SessionClosed

[Participant]
ParticipantJoined → AttendanceRecorded → ProfileCreated (selfie + AI character)

[Team]
RouletteSpun → TeamAssigned → TeamColorSet → LeaderDesignated

[Board]
BoardSectionCreated → PostCreated → ImageAttached → PostLiked → CommentAdded → PostPinned

[Engagement]
ActivityActivated(poll|qa|wordcloud|quiz|timer)
  → VoteCast → PollResultsLive
  → QuestionAsked → QuestionUpvoted → QuestionAnswered
  → WordSubmitted → CloudRendered
  → TimerStarted → TimerExpired

[Lunch]
RestaurantSearched(Kakao) → MenuLoaded → VoteCast → OrderPlaced → OrderSummaryExported

[Session End]
ReviewSubmitted → SurveyCompleted → ReportExported
```

---

## 3. Firestore 데이터 구조

### 기존 경로 (변경 없음)
```
courses/{courseId}/
  sessions/{sessionId}/
    posts/{postId}           ← Board 포스트
    attendance/{userId}      ← 출석
    teams/{teamId}           ← 팀
    survey/{userId}          ← 설문
    review/{userId}          ← 리뷰
    lunchVotes/{userId}      ← 점심 투표
    menuOrders/{userId}      ← 주문
```

### 신규 추가 경로
```
courses/{courseId}/sessions/{sessionId}/
  boardSections/{sectionId}            ← Padlet 섹션
    { title, color, teamId, orderIndex }
  
  posts/{postId}/
    comments/{commentId}               ← 포스트 댓글
      { authorId, authorName, content, createdAt }
  
  activities/{activityId}              ← Engagement 활동
    { type, title, prompt, isActive, orderIndex }
    votes/{userId}                     ← Poll 투표
      { optionId, createdAt }
    questions/{questionId}             ← Q&A 질문
      { content, authorName, upvoteCount, upvotedBy[], answered }
    words/{wordId}                     ← WordCloud 단어
      { word, authorId, createdAt }
```

---

## 4. 타입 구조 (TypeScript)

### board.ts 확장
```typescript
// 기존 Post → 확장
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  teamId: string | null;
  content: string;
  imageUrl: string | null;
  category: string | null;
  likeCount: number;
  likedBy: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // 신규
  sectionId: string | null;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange' | null;
  pinned: boolean;
  attachments: Attachment[];
}

export interface BoardSection {
  id: string;
  title: string;
  color: string;
  teamId: string | null;
  orderIndex: number;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
}

export interface Attachment {
  type: 'image' | 'pdf' | 'link';
  url: string;
  name: string;
}
```

### engagement.ts (신규)
```typescript
export type ActivityType = 'poll' | 'qa' | 'wordcloud' | 'quiz' | 'timer';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  prompt: string | null;
  isActive: boolean;
  orderIndex: number;
  options?: PollOption[];    // poll 전용
  duration?: number;         // timer 전용 (초)
  createdAt: Timestamp;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

export interface QAQuestion {
  id: string;
  content: string;
  authorName: string;
  upvoteCount: number;
  upvotedBy: string[];
  answered: boolean;
  createdAt: Timestamp;
}

export interface WordEntry {
  id: string;
  word: string;
  authorId: string;
  createdAt: Timestamp;
}
```

### session.ts 확장
```typescript
// SessionSettings에 추가
export interface SessionSettings {
  // 기존
  attendanceOpen: boolean;
  boardOpen: boolean;
  lunchPollOpen: boolean;
  lunchOrderOpen: boolean;
  reviewOpen: boolean;
  surveyOpen: boolean;
  introOpen: boolean;
  // 신규
  engagementOpen: boolean;   // Engagement 기능 전체 토글
  activeActivityId: string | null; // 현재 표시 중인 Activity
}
```

---

## 5. 구현 단계 (5 Phases)

### Phase 1: Board → Padlet급 업그레이드 ← **현재**
**기간**: 2~3일  
**목표**: 팀 칼럼 레이아웃 · 섹션 · 댓글 · 카드 색상

#### 변경 파일
| 파일 | 작업 |
|------|------|
| `src/types/board.ts` | Post 확장, BoardSection/Comment/Attachment 추가 |
| `src/components/board/TeamColumnBoard.tsx` | **신규** — 팀별 칼럼 레이아웃 (Padlet 스타일) |
| `src/components/board/BoardSection.tsx` | **신규** — 드래그 가능 섹션 헤더 |
| `src/components/board/PostCard.tsx` | 색상 배지, 핀, 댓글 카운트 추가 |
| `src/components/board/PostBoard.tsx` | 뷰 모드 토글 (masonry ↔ column) |
| `src/components/board/CommentSheet.tsx` | **신규** — 포스트 댓글 Bottom Sheet |
| `src/hooks/usePosts.ts` | 섹션 필터링, 댓글 sub-collection 추가 |
| `src/hooks/useComments.ts` | **신규** — 댓글 실시간 훅 |
| `src/lib/firebase/firestore.ts` | 댓글 addComment 헬퍼 추가 |

#### 핵심 UI 동작
```
Facilitator: 섹션 생성 → 색상/팀 지정 → 화면에 칼럼 배치
Learner: 포스트 작성 → 색상 선택 → 이미지 첨부 → 팀 칼럼에 표시
Display: 팀 칼럼 전체 보드 실시간 반영
```

---

### Phase 2: collabstage 인터랙션 이식
**기간**: 2~3일  
**목표**: Poll · Q&A · WordCloud Firebase 기반으로 이식

#### 이식 소스 → 목적지
| collabstage | workshop-management |
|-------------|---------------------|
| `components/interactive/poll-view.tsx` | `src/components/engagement/PollView.tsx` |
| `components/interactive/qa-view.tsx` | `src/components/engagement/QAView.tsx` |
| `components/interactive/wordcloud-view.tsx` | `src/components/engagement/WordCloudView.tsx` |
| `components/session/activity-manager.tsx` | Facilitator 패널 ActivityPanel에 통합 |

#### 변경 파일
| 파일 | 작업 |
|------|------|
| `src/types/engagement.ts` | **신규** — Activity/Poll/QA/Word 타입 |
| `src/components/engagement/PollView.tsx` | collabstage 이식 + Firebase 전환 |
| `src/components/engagement/QAView.tsx` | collabstage 이식 + Firebase 전환 |
| `src/components/engagement/WordCloudView.tsx` | collabstage 이식 + Firebase 전환 |
| `src/components/engagement/ActivityPanel.tsx` | **신규** — Facilitator용 활동 관리 패널 |
| `src/hooks/usePoll.ts` | **신규** |
| `src/hooks/useQA.ts` | **신규** |
| `src/hooks/useWordCloud.ts` | **신규** |
| `src/app/(facilitator)/present/page.tsx` | ActivityPanel 추가 |
| `src/app/(learner)/session/page.tsx` | 활성 Activity에 따라 화면 전환 |
| `src/app/display/page.tsx` | Engagement 화면 Display 모드 추가 |
| `firestore.rules` | activities/votes/questions/words 권한 추가 |

---

### Phase 3: marble-roulette + break-timer 통합
**기간**: 1일  
**목표**: 팀 배정 룰렛 + 세션 타이머 내장

#### 변경 파일
| 파일 | 작업 |
|------|------|
| `src/components/team/TeamRoulette.tsx` | **신규** — marble-roulette 로직 포팅 (Canvas 애니메이션) |
| `src/components/session/BreakTimer.tsx` | **신규** — break-timer 포팅 (Fullscreen 지원) |
| `src/app/(facilitator)/present/page.tsx` | 룰렛 · 타이머 버튼 추가 |

---

### Phase 4: 디자인 시스템 오버홀
**기간**: 2~3일  
**목표**: collabstage 디자인 토큰 전체 적용 → Padlet급 비주얼

#### 적용 토큰 (collabstage → workshop-management)
```css
/* 브랜드 */
--brand-500: #6366f1;
--brand-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);

/* 포스트 카드 색상 팔레트 */
--accent-yellow: #fef3c7;   --accent-yellow-ink: #a16207;
--accent-pink:   #fce7f3;   --accent-pink-ink:   #9d174d;
--accent-blue:   #dbeafe;   --accent-blue-ink:   #1e40af;
--accent-green:  #d1fae5;   --accent-green-ink:  #047857;
--accent-purple: #ede9fe;   --accent-purple-ink: #6d28d9;
--accent-orange: #ffedd5;   --accent-orange-ink: #c2410c;

/* 그림자 */
--shadow-brand: 0 10px 32px -8px rgb(99 102 241 / 0.35);

/* 모션 */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

#### 변경 파일
| 파일 | 작업 |
|------|------|
| `src/app/globals.css` | 디자인 토큰 전면 교체 + 애니메이션 클래스 추가 |
| `src/components/ui/card.tsx` | 배경 이미지 지원, 그라데이션 variant 추가 |
| `src/components/ui/button.tsx` | brand-gradient variant, FAB(Floating Action Button) 추가 |
| `src/components/ui/badge.tsx` | accent 색상 variant (sticky-note 팔레트) 추가 |
| `src/components/board/PostCard.tsx` | sticky-note 색상 배경 스타일 완성 |
| `src/app/display/page.tsx` | 풀스크린 그라데이션 배경, 큰 타이포그래피 |

---

### Phase 5: Kakao MCP + K Skill 고도화
**기간**: 1~2일  
**목표**: 식당 검색 강화 + 설문/리뷰 AI 요약

#### Kakao Place MCP 활용
현재 `useKakaoSearch.ts`는 키워드 검색만 가능.  
개선: 카테고리 필터 · 영업시간 · 거리 · 별점 표시

```typescript
// src/app/api/kakao/search/route.ts 개선
// 기존: keyword만
// 추가: category_group_code(FD6=음식점, CE7=카페), radius, sort
```

#### K Skill 활용
- `src/app/api/ai/summarize/route.ts` — **신규**: 설문 응답 → 핵심 키워드 + 요약 문장
- `src/components/survey/SurveyInsights.tsx` — **신규**: AI 인사이트 패널

---

## 6. 팀 에이전트 전략

| 에이전트 | 역할 | 투입 Phase |
|---------|------|-----------|
| `expert-frontend` | TeamColumnBoard 레이아웃 설계 | 1 |
| `expert-backend` | Firestore 스키마 + 보안 규칙 | 1, 2 |
| `tdd-guide` | 훅 단위 테스트 | 전 Phase |
| `code-reviewer` | 각 Phase PR 리뷰 | 각 완료 후 |
| `security-reviewer` | Firestore rules 검토 | 2 완료 후 |
| `designer` | 디자인 토큰 스펙 → CSS 변환 | 4 시작 전 |

---

## 7. MCP 활용 계획

| MCP | 용도 | Phase |
|-----|------|-------|
| **Kakao Place** | 식당 검색 · 카테고리 · 영업시간 · 거리 | 5 |
| **Korean K Skill** | 설문 응답 키워드 추출 · 리뷰 요약 | 5 |
| **Notion** | 세션 결과 리포트 자동 백업 | 5 |
| **Google Calendar** | 워크샵 일정 연동 (선택) | 5 |

---

## 8. Definition of Done (완료 기준)

### 기능 기준
- [ ] **Board**: 팀 칼럼 레이아웃 — 팀별 포스트가 분리 표시
- [ ] **Board**: 댓글 달기 → 실시간 반영 (Firestore onSnapshot)
- [ ] **Board**: 포스트 색상 6종 · 이미지 첨부 · 핀 고정
- [ ] **Poll**: 투표 제출 → 실시간 차트 업데이트
- [ ] **Q&A**: 질문 제출 · 추천(upvote) · 답변 완료 표시
- [ ] **WordCloud**: 단어 제출 → 클라우드 실시간 렌더링
- [ ] **TeamRoulette**: 룰렛 돌리기 → 팀 자동 배정
- [ ] **Timer**: 풀스크린 타이머 작동
- [ ] **Display**: 프로젝터 모드에서 Board/Poll/Q&A/WordCloud 전환 표시

### 기술 기준
- [ ] `npm run build` — 타입 에러 0, 경고 0
- [ ] 모바일(375px) — 포스트 작성→제출 전체 플로우 완료
- [ ] Firestore 보안 규칙 — 역할별 권한 명시적 적용
- [ ] Lighthouse Performance ≥ 80 (모바일)

---

## 9. 빠른 참조

### 현재 파일 구조 (핵심만)
```
src/
├── types/
│   ├── board.ts          ← Phase 1 확장
│   ├── session.ts        ← Phase 2 확장 (SessionSettings)
│   ├── engagement.ts     ← Phase 2 신규
│   └── (기존 유지)
├── components/
│   ├── board/
│   │   ├── PostCard.tsx       ← Phase 1 수정
│   │   ├── PostBoard.tsx      ← Phase 1 수정
│   │   ├── TeamColumnBoard.tsx← Phase 1 신규
│   │   ├── BoardSection.tsx   ← Phase 1 신규
│   │   └── CommentSheet.tsx   ← Phase 1 신규
│   ├── engagement/            ← Phase 2 전체 신규
│   │   ├── ActivityPanel.tsx
│   │   ├── PollView.tsx
│   │   ├── QAView.tsx
│   │   └── WordCloudView.tsx
│   ├── team/
│   │   └── TeamRoulette.tsx   ← Phase 3 신규
│   └── session/
│       └── BreakTimer.tsx     ← Phase 3 신규
├── hooks/
│   ├── usePosts.ts            ← Phase 1 확장
│   ├── useComments.ts         ← Phase 1 신규
│   ├── usePoll.ts             ← Phase 2 신규
│   ├── useQA.ts               ← Phase 2 신규
│   └── useWordCloud.ts        ← Phase 2 신규
└── app/
    ├── (facilitator)/present/page.tsx  ← Phase 1,2,3 수정
    ├── (learner)/session/page.tsx      ← Phase 2 수정
    └── display/page.tsx               ← Phase 1,2,4 수정
```

### collabstage 이식 참조 경로
```
d:/00 Antigravity/ACTIVE/collabstage/src/
├── components/interactive/    ← Poll, Q&A, WordCloud
├── components/board/          ← wall-board (floating composer 패턴)
├── components/session/        ← activity-manager
└── app/globals.css            ← 디자인 토큰 전체
```
