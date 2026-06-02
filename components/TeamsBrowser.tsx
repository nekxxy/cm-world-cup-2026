"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Team } from "@/lib/types";
import TeamCard from "@/components/cards/TeamCard";
import { cn } from "@/lib/cn";

export default function TeamsBrowser({ teams }: { teams: Team[] }) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string>("all");

  const groups = useMemo(
    () =>
      [...new Set(teams.map((t) => t.groupId).filter(Boolean))].sort() as string[],
    [teams],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return teams
      .filter((t) => group === "all" || t.groupId === group)
      .filter(
        (t) =>
          !needle ||
          t.name.toLowerCase().includes(needle) ||
          (t.code ?? "").toLowerCase().includes(needle),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teams, q, group]);

  const chips = ["all", ...groups];

  return (
    <div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
        <input
          type="search"
          inputMode="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search 48 teams…"
          aria-label="Search teams"
          className="glass-2 h-11 w-full rounded-xl pl-9 pr-3 text-sm text-text placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/60"
        />
      </div>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {chips.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={cn(
              "min-h-9 shrink-0 rounded-full px-3 text-xs font-semibold uppercase tracking-wide transition",
              group === g
                ? "bg-accent text-bg"
                : "glass-2 text-dim hover:text-text",
            )}
          >
            {g === "all" ? "All" : `Group ${g}`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-dim">
          No teams match “{q}”.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {filtered.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}
