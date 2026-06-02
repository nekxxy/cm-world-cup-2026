"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Home,
  MapPinned,
  Shield,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import BrandMark from "@/components/ui/BrandMark";
import { cn } from "@/lib/cn";

type Tab = { href: string; label: string; Icon: LucideIcon; also?: string[] };

const TABS: Tab[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/schedule", label: "Schedule", Icon: CalendarDays, also: ["/matches"] },
  { href: "/globe", label: "Map", Icon: MapPinned },
  { href: "/teams", label: "Teams", Icon: Shield },
  { href: "/settings", label: "You", Icon: UserRound },
];

/**
 * Premium glass top navigation for "The Road to 2026". Replaces the old
 * elevated-globe bottom bar; same destinations, cinematic styling.
 */
export default function CinematicNav() {
  const pathname = usePathname();
  const isActive = (t: Tab) => {
    if (t.href === "/") return pathname === "/";
    if (pathname === t.href || pathname.startsWith(`${t.href}/`)) return true;
    return (t.also ?? []).some((p) => pathname.startsWith(p));
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-safe [--pt:0.5rem]">
      <nav
        aria-label="Primary"
        className="mx-auto mt-2 flex w-[calc(100%-1rem)] max-w-5xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[rgba(10,14,22,0.55)] px-3 py-2 backdrop-blur-xl sm:px-4"
      >
        <BrandMark href="/" className="text-xl" />

        <ul className="no-scrollbar -mr-1 flex items-center gap-0.5 overflow-x-auto sm:gap-1">
          {TABS.map((tab) => {
            const active = isActive(tab);
            const { Icon } = tab;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex min-h-9 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-semibold transition",
                    active
                      ? "bg-white/10 text-accent"
                      : "text-dim hover:text-text",
                  )}
                >
                  <Icon
                    className="size-4 shrink-0"
                    strokeWidth={active ? 2.4 : 2}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
