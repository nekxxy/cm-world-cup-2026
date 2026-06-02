"use client";

import dynamic from "next/dynamic";

// Lazy-load the 3D hero; never runs on the server.
const RoadHero = dynamic(() => import("./RoadHero"), {
  ssr: false,
  loading: () => (
    <div className="ml-[calc(50%-50vw)] -mt-[calc(env(safe-area-inset-top)+5.25rem)] h-[100svh] w-screen bg-bg" />
  ),
});

export default function RoadHeroClient() {
  return <RoadHero />;
}
