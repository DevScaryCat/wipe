import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DEMO_TIMINGS,
  REAL_TIMINGS,
  WASH_STAGES_DEMO,
  WASH_STAGES_REAL,
  totalWash,
  type Step,
  type Timings,
} from "./kiosk";
import { KioskFrame } from "./components/KioskFrame";
import { AttractScreen } from "./screens/AttractScreen";
import { PaymentScreen } from "./screens/PaymentScreen";
import { InsertScreen } from "./screens/InsertScreen";
import { ScanScreen } from "./screens/ScanScreen";
import { LiftScreen } from "./screens/LiftScreen";
import { SanitizeScreen } from "./screens/SanitizeScreen";
import { CompleteScreen } from "./screens/CompleteScreen";

const ALL_STEPS: Step[] = [
  "attract",
  "payment",
  "insert",
  "scan",
  "lift",
  "sanitize",
  "complete",
];

interface WashState {
  index: number;
  stageProgress: number;
  overall: number;
  remainingSec: number;
}

export function App() {
  const [step, setStep] = useState<Step>("attract");
  const [realSpeed, setRealSpeed] = useState(false);
  const timings: Timings = realSpeed ? REAL_TIMINGS : DEMO_TIMINGS;
  const stages = realSpeed ? WASH_STAGES_REAL : WASH_STAGES_DEMO;
  const [wash, setWash] = useState<WashState>({
    index: 0,
    stageProgress: 0,
    overall: 0,
    remainingSec: 0,
  });
  const rafRef = useRef<number>(0);

  const go = useCallback((s: Step) => setStep(s), []);

  // 자동 전환 (검사 / 상승 / 완료)
  useEffect(() => {
    if (step === "scan") {
      const t = setTimeout(() => go("lift"), timings.scan);
      return () => clearTimeout(t);
    }
    if (step === "lift") {
      const t = setTimeout(() => go("sanitize"), timings.lift);
      return () => clearTimeout(t);
    }
    if (step === "complete") {
      const t = setTimeout(() => go("attract"), timings.complete);
      return () => clearTimeout(t);
    }
  }, [step, timings, go]);

  // 살균 다단계 시퀀스 (에어 → 살균수 → UV-C → 건조)
  useEffect(() => {
    if (step !== "sanitize") return;
    const list = stages;
    const total = totalWash(list);
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      let acc = 0;
      let index = 0;
      let stageProgress = 1;
      for (let i = 0; i < list.length; i++) {
        if (elapsed < acc + list[i].duration) {
          index = i;
          stageProgress = (elapsed - acc) / list[i].duration;
          break;
        }
        acc += list[i].duration;
        index = i;
        stageProgress = 1;
      }
      setWash({
        index,
        stageProgress: Math.min(Math.max(stageProgress, 0), 1),
        overall: Math.min(elapsed / total, 1),
        remainingSec: Math.ceil((total - Math.min(elapsed, total)) / 1000),
      });
      if (elapsed < total) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        go("complete");
      }
    };

    setWash({
      index: 0,
      stageProgress: 0,
      overall: 0,
      remainingSec: Math.ceil(total / 1000),
    });
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [step, stages, go]);

  return (
    <>
      <KioskFrame step={step}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {step === "attract" && <AttractScreen onStart={() => go("payment")} />}
            {step === "payment" && <PaymentScreen onPaid={() => go("insert")} />}
            {step === "insert" && <InsertScreen onInserted={() => go("scan")} />}
            {step === "scan" && <ScanScreen />}
            {step === "lift" && <LiftScreen />}
            {step === "sanitize" && (
              <SanitizeScreen
                stages={stages}
                index={wash.index}
                stageProgress={wash.stageProgress}
                overall={wash.overall}
                remainingSec={wash.remainingSec}
              />
            )}
            {step === "complete" && <CompleteScreen onDone={() => go("attract")} />}
          </motion.div>
        </AnimatePresence>
      </KioskFrame>

      <DevPanel
        step={step}
        realSpeed={realSpeed}
        onJump={go}
        onToggleSpeed={() => setRealSpeed((v) => !v)}
      />
    </>
  );
}

/** 개발용 점프 패널 (프레임 밖, 스케일 영향 없음). 배포 시 제거 */
function DevPanel({
  step,
  realSpeed,
  onJump,
  onToggleSpeed,
}: {
  step: Step;
  realSpeed: boolean;
  onJump: (s: Step) => void;
  onToggleSpeed: () => void;
}) {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-3 right-3 z-50 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white/60"
      >
        DEV
      </button>
    );
  }
  return (
    <div className="fixed bottom-3 right-3 z-50 w-44 rounded-xl bg-black/80 p-3 text-white ring-1 ring-white/15 backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wide text-mint">DEV PANEL</span>
        <button onClick={() => setOpen(false)} className="text-xs text-white/40">
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {ALL_STEPS.map((s) => (
          <button
            key={s}
            data-step={s}
            onClick={() => onJump(s)}
            className={[
              "rounded px-1.5 py-1 text-[11px] font-medium transition-colors",
              step === s
                ? "bg-uv text-white"
                : "bg-white/8 text-white/60 hover:bg-white/15",
            ].join(" ")}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        onClick={onToggleSpeed}
        data-testid="speed-toggle"
        className="mt-2 w-full rounded bg-white/8 px-2 py-1.5 text-[11px] text-white/70 hover:bg-white/15"
      >
        속도: {realSpeed ? "실제" : "데모(빠름)"}
      </button>
    </div>
  );
}
