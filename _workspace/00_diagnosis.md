# Workshop Management App — 진단 보고서

## 보안 이슈 (security-fixer 담당)

### 1. CRITICAL: Firestore 규칙 — 전면 개방
**파일:** `firestore.rules`
**문제:** 세션 하위 컬렉션(participants, attendance, introCards, posts, lunchVotes, reviews, surveyResponses)이 `read, write: if true`로 설정되어 인증 없이 누구나 접근 가능.
**수정 방향:** 학습자 데이터는 세션 코드 기반 접근으로 제한하기 어려움(Firestore 규칙에서 세션 코드 검증 불가). 현실적으로 세션 경로 내 문서만 읽기/쓰기 허용하되, 삭제는 인증 사용자만 가능하도록 제한.

### 2. CRITICAL: Storage 규칙 — 인증 없이 쓰기 허용
**파일:** `storage.rules`
**문제:** `sessions/{sessionId}/**` 경로에 인증 없이 5MB 이미지 업로드 가능.
**수정 방향:** 이미지 업로드는 학습자 셀피 기능에 필요. content-type 검증은 이미 있음. 파일 크기 제한을 더 엄격하게 (2MB), 파일 개수 제한은 Firestore 규칙으로 불가하므로 rate limit 고려.

### 3. HIGH: XSS in KakaoMap InfoWindow
**파일:** `src/hooks/useKakaoMap.ts` (약 line 127)
**문제:** `content: \`<div>...</div>\`` 에서 사용자 입력이 HTML로 직접 삽입됨.
**수정 방향:** HTML 특수문자 이스케이프 함수 적용 (`<`, `>`, `&`, `"`, `'`).

### 4. MEDIUM: Auth 쿠키 보안
**파일:** `src/lib/firebase/auth.ts` (약 line 13)
**문제:** `document.cookie`로 설정하는 `auth-token` 쿠키에 Secure, SameSite 속성 없음.
**수정 방향:** `Secure; SameSite=Strict; Path=/` 속성 추가.

---

## 기능 이슈 (feature-fixer 담당)

### 5. HIGH: Export API 스텁
**파일:** `src/app/api/export/route.ts`
**문제:** CSV 헤더만 반환, 실제 데이터 조회 없음.
**수정 방향:** 쿼리 파라미터로 courseId, sessionId를 받아 Firestore에서 데이터 조회 후 CSV 생성. Firebase 클라이언트 SDK를 API Route에서 사용 (Admin SDK 도입 불필요).

### 6. HIGH: Course 삭제 시 cascade delete 누락
**파일:** `src/app/(admin)/dashboard/courses/[courseId]/page.tsx` (약 line 123)
**문제:** `deleteDoc`으로 course 문서만 삭제. 하위 sessions, participants, attendance 등 서브컬렉션이 orphan으로 남음.
**수정 방향:** batch delete 또는 재귀적 서브컬렉션 삭제 유틸 구현. `src/lib/firebase/firestore.ts`에 `deleteCollectionRecursive` 추가.

### 7. MEDIUM: 레거시 Session API
**파일:** `src/app/api/session/route.ts`
**문제:** 4자리 숫자 세션 코드 생성. 나머지 앱은 6자리 영숫자. Firestore에 쓰지도 않음.
**수정 방향:** 이 파일을 제거하거나, 실제 세션 생성 로직과 통합.

### 8. MEDIUM: 카카오 메뉴 스크래핑 에러 무시
**파일:** `src/app/api/kakao/menu/route.ts` (약 line 47-48)
**문제:** catch 블록에서 에러 로깅 없이 빈 배열 반환.
**수정 방향:** `console.error` 추가 + 응답에 경고 메시지 포함.

### 9. MEDIUM: CheckInFlow 업로드 실패 무시
**파일:** `src/hooks/useCheckInFlow.ts` (약 lines 82-100, 119-146)
**문제:** 백그라운드 업로드 실패 시 `console.warn`만. 사용자 알림 없음.
**수정 방향:** toast로 업로드 실패 알림 + 재시도 옵션.

### 10. LOW: KakaoMap onMarkerClick 미연결
**파일:** `src/components/lunch/KakaoMap.tsx` (약 line 17)
**문제:** `onMarkerClick` prop을 받지만 마커 클릭 이벤트에 연결되지 않음.
**수정 방향:** `kakao.maps.event.addListener(marker, 'click', ...)` 추가.

### 11. LOW: togglePoll 에러 핸들링 누락
**파일:** `src/app/(facilitator)/present/lunch/page.tsx` (약 line 75)
**문제:** try/catch 없음.
**수정 방향:** try/catch + toast 에러 알림.

### 12. LOW: Facilitators 페이지 CRUD 미구현
**파일:** `src/app/(admin)/dashboard/facilitators/page.tsx`
**문제:** course 데이터에서 facilitator를 파생. 독립적인 CRUD 없음.
**판단:** 현재 구조로도 동작함. 개선 우선순위 낮음 — 이번 수정 범위 밖.
