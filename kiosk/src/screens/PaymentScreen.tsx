import { useEffect, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  QrCode,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { PRICE } from "../kiosk";
import { KakaoMark, NaverMark, TossMark, PaycoMark } from "../components/Logos";

type Sub = "select" | "qrList" | "qr" | "processing" | "success" | "failure";

interface Provider {
  key: string;
  name: string;
  bg: string;
  fg: string;
  Mark: ComponentType<{ size?: number }>;
}

const PROVIDERS: Provider[] = [
  { key: "kakao", name: "카카오페이", bg: "#FEE500", fg: "#181600", Mark: KakaoMark },
  { key: "naver", name: "네이버페이", bg: "#03C75A", fg: "#ffffff", Mark: NaverMark },
  { key: "toss", name: "토스페이", bg: "#3182F6", fg: "#ffffff", Mark: TossMark },
  { key: "payco", name: "페이코", bg: "#FF1100", fg: "#ffffff", Mark: PaycoMark },
];

/** 장식용 QR (13×13, 코너 파인더 패턴) */
function QrBig() {
  const N = 13;
  // 파인더 패턴(7×7 형태를 4칸 코너에 단순화): 코너 영역의 테두리/중앙은 검정
  const inFinder = (r: number, c: number) => {
    const corner =
      (r < 4 && c < 4) || (r < 4 && c >= N - 4) || (r >= N - 4 && c < 4);
    if (!corner) return null;
    const rr = r >= N - 4 ? r - (N - 4) : r;
    const cc = c >= N - 4 ? c - (N - 4) : c;
    const ring = rr === 0 || rr === 3 || cc === 0 || cc === 3;
    const center = (rr === 1 || rr === 2) && (cc === 1 || cc === 2);
    return ring || center;
  };
  return (
    <div
      className="grid gap-[3px] rounded-2xl bg-white p-4 ring-1 ring-line"
      style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}
    >
      {Array.from({ length: N * N }, (_, i) => {
        const r = Math.floor(i / N);
        const c = i % N;
        const f = inFinder(r, c);
        const dark = f !== null ? f : (i * 7 + ((i * i) % 5)) % 3 === 0;
        return (
          <span
            key={i}
            className="rounded-[2px]"
            style={{
              width: 14,
              height: 14,
              background: dark ? "var(--color-ink)" : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}

function AmountRow() {
  return (
    <div className="mt-7 flex items-center justify-between border-b border-line pb-6">
      <span className="text-[20px] font-medium text-muted">이용 요금</span>
      <span className="text-[40px] font-extrabold tracking-tight">
        {PRICE.toLocaleString()}
        <span className="ml-1 text-[22px] font-bold text-muted">원</span>
      </span>
    </div>
  );
}

export function PaymentScreen({
  onPaid,
  auto = false,
}: {
  onPaid: () => void;
  auto?: boolean;
}) {
  const [sub, setSub] = useState<Sub>("select");
  const [provider, setProvider] = useState<Provider | null>(null);

  // 자동 진행: QR 표시 → (스캔된 것으로 간주) → 승인 중 → 결제 완료 → 다음 단계
  useEffect(() => {
    if (sub === "qr") {
      const t = setTimeout(() => setSub("processing"), 2800);
      return () => clearTimeout(t);
    }
    if (sub === "processing") {
      const t = setTimeout(() => setSub("success"), 1600);
      return () => clearTimeout(t);
    }
    if (sub === "success") {
      const t = setTimeout(onPaid, 1800);
      return () => clearTimeout(t);
    }
  }, [sub, onPaid]);

  // 발표 모드: 결제 수단 선택 화면을 잠깐 보여준 뒤 자동으로 카드 결제 진행
  useEffect(() => {
    if (!auto || sub !== "select") return;
    const t = setTimeout(() => {
      setProvider(null);
      setSub("processing");
    }, 2800);
    return () => clearTimeout(t);
  }, [auto, sub]);

  const methodLabel = provider ? provider.name : "카드";

  // ── 승인 중 ──
  if (sub === "processing") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper text-ink">
        <Loader2 size={60} className="animate-spin text-uv" />
        <p className="mt-7 text-[26px] font-bold">{methodLabel} 결제 승인 중…</p>
        <p className="mt-2 text-[18px] text-muted">잠시만 기다려 주세요</p>
      </div>
    );
  }

  // ── 결제 완료 ──
  if (sub === "success") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper text-ink">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-mint text-white"
        >
          <Check size={56} strokeWidth={3} />
        </motion.div>
        <p className="mt-8 text-[32px] font-extrabold tracking-tight">결제 완료</p>
        <p className="mt-3 text-[20px] text-muted">
          {methodLabel} · {PRICE.toLocaleString()}원
        </p>
        <p className="mt-10 text-[17px] text-muted">잠시 후 다음 단계로 진행됩니다</p>
      </div>
    );
  }

  // ── 결제 실패 ──
  if (sub === "failure") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper px-14 text-ink">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-coral text-white"
        >
          <X size={56} strokeWidth={3} />
        </motion.div>
        <p className="mt-8 text-[32px] font-extrabold tracking-tight">
          결제에 실패했어요
        </p>
        <p className="mt-3 text-center text-[19px] leading-relaxed text-muted">
          결제가 정상 처리되지 않았어요.
          <br />
          다시 시도해 주세요.
        </p>
        <button
          onClick={() => {
            setProvider(null);
            setSub("select");
          }}
          className="mt-10 flex items-center gap-2.5 rounded-2xl bg-ink px-12 py-5 text-[24px] font-bold text-white active:scale-[0.99]"
        >
          <RotateCcw size={22} /> 다시 시도
        </button>
      </div>
    );
  }

  // ── QR 표시 (자동 결제) ──
  if (sub === "qr") {
    return (
      <div className="absolute inset-0 flex flex-col items-center bg-paper px-14 pb-14 pt-32 text-ink">
        <button
          onClick={() => setSub("qrList")}
          className="absolute left-10 top-28 flex items-center gap-1 text-[18px] font-semibold text-muted"
        >
          <ArrowLeft size={20} /> 뒤로
        </button>
        {provider && (
          <span
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: provider.bg }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
              <provider.Mark />
            </span>
          </span>
        )}
        <h2 className="text-[34px] font-extrabold tracking-tight">
          {provider?.name}로 결제
        </h2>
        <p className="mt-2 text-[19px] text-muted">
          휴대폰으로 QR을 스캔하면 결제가 완료됩니다
        </p>

        <div className="mt-10">
          <QrBig />
        </div>

        <div className="mt-8 flex items-center gap-3 text-[19px] font-semibold text-uv">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-3 w-3 rounded-full bg-uv"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
          <span className="ml-1">스캔 대기 중</span>
        </div>

        <p className="mt-auto text-[15px] text-muted">
          (시뮬레이터: 스캔되면 자동으로 결제가 진행됩니다)
        </p>
      </div>
    );
  }

  // ── 간편결제 리스트 ──
  if (sub === "qrList") {
    return (
      <div className="absolute inset-0 flex flex-col bg-paper px-14 pb-14 pt-32 text-ink">
        <button
          onClick={() => setSub("select")}
          className="absolute left-10 top-28 flex items-center gap-1 text-[18px] font-semibold text-muted"
        >
          <ArrowLeft size={20} /> 뒤로
        </button>
        <h2 className="text-[40px] font-extrabold tracking-tight">간편결제 선택</h2>
        <p className="mt-2 text-[19px] text-muted">사용할 페이를 선택해 주세요</p>

        <AmountRow />

        <div className="mt-7 grid grid-cols-2 gap-4">
          {PROVIDERS.map((p) => (
            <button
              key={p.key}
              data-pay={p.key}
              onClick={() => {
                setProvider(p);
                setSub("qr");
              }}
              className="flex items-center gap-4 rounded-2xl px-5 py-5 text-[22px] font-bold ring-1 ring-black/5 transition-transform active:scale-[0.98]"
              style={{ background: p.bg, color: p.fg }}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white">
                <p.Mark />
              </span>
              <span className="flex-1 text-left">{p.name}</span>
              <ChevronRight size={20} style={{ opacity: 0.6 }} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── 결제 수단 선택 ──
  return (
    <div className="absolute inset-0 flex flex-col bg-paper px-14 pb-14 pt-32 text-ink">
      <h2 className="text-[44px] font-extrabold tracking-tight">결제</h2>
      <p className="mt-2 text-[20px] text-muted">결제 수단을 선택하면 바로 진행됩니다</p>

      <AmountRow />

      <div className="mt-9 flex flex-1 flex-col gap-5">
        <button
          data-testid="pay-card"
          onClick={() => {
            setProvider(null);
            setSub("processing");
          }}
          className="flex items-center gap-6 rounded-3xl border-2 border-line bg-surface p-8 text-left transition-colors hover:border-ink/20 active:scale-[0.99]"
        >
          <CreditCard size={44} className="text-ink2" />
          <div className="flex-1">
            <div className="text-[26px] font-bold">카드 · 삼성페이</div>
            <div className="mt-1 text-[17px] text-muted">카드를 대면 바로 결제</div>
          </div>
          <ChevronRight size={26} className="text-muted" />
        </button>

        <button
          data-testid="pay-qr"
          onClick={() => setSub("qrList")}
          className="flex items-center gap-6 rounded-3xl border-2 border-line bg-surface p-8 text-left transition-colors hover:border-ink/20 active:scale-[0.99]"
        >
          <QrCode size={44} className="text-ink2" />
          <div className="flex-1">
            <div className="text-[26px] font-bold">QR · 간편결제</div>
            <div className="mt-1 text-[17px] text-muted">
              카카오페이 · 네이버페이 · 토스페이 등
            </div>
          </div>
          <ChevronRight size={26} className="text-muted" />
        </button>
      </div>

      {/* 시뮬레이터: 결제 실패 화면 미리보기 (배포 시 제거) */}
      <button
        onClick={() => setSub("failure")}
        className="mx-auto mt-2 text-[14px] text-muted/60 underline underline-offset-2"
      >
        결제 실패 화면 미리보기 (시뮬)
      </button>
    </div>
  );
}
