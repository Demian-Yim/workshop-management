---
name: workshop-deploy
description: "워크샵 관리 앱을 Firebase Hosting 또는 Vercel에 배포하는 스킬. 배포 전 빌드 검증, 환경 변수 확인, 배포 실행, 배포 후 확인까지 전체 프로세스를 안내한다. '배포', 'deploy', '호스팅', 'hosting' 요청 시 이 스킬을 사용하라."
---

# Workshop Deploy — 배포 워크플로우

## 배포 전 체크리스트

1. **빌드 성공 확인**: `npm run build` 성공 필수
2. **환경 변수 확인**: `.env.local`에 Firebase 설정값 존재 확인
3. **Firestore 규칙 확인**: `firestore.rules` 문법 유효
4. **Storage 규칙 확인**: `storage.rules` 문법 유효

## 배포 옵션

### Option A: Vercel (권장 — Next.js 네이티브)

```bash
# Vercel CLI 설치 (최초 1회)
npm i -g vercel

# 배포 (대화형)
vercel

# 프로덕션 배포
vercel --prod
```

Vercel 배포 시 환경 변수는 Vercel 대시보드에서 설정:
- Settings → Environment Variables → `.env.local`의 모든 `NEXT_PUBLIC_*` 변수 추가

### Option B: Firebase Hosting

`firebase.json`에 hosting 설정 추가 필요:

```json
{
  "hosting": {
    "source": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "frameworksBackend": {
      "region": "asia-northeast3"
    }
  },
  "firestore": { "rules": "firestore.rules" },
  "storage": { "rules": "storage.rules" }
}
```

```bash
# Firebase CLI 설치 (최초 1회)
npm i -g firebase-tools

# 로그인
firebase login

# Firebase 규칙만 배포
firebase deploy --only firestore:rules,storage

# 전체 배포 (hosting + rules)
firebase deploy
```

## 배포 후 확인

1. 배포된 URL 접속하여 3가지 역할 플로우 테스트:
   - 어드민: /login → /dashboard
   - 퍼실리테이터: /login → /create → /present
   - 학습자: / → /join → /session
2. Firestore 규칙이 정상 적용되었는지 확인
3. 이미지 업로드 (셀피) 기능 동작 확인

## Firestore/Storage 규칙만 배포

코드 변경 없이 규칙만 업데이트할 때:
```bash
firebase deploy --only firestore:rules,storage
```
