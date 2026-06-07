import { HOTSPOTS } from "../kiosk";

type Mode = "plain" | "dirty" | "clean";

/**
 * 라인아트 폰 일러스트. stroke는 currentColor를 상속 → 부모가 톤(밝음/어둠) 결정.
 * - dirty: 표면 오염 핫스팟 (또렷한 링, blur 없음)
 * - clean: 케어 완료 체크
 */
export function PhoneGlyph({
  mode = "plain",
  className = "",
  accent,
}: {
  mode?: Mode;
  className?: string;
  accent?: string;
}) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: "1 / 2" }}>
      <svg
        viewBox="0 0 100 200"
        fill="none"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x="6"
          y="4"
          width="88"
          height="192"
          rx="18"
          stroke="currentColor"
          strokeWidth="2.5"
          opacity="0.9"
        />
        <rect
          x="13"
          y="11"
          width="74"
          height="178"
          rx="12"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.25"
        />
        {/* 스피커 */}
        <rect x="42" y="16" width="16" height="2.6" rx="1.3" fill="currentColor" opacity="0.35" />
      </svg>

      {/* dirty: 오염 핫스팟 (또렷한 링) */}
      {mode === "dirty" &&
        HOTSPOTS.map((h) => {
          const big = h.level === "high";
          const c = big ? "var(--color-coral)" : "#d9a01e";
          const d = big ? 34 : 24;
          return (
            <div
              key={h.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              <div
                className="rounded-full"
                style={{
                  width: d,
                  height: d,
                  border: `2px solid ${c}`,
                  background: `${c}1f`,
                  animation: "soft-pulse 1.8s ease-in-out infinite",
                }}
              />
            </div>
          );
        })}

      {/* clean: 중앙 체크 */}
      {mode === "clean" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: "38%",
              height: "19%",
              background: accent ?? "var(--color-mint)",
            }}
          >
            <svg width="40%" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
