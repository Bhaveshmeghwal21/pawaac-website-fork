// Compact symbols for the five constraints in HomeProblemFraming.
//
// These are pictograms, not explanatory diagrams. The rejected visual system
// asked a small card to explain routes, elapsed time and coverage geometry;
// those abstractions took too much space and still needed the copy to decode
// them. Each mark now combines two familiar objects to identify the problem at
// a glance, while the adjacent title and line carry the precise meaning.
//
// The symbols are decorative because every meaning is repeated in real text.
// They stay static and achromatic, use no SVG text, and require no reduced
// motion branch.

export type ProblemSymbolVariant =
  | "blindSpots"
  | "incompletePatrols"
  | "delayedResponse"
  | "manpowerStrain"
  | "gpsLoss";

function Drone({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M15 12h18M19 12l-7-6M29 12l7-6M19 12l-7 6M29 12l7 6" />
      <rect x="20" y="9" width="8" height="6" rx="1" />
      <circle cx="9" cy="5" r="3" />
      <circle cx="39" cy="5" r="3" />
      <circle cx="9" cy="19" r="3" />
      <circle cx="39" cy="19" r="3" />
    </g>
  );
}

function SymbolContent({ variant }: { variant: ProblemSymbolVariant }) {
  switch (variant) {
    case "blindSpots":
      return (
        <>
          {/* Fixed camera and a field of view interrupted by an unseen gap. */}
          <path d="M13 17h22l5 7H18z" />
          <path d="M34 18l8-5v14l-5-3" />
          <path d="M22 25L9 50h18M39 25l14 25H35" opacity="0.38" />
          <path d="M27 50h8" strokeDasharray="2.5 3" />
          <circle cx="31" cy="50" r="2.5" fill="currentColor" stroke="none" />
        </>
      );

    case "incompletePatrols":
      return (
        <>
          {/* A human scheduled flight: aircraft paired with a clock. */}
          <Drone x={2} y={8} />
          <circle cx="46" cy="46" r="11" />
          <path d="M46 40v7l5 3" />
          <path d="M13 47h17" strokeDasharray="3 4" opacity="0.45" />
        </>
      );

    case "delayedResponse":
      return (
        <>
          {/* Alert is active while the aircraft remains on its landing pad. */}
          <path d="M10 23l8-14 8 14z" />
          <path d="M18 14v4M18 21h.01" />
          <Drone x={19} y={27} />
          <path d="M31 53h24M35 48h16l4 5H31z" opacity="0.45" />
          <path d="M25 24h23" strokeDasharray="3 4" opacity="0.35" />
        </>
      );

    case "manpowerStrain":
      return (
        <>
          {/* One operator is visibly tied to one aircraft; others wait. */}
          <circle cx="14" cy="18" r="5" />
          <path d="M6 35c1-7 4-11 8-11s7 4 8 11" />
          <path d="M23 27h10" />
          <Drone x={20} y={15} />
          <path d="M35 48h20" opacity="0.24" />
          <path d="M39 44l-4 4 4 4M51 44l4 4-4 4" opacity="0.24" />
        </>
      );

    case "gpsLoss":
      return (
        <>
          {/* Satellite link cut before it reaches the aircraft. */}
          <path d="M12 12l10 10M9 21l4-4 5 5-4 4zM23 8l4 4-5 5-4-4z" />
          <path d="M24 24c6 1 11 6 12 12M27 18c9 2 16 9 18 18" opacity="0.35" />
          <path d="M31 29l7 7" strokeWidth="2.5" />
          <Drone x={17} y={35} />
        </>
      );
  }
}

export default function ProblemSymbol({
  variant,
}: {
  variant: ProblemSymbolVariant;
}) {
  return (
    <span
      data-problem-symbol
      aria-hidden="true"
      className="flex size-12 items-center justify-center border border-line bg-bg-2 text-fg md:size-14"
    >
      <svg
        focusable="false"
        viewBox="0 0 64 64"
        className="pointer-events-none size-9 select-none fill-none stroke-current md:size-10"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <SymbolContent variant={variant} />
      </svg>
    </span>
  );
}
