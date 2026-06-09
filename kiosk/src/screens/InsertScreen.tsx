import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";
import { PhoneGlyph } from "../components/PhoneGlyph";

export function InsertScreen({ onInserted }: { onInserted: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-paper px-14 pb-14 pt-32 text-ink">
      <h2 className="text-[44px] font-extrabold leading-tight tracking-tight">
        트레이에 폰을
        <br />
        올려주세요
      </h2>
      <p className="mt-3 text-[20px] text-muted">
        케이스·그립톡 그대로 · 눕혀서 올려두면 됩니다
      </p>

      {/* 트레이 + 폰 모형 일러스트 */}
      <div className="relative mt-6 flex flex-1 items-center justify-center">
        <div className="relative flex h-[400px] w-[440px] items-end justify-center overflow-hidden rounded-[32px] bg-surface">
          {/* 트레이 플랫폼 */}
          <div className="absolute bottom-16 h-[20px] w-[320px] rounded-full bg-surface2" />
          <div className="absolute bottom-[60px] h-[6px] w-[320px] rounded-full bg-ink/5" />
          {/* 폰 그림자 */}
          <div className="absolute bottom-[70px] h-[14px] w-[150px] rounded-[50%] bg-ink/10 blur-md" />
          {/* 폰 모형 (살짝 떠서 안착되는 느낌) */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: [0, -10, 0], opacity: 1 }}
            transition={{
              y: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.5 },
            }}
            className="z-10 mb-[74px] text-ink/55"
          >
            <PhoneGlyph mode="plain" className="h-[210px]" />
          </motion.div>
          {/* 안착 화살표 */}
          <motion.div
            className="absolute left-1/2 top-10 -translate-x-1/2 text-ink/25"
            animate={{ y: [0, 8, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* 안내 */}
      <div className="mb-6 flex items-center gap-2.5 text-[16px] text-muted">
        <Info size={18} />
        시뮬레이터: 실제로는 무게·AI 비전으로 자동 감지됩니다
      </div>

      <button
        onClick={onInserted}
        className="w-full rounded-2xl bg-ink py-6 text-[28px] font-bold text-white active:scale-[0.99]"
      >
        <span className="inline-flex items-center gap-3">
          <Check size={26} strokeWidth={3} /> 폰을 올렸어요
        </span>
      </button>
    </div>
  );
}
