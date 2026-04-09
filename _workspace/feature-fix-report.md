# Feature Fix Report

**Date:** 2026-04-03
**Scope:** 7 feature issues (2 HIGH, 3 MEDIUM, 2 LOW)

---

## 1. HIGH: Export API 구현

**File:** `src/app/api/export/route.ts`

- Firestore에서 실제 데이터를 조회하여 CSV로 변환하도록 전면 재작성
- Firebase 클라이언트 SDK (`collection`, `getDocs`, `query`) 사용
- 지원 타입: attendance, posts, survey, reviews, lunch
- 각 타입별 컬렉션 매핑 및 필드 매핑 구현
- CSV 이스케이프 처리 (쉼표, 쌍따옴표, 개행 포함 값)
- Timestamp 객체 자동 변환
- 에러 발생 시 500 응답 + console.error 로깅

## 2. HIGH: Course cascade delete

**Files:**
- `src/lib/firebase/firestore.ts` -- `deleteSubcollections` 헬퍼 추가
- `src/app/(admin)/dashboard/courses/[courseId]/page.tsx` -- 삭제 로직 수정

- `deleteSubcollections(parentPath, subcollectionNames)` 함수 추가
- writeBatch 사용, 500개 문서 제한에 따른 batch 분할 처리
- 삭제 순서: 각 세션의 12개 서브컬렉션 삭제 -> 세션 문서 삭제 -> 코스 문서 삭제
- 대상 서브컬렉션: participants, attendance, introCards, posts, teams, announcements, lunchPolls, lunchVotes, restaurants, menuOrders, reviews, surveyResponses

## 3. MEDIUM: 레거시 Session API 정리

**File:** `src/app/api/session/route.ts` -- 삭제됨

- 4자리 코드 생성 레거시 API 파일 제거
- 앱 전체가 6자리 영숫자 코드 사용 중이므로 불필요

## 4. MEDIUM: 카카오 메뉴 스크래핑 에러 로깅

**File:** `src/app/api/kakao/menu/route.ts`

- catch 블록에 `console.error` 추가 (에러 상세 로깅)
- 응답에 `warning: '메뉴 스크래핑 중 오류가 발생했습니다'` 필드 추가

## 5. MEDIUM: CheckInFlow 업로드 실패 알림

**File:** `src/hooks/useCheckInFlow.ts`

- `toast` import 추가 (`@/components/ui/toast`)
- 셀카 업로드 catch: `console.warn` -> `console.error` + `toast.error('이미지 업로드에 실패했습니다')`
- 캐릭터 업로드 catch: `console.warn` -> `console.error` + `toast.error('이미지 업로드에 실패했습니다')`

## 6. LOW: KakaoMap onMarkerClick 연결

**Files:**
- `src/hooks/useKakaoMap.ts` -- `addMarkerWithInfoWindow`에 optional `onClick` 콜백 파라미터 추가
- `src/components/lunch/KakaoMap.tsx` -- 마커 생성 시 `onMarkerClick` prop 전달

- 마커 클릭 시 infoWindow 열기와 함께 `onMarkerClick(markerId)` 호출

## 7. LOW: togglePoll 에러 핸들링

**File:** `src/app/(facilitator)/present/lunch/page.tsx`

- `togglePoll` 함수에 try/catch 추가
- catch에서 `console.error` + `toast.error('투표 상태 변경에 실패했습니다')`

---

## Summary

| # | Priority | Status | Description |
|---|----------|--------|-------------|
| 1 | HIGH | Fixed | Export API Firestore 연동 |
| 2 | HIGH | Fixed | Course cascade delete |
| 3 | MEDIUM | Fixed | 레거시 Session API 삭제 |
| 4 | MEDIUM | Fixed | 카카오 메뉴 에러 로깅 |
| 5 | MEDIUM | Fixed | CheckInFlow 업로드 실패 toast |
| 6 | LOW | Fixed | KakaoMap onMarkerClick 연결 |
| 7 | LOW | Fixed | togglePoll 에러 핸들링 |
