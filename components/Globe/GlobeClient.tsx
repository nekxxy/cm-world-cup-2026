"use client";

import dynamic from "next/dynamic";
import { Globe2 } from "lucide-react";
import type { Venue } from "@/lib/types";
import type { VenueMeta } from "./VenueHUD";

// Lazy-load the heavy 3D bundle; it never runs on the server.
const GlobeExperience = dynamic(() => import("./GlobeExperience"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-0 grid place-items-center bg-bg">
      <Globe2 className="size-10 animate-pulse text-accent" />
    </div>
  ),
});

export default function GlobeClient(props: {
  venues: Venue[];
  venueMeta: Record<string, VenueMeta>;
  initialFocusId: string | null;
  accentOverride?: string | null;
}) {
  return <GlobeExperience {...props} />;
}
