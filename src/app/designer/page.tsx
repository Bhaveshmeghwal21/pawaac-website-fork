import type { Metadata } from "next";
import SystemDesigner from "@/components/designer/SystemDesigner";

export const metadata: Metadata = {
  title: "Coverage Planner · PAWAAC Drones",
  description:
    "Design your own autonomous surveillance coverage. Draw your property on the map and see the number of drone docking stations needed for 24x7 protection.",
};

// Deliberately renders no <Footer />, unlike the other 12 routes.
//
// SystemDesigner is a full-viewport interactive tool: its first step is a
// h-[100dvh] centred panel and its second is an absolutely-positioned map with
// floating overlay controls. A footer below that would either be unreachable or
// force the map to scroll away mid-interaction. The Navigation header still
// provides a way out, and this is the one route where a marketing footer is
// wrong rather than merely absent.
export default function DesignerPage() {
  return <SystemDesigner />;
}
