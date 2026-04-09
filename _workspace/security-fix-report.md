# Security Fix Report

- 작업일: 2026-04-03
- 담당: MAX (Claude)
- 기준: `_workspace/00_diagnosis.md` 보안 진단 보고서

---

## 1. CRITICAL: firestore.rules 강화

**파일:** `firestore.rules`

**변경 내용:**
학습자 데이터 하위 컬렉션 7개(`participants`, `attendance`, `introCards`, `posts`, `lunchVotes`, `reviews`, `surveyResponses`)의 규칙을 변경했다.

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| read | `if true` | `if true` (유지) |
| create | `if true` (write 일괄) | `if true` |
| update | `if true` (write 일괄) | `if true` |
| delete | `if true` (write 일괄) | `if isAuthenticated()` |

`announcements`, `teams`, `sessionCodes`는 이미 `allow write: if isAuthenticated()`로 설정되어 있어 추가 수정 불필요.

---

## 2. CRITICAL: storage.rules 파일 크기 제한 축소

**파일:** `storage.rules`

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 최대 업로드 크기 | 5MB (`5 * 1024 * 1024`) | 2MB (`2 * 1024 * 1024`) |
| content-type 검증 | `image/.*` 유지 | 변경 없음 |

---

## 3. HIGH: useKakaoMap.ts XSS 방지

**파일:** `src/hooks/useKakaoMap.ts`

- `escapeHtml()` 유틸리티 함수 추가 (`&`, `<`, `>`, `"`, `'` 이스케이프)
- `addMarkerWithInfoWindow` 내 InfoWindow content에 `escapeHtml(content)` 적용
- 사용자 입력이 HTML로 직접 삽입되는 XSS 벡터 차단

---

## 4. MEDIUM: auth.ts 쿠키 보안 강화

**파일:** `src/lib/firebase/auth.ts`

| 속성 | 변경 전 | 변경 후 |
|------|---------|---------|
| Path | `path=/` | `Path=/` |
| SameSite | `Lax` | `Strict` |
| Secure | 미설정 | `Secure` 추가 |

`setAuthCookie()`와 `clearAuthCookie()` 모두 동일하게 적용.

---

## 수정 파일 목록

1. `firestore.rules`
2. `storage.rules`
3. `src/hooks/useKakaoMap.ts`
4. `src/lib/firebase/auth.ts`
