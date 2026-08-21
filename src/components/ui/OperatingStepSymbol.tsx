// Compact, static symbols for the closed mission loop on the homepage.
// Adjacent text carries the accessible meaning, so every SVG is decorative.
// The pictograms use the same achromatic stroke language as ProblemSymbol.

export type OperatingSymbolVariant =
  | "dock"
  | "dispatch"
  | "patrol"
  | "detect"
  | "escalate"
  | "return"
  | "recharge"
  | "gpsDenied";

function Drone({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M10 9h12M12 9L7 5M20 9l5-4M12 9l-5 4M20 9l5 4" />
      <rect x="13" y="7" width="6" height="4" rx="1" />
      <circle cx="5" cy="4" r="2" />
      <circle cx="27" cy="4" r="2" />
      <circle cx="5" cy="14" r="2" />
      <circle cx="27" cy="14" r="2" />
    </g>
  );
}

function SymbolContent({ variant }: { variant: OperatingSymbolVariant }) {
  switch (variant) {
    case "dock":
      return (
        <>
          <Drone x={8} y={7} />
          <path d="M13 37h22l5 7H8zM16 37v-6h16v6" />
          <path d="M24 32l3-5h-4l3-5" opacity="0.65" />
        </>
      );

    case "dispatch":
      return (
        <>
          <Drone x={8} y={20} />
          <path d="M24 19V6M18 12l6-6 6 6" />
          <path d="M11 40h26" opacity="0.35" />
        </>
      );

    case "patrol":
      return (
        <>
          <Drone x={8} y={4} />
          <path d="M10 34c0-7 6-10 13-7l9 4c7 3 7 10 1 13s-13 0-13-6" />
          <path d="M17 39l3-3 3 3" />
        </>
      );

    case "detect":
      return (
        <>
          <path d="M6 25s7-11 18-11 18 11 18 11-7 11-18 11S6 25 6 25z" />
          <circle cx="24" cy="25" r="5" />
          <path d="M24 8v5M24 37v5M7 25H2M46 25h-5" opacity="0.55" />
        </>
      );

    case "escalate":
      return (
        <>
          <path d="M8 34h13M10 31c0-6 2-10 5-10s5 4 5 10M13 18a3 3 0 1 1 4 0" />
          <path d="M27 17c6 1 10 5 11 11M29 11c9 1 15 7 16 16" opacity="0.55" />
          <circle cx="27" cy="29" r="2" fill="currentColor" stroke="none" />
          <path d="M27 31v9" />
        </>
      );

    case "return":
      return (
        <>
          <Drone x={12} y={7} />
          <path d="M39 27c0 10-7 16-17 16H10M15 38l-5 5 5 5" />
          <path d="M21 43l5-6 5 6" opacity="0.4" />
        </>
      );

    case "recharge":
      return (
        <>
          <rect x="13" y="13" width="22" height="28" rx="2" />
          <path d="M20 9h8v4M23 18l-4 9h6l-3 9" />
          <path d="M7 18c-4 7-3 16 3 21M7 39H2v-5M41 36c4-7 3-16-3-21M41 15h5v5" opacity="0.55" />
        </>
      );

    case "gpsDenied":
      return (
        <>
          <path d="M8 11l9 9M6 20l4-4 5 5-4 4zM19 8l4 4-5 5-4-4z" />
          <path d="M23 22c5 1 8 4 9 9M25 16c8 1 13 7 14 14" opacity="0.35" />
          <path d="M4 40h17l6-6 6 6h11" />
          <path d="M23 28l10 10" strokeWidth="2.4" />
        </>
      );
  }
}

export default function OperatingStepSymbol({
  variant,
  compact = false,
}: {
  variant: OperatingSymbolVariant;
  compact?: boolean;
}) {
  return (
    <span
      data-operating-symbol
      aria-hidden="true"
      className={
        compact
          ? "flex size-10 shrink-0 items-center justify-center border border-line bg-bg"
          : "relative z-10 flex size-12 items-center justify-center border border-line bg-bg md:size-14"
      }
    >
      <svg
        focusable="false"
        viewBox="0 0 48 48"
        className={
          compact
            ? "size-7 fill-none stroke-current text-fg"
            : "size-8 fill-none stroke-current text-fg md:size-9"
        }
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <SymbolContent variant={variant} />
      </svg>
    </span>
  );
}
