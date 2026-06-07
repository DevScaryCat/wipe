import { useMemo } from "react";
import { type WashStage } from "../kiosk";

/**
 * 살균 다단계 비주얼. stage별로 다른 연출, 모두 폰 면(클립) 안에서만.
 *  - air : 바람 줄기 + 먼지 날림
 *  - mist: 살균수 미세 분사 + 표면 젖음
 *  - uv  : UV 처리선이 위→아래로 훑음
 *  - dry : 물방울 증발 + 마무리 클린 체크
 * 표면 오염(세균/링) 점은 표시하지 않음 — 깨끗한 폰 위에서 단계 연출만.
 * GPU 친화(transform/opacity)로만 동작.
 */

export function StageVisual({
  stage,
  stageProgress,
  className = "",
}: {
  stage: WashStage;
  stageProgress: number;
  className?: string;
}) {
  const drops = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: 14 + ((i * 61) % 72),
        y: 10 + ((i * 41) % 80),
        size: 4 + ((i * 7) % 5),
        delay: (i % 6) * 0.18,
      })),
    [],
  );
  const dust = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: 20 + ((i * 47) % 55),
        y: 14 + ((i * 53) % 70),
        size: 3 + ((i * 11) % 4),
      })),
    [],
  );

  const front = stageProgress * 100; // uv 처리선 위치

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: "1 / 2" }}>
      {/* 폰 라인아트 */}
      <svg
        viewBox="0 0 100 200"
        fill="none"
        className="absolute inset-0 h-full w-full text-white/75"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x="6" y="4" width="88" height="192" rx="18" stroke="currentColor" strokeWidth="2.5" opacity="0.85" />
        <rect x="13" y="11" width="74" height="178" rx="12" stroke="currentColor" strokeWidth="1" opacity="0.2" />
        <rect x="42" y="16" width="16" height="2.6" rx="1.3" fill="currentColor" opacity="0.3" />
      </svg>

      {/* 클립 레이어 (폰 바디) */}
      <div
        className="absolute overflow-hidden"
        style={{ left: "6%", top: "2%", width: "88%", height: "96%", borderRadius: "16% / 8%" }}
      >
        {/* ── 에어: 강한 바람 줄기 + 스피드 대시 + 먼지 날림 ── */}
        {stage === "air" && (
          <>
            {/* 굵은 바람 줄기 (글로우) */}
            {[12, 24, 38, 50, 62, 75, 87].map((top, i) => (
              <div
                key={`s${i}`}
                className="absolute left-0 rounded-full"
                style={{
                  top: `${top}%`,
                  height: i % 2 ? 3 : 4,
                  width: `${50 + (i % 3) * 16}%`,
                  background:
                    "linear-gradient(to right, transparent, rgba(125,211,252,0.25), rgba(199,236,255,0.98), rgba(125,211,252,0.25), transparent)",
                  boxShadow: "0 0 9px rgba(125,211,252,0.65)",
                  animation: `wind ${0.85 + (i % 3) * 0.2}s ${i * 0.12}s linear infinite`,
                }}
              />
            ))}
            {/* 빠른 스피드 대시 */}
            {[20, 33, 46, 58, 70, 82].map((top, i) => (
              <div
                key={`d${i}`}
                className="absolute left-0 rounded-full"
                style={{
                  top: `${top}%`,
                  height: 2,
                  width: 26 + (i % 3) * 12,
                  background: "rgba(224,242,254,0.98)",
                  boxShadow: "0 0 6px rgba(125,211,252,0.85)",
                  animation: `wind ${0.55 + (i % 2) * 0.15}s ${i * 0.1 + 0.2}s linear infinite`,
                }}
              />
            ))}
            {/* 날리는 먼지 */}
            {dust.map((d) => (
              <span
                key={d.id}
                className="absolute rounded-full bg-white/80"
                style={{
                  left: `${d.x}%`,
                  top: `${d.y}%`,
                  width: d.size,
                  height: d.size,
                  transform: `translateX(${stageProgress * 130}px)`,
                  opacity: Math.max(0, 1 - stageProgress * 1.2),
                  transition: "transform 0.2s linear",
                }}
              />
            ))}
          </>
        )}

        {/* ── 살균수: 미세 분사 + 젖음 ── */}
        {stage === "mist" && (
          <>
            {/* 분사 안개 */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(94,234,212,0.18), rgba(94,234,212,0.04))",
                opacity: stageProgress,
              }}
            />
            {drops.map((dp) => (
              <span
                key={dp.id}
                className="absolute rounded-full"
                style={{
                  left: `${dp.x}%`,
                  top: `${dp.y}%`,
                  width: dp.size,
                  height: dp.size,
                  background: "rgba(165,243,252,0.9)",
                  boxShadow: "0 0 4px rgba(94,234,212,0.6)",
                  opacity: stageProgress,
                  animation: `mist-fall 1.4s ${dp.delay}s ease-in-out infinite`,
                }}
              />
            ))}
          </>
        )}

        {/* ── UV-C: 처리선 + 클린 시트 ── */}
        {stage === "uv" && (
          <>
            <div
              className="absolute inset-x-0 top-0"
              style={{
                height: `${front}%`,
                background:
                  "linear-gradient(to bottom, rgba(91,75,221,0.05), rgba(11,181,156,0.10))",
              }}
            />
            {front > 0.5 && front < 99.5 && (
              <>
                <div
                  className="absolute inset-x-0"
                  style={{
                    top: `${front}%`,
                    height: 60,
                    transform: "translateY(-50%)",
                    background:
                      "linear-gradient(to bottom, transparent, rgba(91,75,221,0.45), transparent)",
                  }}
                />
                <div
                  className="absolute inset-x-0"
                  style={{
                    top: `${front}%`,
                    height: 2,
                    transform: "translateY(-50%)",
                    background: "rgba(196,190,255,0.95)",
                    boxShadow: "0 0 12px 2px rgba(91,75,221,0.8)",
                  }}
                />
              </>
            )}
          </>
        )}

        {/* ── 건조: 물방울 증발 + 따뜻한 바람 + 마무리 체크 ── */}
        {stage === "dry" && (
          <>
            {drops.map((dp) => (
              <span
                key={dp.id}
                className="absolute rounded-full"
                style={{
                  left: `${dp.x}%`,
                  top: `${dp.y}%`,
                  width: dp.size,
                  height: dp.size,
                  background: "rgba(165,243,252,0.85)",
                  opacity: Math.max(0, 1 - stageProgress * 1.4),
                  transform: `scale(${Math.max(0.2, 1 - stageProgress)})`,
                  transition: "opacity 0.3s linear, transform 0.3s linear",
                }}
              />
            ))}
            {[20, 34, 50, 66, 80].map((top, i) => (
              <div
                key={i}
                className="absolute left-0 rounded-full"
                style={{
                  top: `${top}%`,
                  height: i % 2 ? 3 : 4,
                  width: `${48 + (i % 3) * 14}%`,
                  background:
                    "linear-gradient(to right, transparent, rgba(251,191,36,0.3), rgba(254,215,170,0.95), rgba(251,191,36,0.3), transparent)",
                  boxShadow: "0 0 8px rgba(251,191,36,0.5)",
                  animation: `wind ${1.0 + (i % 3) * 0.18}s ${i * 0.14}s linear infinite`,
                }}
              />
            ))}
            {stageProgress > 0.82 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="flex items-center justify-center rounded-full bg-mint"
                  style={{ width: "34%", height: "17%" }}
                >
                  <svg width="40%" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
