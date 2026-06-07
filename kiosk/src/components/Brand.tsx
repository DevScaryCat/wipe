/** WIPE 워드마크 + 미니멀 로고 마크 (SVG, currentColor 상속) */

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      {/* 챔버 */}
      <rect
        x="4.5"
        y="2.5"
        width="23"
        height="27"
        rx="7"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* 폰 */}
      <rect
        x="11.5"
        y="9.5"
        width="9"
        height="13"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* 살균 스파크 */}
      <path
        d="M16 5.2v1.6M24.4 16h-1.6M16 25.2v1.6M9.2 16H7.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

export function Wordmark({
  size = 22,
  withMark = true,
}: {
  size?: number;
  withMark?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {withMark && <Mark size={size + 6} />}
      <span
        style={{ fontSize: size, letterSpacing: "0.34em" }}
        className="font-bold"
      >
        WIPE
      </span>
    </div>
  );
}
