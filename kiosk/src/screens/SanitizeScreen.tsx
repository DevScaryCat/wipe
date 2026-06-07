import { motion } from "framer-motion";
import { Wind, SprayCan, Zap, Sun, Check } from "lucide-react";
import { StageVisual } from "../components/StageVisual";
import type { StageDef, WashStage } from "../kiosk";

const GERM_BASELINE = 2847; // 평균 통계 기반 연출 수치 (측정값 아님)

const STAGE_ICON: Record<WashStage, typeof Wind> = {
  air: Wind,
  mist: SprayCan,
  uv: Zap,
  dry: Sun,
};

/** 표면 오염 잔량(연출) — 에어/살균수에서 서서히, UV에서 0으로, 건조엔 0 */
function soilCount(stageKey: WashStage, stageProgress: number): number {
  let clean = 0;
  if (stageKey === "air") clean = stageProgress * 0.15;
  else if (stageKey === "mist") clean = 0.15 + stageProgress * 0.2;
  else if (stageKey === "uv") clean = 0.35 + stageProgress * 0.65;
  else clean = 1;
  return Math.max(0, Math.round(GERM_BASELINE * (1 - clean)));
}

export function SanitizeScreen({
  stages,
  index,
  stageProgress,
  overall,
  remainingSec,
}: {
  stages: StageDef[];
  index: number;
  stageProgress: number;
  overall: number;
  remainingSec: number;
}) {
  const cur = stages[index];
  const count = soilCount(cur.key, stageProgress);
  const pct = Math.round(overall * 100);

  return (
    <div className="absolute inset-0 flex flex-col items-center overflow-hidden bg-gradient-to-b from-night to-night2 px-14 pb-14 pt-28 text-white">
      {/* UV 글로우 (uv 단계에서만 강하게) */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[440px] h-[340px] w-[340px] -translate-x-1/2 rounded-full"
        style={{ background: "var(--color-uv)", filter: "blur(130px)" }}
        animate={{ opacity: cur.key === "uv" ? [0.3, 0.55, 0.3] : 0.12 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 서브 스텝퍼 (4단계) */}
      <div className="z-10 flex w-full items-center justify-between gap-2">
        {stages.map((s, i) => {
          const Icon = STAGE_ICON[s.key];
          const done = i < index;
          const active = i === index;
          return (
            <div key={s.key} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={[
                  "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                  active
                    ? "bg-uv text-white"
                    : done
                      ? "bg-white/12 text-mint"
                      : "bg-white/8 text-white/35",
                ].join(" ")}
              >
                {done ? <Check size={22} strokeWidth={3} /> : <Icon size={22} />}
              </div>
              <span
                className={[
                  "text-[14px] font-semibold",
                  active ? "text-white" : done ? "text-white/60" : "text-white/35",
                ].join(" ")}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 현재 단계 제목 */}
      <div className="z-10 mt-8 text-center">
        <motion.h2
          key={cur.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[34px] font-extrabold tracking-tight"
        >
          {cur.title}
        </motion.h2>
        <p className="mt-2 text-[18px] text-white/55">{cur.sub}</p>
      </div>

      {/* 오염 카운터 (UV·세척 단계에서만 의미 있음) */}
      {cur.key !== "dry" && (
        <div className="z-10 mt-5 flex items-baseline gap-2">
          <motion.span
            key={count}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            className="tnum text-[40px] font-extrabold text-white/90"
          >
            {count.toLocaleString()}
          </motion.span>
          <span className="text-[16px] text-white/45">표면 오염 · 평균치 기반 연출</span>
        </div>
      )}

      {/* 단계별 비주얼 */}
      <div className="z-10 mt-4">
        <StageVisual stage={cur.key} stageProgress={stageProgress} className="h-[360px]" />
      </div>

      {/* 전체 진행 바 + 남은 시간 */}
      <div className="z-10 mt-auto w-full">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="tnum text-[20px] font-bold">{pct}%</span>
          <span className="tnum text-[18px] text-white/55">
            남은 시간 00:{String(remainingSec).padStart(2, "0")}
          </span>
        </div>
        <div className="flex gap-1.5">
          {stages.map((s, i) => (
            <div key={s.key} className="h-2 flex-1 overflow-hidden rounded-full bg-white/12">
              <div
                className="h-full rounded-full bg-uv transition-all duration-200"
                style={{ width: i < index ? "100%" : i === index ? `${stageProgress * 100}%` : "0%" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
