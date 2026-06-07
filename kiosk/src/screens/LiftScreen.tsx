import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { PhoneGlyph } from "../components/PhoneGlyph";

/** 리프트 상승 — 살균 챔버로 이동 (다크 모먼트 시작). App이 타이머로 통과. */
export function LiftScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center overflow-hidden bg-gradient-to-b from-night to-night2 px-14 pb-14 pt-32 text-white">
      <h2 className="text-[36px] font-extrabold tracking-tight">
        살균 챔버로 이동 중
      </h2>
      <p className="mt-3 text-[19px] text-white/55">잠시만 기다려 주세요</p>

      <div className="relative mt-8 flex flex-1 items-center justify-center">
        <motion.div
          initial={{ y: 300 }}
          animate={{ y: -24 }}
          transition={{ duration: 6.0, ease: [0.33, 0, 0.2, 1] }}
          className="text-white/80"
        >
          <PhoneGlyph mode="plain" className="h-[380px]" />
        </motion.div>
        <motion.div
          className="absolute bottom-10 text-white/30"
          animate={{ y: [-6, 6, -6], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <ChevronUp size={40} />
        </motion.div>
      </div>
    </div>
  );
}
