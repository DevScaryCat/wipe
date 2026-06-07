import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Info, Share2 } from "lucide-react";
import { PhoneGlyph } from "../components/PhoneGlyph";
import { HOTSPOTS } from "../kiosk";

/** 7×7 미니 QR 느낌의 마크 (장식용) */
function MiniQR() {
  const cells = Array.from({ length: 49 }, (_, i) => (i * 7 + (i % 5)) % 3 === 0);
  const finder = (r: number, c: number) =>
    (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
  return (
    <div className="grid grid-cols-7 gap-[3px] rounded-xl bg-white p-2.5 ring-1 ring-line">
      {cells.map((on, i) => {
        const r = Math.floor(i / 7);
        const c = i % 7;
        const dark = finder(r, c) || on;
        return (
          <span
            key={i}
            className="h-[9px] w-[9px] rounded-[2px]"
            style={{ background: dark ? "var(--color-ink)" : "transparent" }}
          />
        );
      })}
    </div>
  );
}

export function CompleteScreen({ onDone }: { onDone: () => void }) {
  const [view, setView] = useState<"before" | "after">("before");
  const before = view === "before";

  return (
    <div className="absolute inset-0 flex flex-col bg-paper px-14 pb-12 pt-32 text-ink">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-white"
        >
          <Check size={30} strokeWidth={3} />
        </motion.div>
        <div>
          <h2 className="text-[36px] font-extrabold tracking-tight">살균 완료</h2>
          <p className="text-[18px] text-muted">UV-C 30초 케어 · 폰을 회수해 주세요</p>
        </div>
      </div>

      {/* 비포/애프터 토글 */}
      <div className="mt-7 grid grid-cols-2 gap-1.5 rounded-2xl bg-surface p-1.5">
        {(
          [
            { key: "before", label: "비포 — 표면 오염" },
            { key: "after", label: "애프터 — 케어 후" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            data-view={t.key}
            onClick={() => setView(t.key)}
            className={[
              "rounded-xl py-3.5 text-[19px] font-bold transition-colors",
              view === t.key
                ? t.key === "before"
                  ? "bg-coral text-white"
                  : "bg-mint text-white"
                : "text-muted",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 폰 + 부위 리스트 */}
      <div className="mt-6 flex items-center gap-7">
        <div className="h-[280px] w-[145px] shrink-0 text-ink/70">
          <PhoneGlyph mode={before ? "dirty" : "clean"} className="h-full" />
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          {HOTSPOTS.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{
                  background: before
                    ? h.level === "high"
                      ? "var(--color-coral)"
                      : "#d9a01e"
                    : "var(--color-mint)",
                }}
              />
              <span className="flex-1 text-[16px] font-medium text-ink2">
                {h.label}
              </span>
              <span
                className="text-[14px] font-bold"
                style={{ color: before ? "var(--color-coral)" : "var(--color-mint)" }}
              >
                {before ? (h.level === "high" ? "오염↑" : "오염") : "케어됨"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[14px] text-muted">
        <Info size={15} />
        UV-A 형광으로 촬영한 표면 오염·유분 시각화 (세균 측정값 아님)
      </div>

      {/* SNS 공유 */}
      <div className="mt-5 flex items-center gap-5 rounded-2xl border border-line bg-paper p-5">
        <MiniQR />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[20px] font-bold">
            <Share2 size={20} className="text-uv" /> #WIPE 인증샷 공유
          </div>
          <p className="mt-1 text-[16px] leading-snug text-muted">
            QR 스캔 후 스토리에 올리면 다음 이용 할인!
          </p>
        </div>
      </div>

      <button
        onClick={onDone}
        className="mt-auto w-full rounded-2xl border border-line bg-surface py-5 text-[22px] font-bold text-ink2 active:scale-[0.99]"
      >
        처음으로
      </button>
    </div>
  );
}
