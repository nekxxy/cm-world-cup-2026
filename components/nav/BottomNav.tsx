"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Globe2,
  Home,
  Shield,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Tab = {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Extra path prefixes that should mark this tab active. */
  also?: string[];
  center?: boolean;
};

const TABS: Tab[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/schedule", label: "Schedule", Icon: CalendarDays, also: ["/matches"] },
  { href: "/globe", label: "Globe", Icon: Globe2, center: true },
  { href: "/teams", label: "Teams", Icon: Shield },
  { href: "/settings", label: "You", Icon: UserRound },
];

function useIsActive() {
  const pathname = usePathname();
  return (tab: Tab) => {
    if (tab.href === "/") return pathname === "/";
    if (pathname === tab.href || pathname.startsWith(`${tab.href}/`)) return true;
    return (tab.also ?? []).some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
  };
}

export default function BottomNav() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center"
    >
      <div className="pointer-events-auto w-full max-w-[520px] px-3 pb-safe [--pb:0.5rem]">
        <ul className="glass grid grid-cols-5 items-end rounded-2xl px-1.5 py-1.5">
          {TABS.map((tab) => {
            const active = isActive(tab);
            const { Icon } = tab;

            if (tab.center) {
              return (
                <li key={tab.href} className="flex justify-center">
                  <Link
                    href={tab.href}
                    aria-label={tab.label}
                    aria-current={active ? "page" : undefined}
                    className="group -mt-7 flex flex-col items-center gap-1"
                  >
                    <span
                      className={cn(
                        "grid size-14 place-items-center rounded-full border border-line bg-bg2 transition-transform duration-200 group-active:scale-95",
                        active
                          ? "accent-glow text-bg"
                          : "text-accent shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]",
                      )}
                      style={
                        active
                          ? { background: "var(--accent)" }
                          : undefined
                      }
                    >
                      <Icon className="size-6" strokeWidth={2.2} />
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wide",
                        active ? "text-accent" : "text-dim",
                      )}
                    >
                      {tab.label}
                    </span>
                  </Link>
                </li>
              );
            }

            return (
              <li key={tab.href} className="flex justify-center">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className="group flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5"
                >
                  <Icon
                    className={cn(
                      "size-[22px] transition-colors",
                      active ? "text-accent" : "text-dim group-hover:text-text",
                    )}
                    strokeWidth={active ? 2.4 : 2}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide transition-colors",
                      active ? "text-accent" : "text-dim",
                    )}
                  >
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
