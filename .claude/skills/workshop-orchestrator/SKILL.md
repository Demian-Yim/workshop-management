---
name: workshop-orchestrator
description: "워크샵 관리 앱의 문제 진단 → 수정 → 검증 → 배포 전체 파이프라인을 조율하는 오케스트레이터. security-fixer, feature-fixer, qa-verifier 에이전트를 팀으로 구성하여 병렬 수정 후 통합 검증을 수행한다. '워크샵 앱 수정', '문제점 수정', 'fix workshop app' 요청 시 이 스킬을 사용하라."
---

# Workshop Orchestrator — 수정 및 배포 파이프라인

워크샵 관리 앱의 에이전트 팀을 조율하여 문제 진단 → 수정 → 검증 → 배포를 수행하는 통합 스킬.

## 실행 모드: 에이전트 팀

## 에이전트 구성

| 팀원 | 에이전트 타입 | 역할 | 출력 |
|------|-------------|------|------|
| security-fixer | 커스텀 | 보안 취약점 수정 | `_workspace/security-fix-report.md` |
| feature-fixer | 커스텀 | 미완성 기능/버그 수정 | `_workspace/feature-fix-report.md` |
| qa-verifier | 커스텀 | 빌드/품질 검증 | `_workspace/qa-report.md` |

## 워크플로우

### Phase 1: 준비
1. 프로젝트 디렉토리에 `_workspace/` 생성
2. 진단 보고서를 `_workspace/00_diagnosis.md`에 저장
3. 수정 대상 목록 정리 (보안 / 기능 분류)

### Phase 2: 팀 구성

```
TeamCreate(
  team_name: "workshop-fix-team",
  members: [
    { name: "security-fixer", agent_type: "security-fixer", model: "opus",
      prompt: "보안 취약점을 수정하라. 진단 보고서: _workspace/00_diagnosis.md 참조. 수정 대상: (1) firestore.rules 강화, (2) storage.rules 강화, (3) useKakaoMap.ts XSS 수정, (4) auth.ts 쿠키 보안. 수정 완료 후 _workspace/security-fix-report.md에 보고서 작성." },
    { name: "feature-fixer", agent_type: "feature-fixer", model: "opus",
      prompt: "미완성 기능과 버그를 수정하라. 진단 보고서: _workspace/00_diagnosis.md 참조. 수정 대상: (1) Export API 구현, (2) cascade delete 구현, (3) 레거시 session API 정리, (4) 에러 핸들링 추가, (5) onMarkerClick 연결. 수정 완료 후 _workspace/feature-fix-report.md에 보고서 작성." },
    { name: "qa-verifier", agent_type: "qa-verifier", model: "opus",
      prompt: "security-fixer와 feature-fixer의 수정이 완료될 때까지 대기한 후, QA 체크리스트를 수행하라. npm run build, npm run lint 실행. 경계면 교차 비교 수행. 결과를 _workspace/qa-report.md에 작성." }
  ]
)
```

작업 등록:
```
TaskCreate(tasks: [
  { title: "Firestore 규칙 강화", assignee: "security-fixer", description: "firestore.rules에서 if true를 세션 기반 접근 제어로 변경" },
  { title: "Storage 규칙 강화", assignee: "security-fixer", description: "storage.rules 인증 제한 추가" },
  { title: "XSS 수정", assignee: "security-fixer", description: "useKakaoMap.ts InfoWindow HTML 이스케이프" },
  { title: "쿠키 보안 강화", assignee: "security-fixer", description: "auth.ts 쿠키 보안 속성" },
  { title: "Export API 구현", assignee: "feature-fixer", description: "CSV export 실제 데이터 조회 구현" },
  { title: "Cascade delete 구현", assignee: "feature-fixer", description: "Course 삭제 시 하위 컬렉션 삭제" },
  { title: "레거시 API 정리", assignee: "feature-fixer", description: "4자리 세션 코드 API 제거 또는 통합" },
  { title: "에러 핸들링 보완", assignee: "feature-fixer", description: "kakao/menu, useCheckInFlow, togglePoll에 에러 처리 추가" },
  { title: "빌드 검증", assignee: "qa-verifier", depends_on: ["Firestore 규칙 강화", "Export API 구현"], description: "npm run build + lint + 타입 체크" },
  { title: "경계면 검증", assignee: "qa-verifier", depends_on: ["빌드 검증"], description: "Firestore 규칙 ↔ 클라이언트 코드, API ↔ 타입 교차 비교" }
])
```

### Phase 3: 병렬 수정

security-fixer와 feature-fixer가 병렬로 수정 작업 수행.

**팀원 간 통신 규칙:**
- security-fixer → feature-fixer: Firestore 규칙 변경으로 클라이언트 코드 조정 필요 시 알림
- 양쪽 fixer → qa-verifier: 수정 완료 시 알림
- qa-verifier → fixer: 빌드 에러 발견 시 수정 요청

### Phase 4: QA 검증

qa-verifier가 전체 체크리스트 수행:
1. `npm run build` 성공 확인
2. `npm run lint` 통과 확인
3. 경계면 교차 비교
4. PASS/FAIL 판정 → FAIL 시 해당 fixer에게 재수정 요청

### Phase 5: 배포 준비 & 정리

1. QA PASS 확인
2. 팀원들에게 종료 요청
3. 팀 정리
4. `_workspace/` 보존
5. 사용자에게 결과 요약:
   - 수정된 항목 목록
   - QA 결과
   - 배포 준비 상태 (READY / NOT READY)
6. 사용자 승인 후 배포 진행 (workshop-deploy 스킬 참조)

## 데이터 흐름

```
[리더: 진단] → _workspace/00_diagnosis.md
    ↓
[security-fixer] ←SendMessage→ [feature-fixer]
    │                               │
    ↓                               ↓
security-fix-report.md    feature-fix-report.md
    │                               │
    └──────── [qa-verifier] ────────┘
                   ↓
            qa-report.md
                   ↓
         [리더: 결과 종합 + 배포]
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| fixer 1명 실패 | 리더가 감지 → 상태 확인 → 재시작 또는 리더가 직접 수정 |
| 빌드 실패 | qa-verifier가 에러 분석 → 해당 fixer에게 재수정 요청 (최대 2회) |
| 2회 재수정 후에도 빌드 실패 | 리더가 직접 개입하여 수정 |
| fixer 간 충돌 (같은 파일 동시 수정) | 리더가 병합 조율 |

## 테스트 시나리오

### 정상 흐름
1. 진단 보고서에서 12개 문제 식별
2. security-fixer: 4개 보안 이슈 수정
3. feature-fixer: 7개 기능 이슈 수정
4. qa-verifier: 빌드 성공, 경계면 일치 → PASS
5. 배포 준비 완료

### 에러 흐름
1. feature-fixer의 Export API 구현에서 타입 에러 발생
2. qa-verifier가 빌드 실패 감지 → feature-fixer에게 에러 메시지 전달
3. feature-fixer가 타입 수정 후 재완료 보고
4. qa-verifier 재검증 → PASS
