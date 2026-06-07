import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Clock } from "lucide-react";
import { PRICE } from "../kiosk";
import { Wordmark } from "../components/Brand";
import { PhoneGlyph } from "../components/PhoneGlyph";

export function AttractScreen({ onStart }: { onStart: () => void }) {
  return (
    <button
      onClick={onStart}
      className="absolute inset-0 flex flex-col bg-paper px-14 pb-14 pt-16 text-left text-ink"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between text-ink">
        <Wordmark size={20} />
        <span className="rounded-full bg-surface px-4 py-2 text-[15px] font-medium text-muted">
          스마트폰 위생 케어
        </span>
      </div>

      {/* 헤드라인 */}
      <div className="mt-16">
        <h1 className="text-[60px] font-extrabold leading-[1.08] tracking-[-0.02em]">
          하루 종일 만진 폰,
          <br />
          <span className="text-uv">30초</span> UV-C 케어
        </h1>
        <p className="mt-5 max-w-[460px] text-[22px] leading-relaxed text-muted">
          넣기만 하면 끝. 케이스·그립톡 그대로 올려두면 자외선으로 깨끗하게.
        </p>
      </div>

      {/* 제품 비주얼 */}
      <div className="relative mt-2 flex flex-1 items-center justify-center">
        <div className="relative flex h-[420px] w-[300px] items-center justify-center rounded-[36px] bg-surface">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-ink/70"
          >
            <PhoneGlyph mode="clean" className="h-[300px]" />
          </motion.div>
          {/* 절제된 UV 라인 */}
          <div
            className="absolute inset-x-10 h-[2px] bg-uv/50"
            style={{ animation: "scan-sweep 3.2s ease-in-out infinite" }}
          />
        </div>
      </div>

      {/* 신뢰 배지 */}
      <div className="mb-6 flex gap-6 text-[16px] text-ink2">
        <span className="flex items-center gap-2">
          <Clock size={18} className="text-uv" /> 30초 완료
        </span>
        <span className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-uv" /> 폰 접촉 없음
        </span>
        <span className="flex items-center gap-2">
          <Sparkles size={18} className="text-uv" /> 비포·애프터 확인
        </span>
      </div>

      {/* 요금 + CTA */}
      <div className="flex items-center justify-between rounded-3xl bg-surface px-8 py-6">
        <div className="flex flex-col">
          <span className="text-[15px] font-medium text-muted">1회 이용</span>
          <span className="text-[40px] font-extrabold tracking-tight">
            {PRICE.toLocaleString()}
            <span className="ml-1 text-[22px] font-bold text-muted">원</span>
          </span>
        </div>
        <motion.div
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-3 rounded-full bg-ink px-9 py-5 text-[24px] font-bold text-white"
        >
          시작하기 <ArrowRight size={24} />
        </motion.div>
      </div>
    </button>
  );
}
