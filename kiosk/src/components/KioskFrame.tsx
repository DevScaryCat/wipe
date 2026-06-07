import { useEffect, useState, type ReactNode } from "react";
import { PROGRESS_STEPS, progressIndex, isDarkStep, type Step } from "../kiosk";

const W = 720;
const H = 1280;

function useScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () =>
      setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return scale;
}

/** 미니멀 진행 스텝퍼 — 얇은 라인 + 작은 라벨. 톤 적응. */
function Stepper({ step }: { step: Step }) {
  const idx = progressIndex(step);
  if (idx < 0) return null;
  const dark = isDarkStep(step);
  const base = dark ? "text-white/40" : "text-muted";
  const activeText = dark ? "text-white" : "text-ink";

  return (
    <div className="absolute left-0 right-0 top-0 z-20 px-14 pt-12">
      <div className="flex items-center gap-2.5">
        {PROGRESS_STEPS.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <div key={s.key} className="flex flex-1 flex-col gap-2">
              <div className="h-[3px] w-full overflow-hidden rounded-full">
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background:
                      done || active
                        ? "var(--color-uv)"
                        : dark
                          ? "rgba(255,255,255,0.16)"
                          : "var(--color-line)",
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[14px] font-semibold ${
                    active ? activeText : base
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`text-[14px] font-medium ${
                    active ? activeText : base
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function KioskFrame({
  step,
  children,
}: {
  step: Step;
  children: ReactNode;
}) {
  const scale = useScale();
  return (
    <div className="flex h-full w-full items-center justify-center">
      {/* 무광 화이트 베젤 */}
      <div
        style={{ padding: 14 * scale, borderRadius: 56 * scale }}
        className="bg-gradient-to-b from-white to-[#e9ebef] shadow-[0_30px_80px_-20px_rgba(20,22,30,0.45)] ring-1 ring-black/5"
      >
        <div
          style={{ width: W * scale, height: H * scale, borderRadius: 40 * scale }}
          className="relative overflow-hidden bg-paper ring-1 ring-black/10"
        >
          <div
            style={{ width: W, height: H, transform: `scale(${scale})` }}
            className="absolute left-0 top-0 origin-top-left"
          >
            <Stepper step={step} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
