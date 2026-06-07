import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";

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

      {/* 트레이 일러스트 */}
      <div className="relative mt-6 flex flex-1 items-center justify-center">
        <div className="relative flex h-[360px] w-[440px] items-end justify-center rounded-[32px] bg-surface pb-12">
          {/* 슬롯 */}
          <div className="absolute bottom-7 h-[10px] w-[300px] rounded-full bg-line" />
          {/* 트레이 + 폰 자리 */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: [0, -8, 0], opacity: 1 }}
            transition={{
              y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.5 },
            }}
            className="z-10 flex h-[180px] w-[300px] items-center justify-center rounded-2xl border-2 border-dashed border-uv/50 bg-uv-soft"
          >
            <span className="text-[20px] font-semibold text-uv">
              여기에 폰을 올려주세요
            </span>
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
