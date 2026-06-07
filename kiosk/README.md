# WIPE 키오스크 UI (시뮬레이터)

세로형 키오스크 디스플레이용 살균 플로우 UI. **하드웨어 없이** 전체 흐름을 클릭하며 체험할 수 있는 시뮬레이터.

## 실행

```bash
cd kiosk
npm install
npm run dev      # http://localhost:5173
```

## 스택

- Vite + React + TypeScript + Tailwind v4 + Framer Motion
- 설계 해상도: 720×1280 (세로형). 뷰포트에 맞춰 비율 유지 스케일.
- **패키징(예정): Tauri v2** — 같은 React 빌드를 그대로 감싼다. (성능 이슈 시 Chromium 키오스크로 폴백)

## 화면 플로우 (상태머신)

`attract → payment → insert → scan → lift → sanitize → complete → attract`

| 단계 | 화면 | 비고 |
|---|---|---|
| attract | 대기 | 터치 시작, 가격 500원 |
| payment | 결제 | 카드/QR (목업) |
| insert | 투입 | 슬라이드 트레이에 폰 안착 |
| scan | 검사 | 무게+AI 비전 (자동) |
| lift | 상승 | 챔버로 이동 (자동) |
| sanitize | **살균 ★** | UV-C + 세균 시각화 + 30초 타이머 |
| complete | 완료 | **비포/애프터 부위별 오염 + SNS 공유 QR** |

## 설계 원칙

- **UI ↔ 하드웨어 분리:** 화면은 "신호"만 보내고 실제 구동은 미들웨어/펌웨어가 담당.
  지금은 타이머/버튼으로 목업, 나중에 localhost(WebSocket) 이벤트로 교체.
  → `src/kiosk.ts`의 단계 전환 지점이 곧 하드웨어 이벤트 매핑 지점.
- **정직선(부당광고 회피):** 세균 수치는 "평균치 기반 연출", 비포/애프터는
  "UV-A 형광 표면 오염/유분 시각화 (세균 측정값 아님)"로 명시. (docs/01_business/risks_and_open_questions.md)

## 개발용

- 우하단 **DEV PANEL**: 단계 점프 + 속도(데모/실제 30초) 토글. 배포 시 `App.tsx`의 `<DevPanel>` 제거.

## 파일 구조

```
src/
├── kiosk.ts              # 상태머신 타입·설정·핫스팟 정의 (단일 기준)
├── App.tsx               # 상태머신 + 타이머 + 화면 전환 + DevPanel
├── components/
│   ├── KioskFrame.tsx    # 세로형 프레임 + 진행 스텝퍼
│   ├── PhoneGlyph.tsx    # 폰 일러스트 (plain/dirty/clean)
│   └── GermField.tsx     # 세균 파티클 (progress 연동)
└── screens/              # 화면 7개
```
