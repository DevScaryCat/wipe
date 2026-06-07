import { motion } from "framer-motion";
import { Scale, ScanEye } from "lucide-react";
import { PhoneGlyph } from "../components/PhoneGlyph";

/** 이물질 검사 (무게 + AI 비전). App이 타이머로 자동 통과. */
export function ScanScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center bg-paper px-14 pb-14 pt-32 text-ink">
      <h2 className="text-[40px] font-extrabold tracking-tight">스마트폰 확인 중</h2>
      <p className="mt-3 text-center text-[20px] text-muted">
        무게와 AI 비전으로 안전하게 확인하고 있어요
      </p>

      <div
        className="relative mt-16 h-[400px] text-ink/70"
        style={{ aspectRatio: "1 / 2" }}
      >
        <PhoneGlyph mode="plain" className="absolute inset-0 h-full w-full" />
        {/* 스캔선 — 폰 바디에 클립, 전체 높이 트랙이 위→아래로 훑음 */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: "6%",
            top: "2%",
            width: "88%",
            height: "96%",
            borderRadius: "16% / 8%",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ animation: "scan-sweep 2.2s ease-in-out infinite" }}
          >
            <div
              className="absolute inset-x-0 top-0 h-[70px]"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(91,75,221,0.4), transparent)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-14 flex w-full max-w-[420px] flex-col gap-3">
        {[
          { icon: Scale, label: "무게 확인", sub: "150–350g 범위" },
          { icon: ScanEye, label: "AI 비전 검사", sub: "스마트폰 형태 인식" },
        ].map((r, i) => {
          const Icon = r.icon;
          return (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.25 }}
              className="flex items-center gap-4 rounded-2xl bg-surface px-6 py-4"
            >
              <Icon size={26} className="text-uv" />
              <div className="flex-1">
                <div className="text-[19px] font-bold">{r.label}</div>
                <div className="text-[15px] text-muted">{r.sub}</div>
              </div>
              <motion.span
                className="h-3 w-3 rounded-full bg-mint"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
