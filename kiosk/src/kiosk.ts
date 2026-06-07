// WIPE 키오스크 상태머신 정의
//
// 실제 하드웨어가 없어도 전체 플로우를 돌릴 수 있도록 만든 "시뮬레이터" 모델.
// 각 단계는 화면(Screen) 하나에 대응한다. 나중에 미들웨어(Python)를 붙일 때
// 이 단계 전환 지점들이 그대로 localhost 이벤트(예: tray.opened, lift.done)와 매핑된다.

export type Step =
  | "attract" // 대기 — 손님을 끌어들이는 화면
  | "payment" // 결제 — 500원 카드/QR
  | "insert" // 투입 — 트레이 인출 + 폰 안착
  | "scan" // 검사 — 무게/AI 비전 이물질 필터링
  | "lift" // 상승 — 리프트로 챔버까지
  | "sanitize" // 살균 ★ — UV-C + 세균 시각화
  | "complete"; // 완료 — 비포/애프터 + SNS 공유

// 활성 세션의 상단 진행 스텝퍼에 표시할 4단계 (민팃 레퍼런스 패턴)
export const PROGRESS_STEPS: { key: Step; label: string }[] = [
  { key: "payment", label: "결제" },
  { key: "insert", label: "투입" },
  { key: "sanitize", label: "살균" },
  { key: "complete", label: "완료" },
];

// 진행 스텝퍼에서 현재 단계가 몇 번째인지 (검사/상승은 '투입'에 묶고, 살균은 '살균')
export function progressIndex(step: Step): number {
  switch (step) {
    case "payment":
      return 0;
    case "insert":
    case "scan":
    case "lift":
      return 1;
    case "sanitize":
      return 2;
    case "complete":
      return 3;
    default:
      return -1; // attract → 스텝퍼 숨김
  }
}

// 살균 다크 모먼트 (배경이 어두운 단계) — 스텝퍼/베젤 톤 결정에 사용
export function isDarkStep(step: Step): boolean {
  return step === "lift" || step === "sanitize";
}

// 데모/실제 타이밍 (ms). (살균은 아래 WASH_STAGES로 다단계 분리)
export interface Timings {
  scan: number; // 이물질 검사
  lift: number; // 리프트 상승
  complete: number; // 완료 화면 자동 복귀
}

export const DEMO_TIMINGS: Timings = {
  scan: 6000, // 디자인 확인 가능하도록 충분히
  lift: 7000, // 트레이 상승 (애니 6s + 안착)
  complete: 25000,
};

export const REAL_TIMINGS: Timings = {
  scan: 6000,
  lift: 7000, // 실제 기계 수직 리프트 속도 반영 (천천히 묵직하게)
  complete: 25000, // 비포/애프터 확인 + QR 공유에 충분한 시간
};

// 살균 다단계 시퀀스 (세척+살균 풀버전, 시나리오 B)
//   에어(먼지 털기) → 살균수(과산화수소수 분사) → UV-C 살균 → 에어 건조
export type WashStage = "air" | "mist" | "uv" | "dry";

export interface StageDef {
  key: WashStage;
  label: string; // 서브 스텝퍼 라벨
  title: string; // 큰 제목
  sub: string; // 보조 설명
  duration: number; // ms
}

export const WASH_STAGES_DEMO: StageDef[] = [
  { key: "air", label: "에어", title: "에어 클리닝", sub: "강한 바람으로 먼지·이물을 털어냅니다", duration: 3500 },
  { key: "mist", label: "살균수", title: "살균수 분사", sub: "3% 과산화수소수를 미세 분사해 표면을 세척합니다", duration: 4500 },
  { key: "uv", label: "UV-C", title: "UV-C 살균", sub: "자외선으로 세균을 살균합니다", duration: 7000 },
  { key: "dry", label: "건조", title: "에어 건조", sub: "바람으로 수분을 날려 보송하게 마무리합니다", duration: 3500 },
];

export const WASH_STAGES_REAL: StageDef[] = [
  { key: "air", label: "에어", title: "에어 클리닝", sub: "강한 바람으로 먼지·이물을 털어냅니다", duration: 6000 },
  { key: "mist", label: "살균수", title: "살균수 분사", sub: "3% 과산화수소수를 미세 분사해 표면을 세척합니다", duration: 12000 },
  { key: "uv", label: "UV-C", title: "UV-C 살균", sub: "자외선으로 세균을 살균합니다", duration: 30000 },
  { key: "dry", label: "건조", title: "에어 건조", sub: "바람으로 수분을 날려 보송하게 마무리합니다", duration: 10000 },
];

export const totalWash = (stages: StageDef[]) =>
  stages.reduce((a, s) => a + s.duration, 0);

export const PRICE = 500; // 파일럿 가격 (원)

// 비포/애프터에서 보여줄 "오염 핫스팟" — UV 형광으로 실제 그 폰에서 잡아낼 영역들.
// (정직선: '세균 N마리'가 아니라 '표면 오염/유분'으로 라벨)
export interface Hotspot {
  id: string;
  label: string;
  x: number; // % (폰 일러스트 기준)
  y: number; // %
  level: "high" | "mid";
}

export const HOTSPOTS: Hotspot[] = [
  { id: "earpiece", label: "통화 시 닿는 윗부분", x: 50, y: 12, level: "high" },
  { id: "camera", label: "후면 카메라 주변", x: 70, y: 20, level: "mid" },
  { id: "screen", label: "화면 중앙(터치 부위)", x: 50, y: 48, level: "high" },
  { id: "bottom", label: "하단 가장자리", x: 50, y: 88, level: "mid" },
];
