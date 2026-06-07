// 간편결제 브랜드 로고 (SVG/워드마크 근사). 흰 배지 위에 브랜드 컬러로 표시.

export function KakaoMark({ size = 24 }: { size?: number }) {
  // 카카오 말풍선 심볼
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 4.2C7 4.2 3 7.4 3 11.3c0 2.5 1.7 4.7 4.2 6-.18.66-.68 2.4-.78 2.84-.12.55.2.54.42.4.17-.12 2.55-1.73 3.58-2.42.51.07 1.04.11 1.58.11 5 0 9-3.2 9-7.13S17 4.2 12 4.2Z"
        fill="#3A1D1D"
      />
    </svg>
  );
}

export function NaverMark({ size = 20 }: { size?: number }) {
  // 네이버 N
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M6 4h5.1l4 6.1V4H18v16h-5.1l-4-6.1V20H6z" fill="#03C75A" />
    </svg>
  );
}

export function TossMark(_props: { size?: number }) {
  return (
    <span
      style={{
        color: "#3182F6",
        fontWeight: 800,
        fontSize: 18,
        letterSpacing: "-0.04em",
        lineHeight: 1,
      }}
    >
      toss
    </span>
  );
}

export function PaycoMark(_props: { size?: number }) {
  return (
    <span
      style={{
        color: "#FF1100",
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: "0",
        lineHeight: 1,
      }}
    >
      PAYCO
    </span>
  );
}
