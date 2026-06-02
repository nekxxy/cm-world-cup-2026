"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, Star, Bell, ArrowLeft, Sparkles } from "lucide-react";
import type { Team } from "@/lib/types";
import Flag from "@/components/ui/Flag";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function TeamPicker({
  teams,
  exclude,
  selectedId,
  onPick,
}: {
  teams: Team[];
  exclude?: number | null;
  selectedId: number | null;
  onPick: (id: number) => void;
}) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return teams
      .filter((t) => t.id !== exclude)
      .filter(
        (t) =>
          !needle ||
          t.name.toLowerCase().includes(needle) ||
          (t.code ?? "").toLowerCase().includes(needle),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teams, q, exclude]);

  return (
    <div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search teams…"
          aria-label="Search teams"
          className="glass-2 h-11 w-full rounded-xl pl-9 pr-3 text-sm text-text placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-accent/60"
        />
      </div>
      <div className="grid max-h-[46vh] grid-cols-2 gap-2 overflow-y-auto pb-2">
        {list.map((t) => {
          const sel = selectedId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className={cn(
                "glass flex items-center gap-2.5 rounded-xl p-2.5 text-left transition",
                sel
                  ? "accent-glow ring-1 ring-accent"
                  : "hover:border-white/20",
              )}
            >
              <Flag team={t} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-text">
                  {t.name}
                </span>
                {t.groupId ? (
                  <span className="text-[10px] uppercase tracking-wide text-dim">
                    Group {t.groupId}
                  </span>
                ) : null}
              </span>
              {sel ? <Check className="size-4 shrink-0 text-accent" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function OnboardingFlow({
  teams,
  initialFav,
  initialFav2,
}: {
  teams: Team[];
  initialFav: number | null;
  initialFav2: number | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [fav, setFav] = useState<number | null>(initialFav);
  const [fav2, setFav2] = useState<number | null>(initialFav2);
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamName = (id: number | null) =>
    teams.find((t) => t.id === id)?.name ?? "";

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/me/favourites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          favTeamId: fav,
          fav2TeamId: fav2,
          notifyEnabled: notify,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Could not save");
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
      setSaving(false);
    }
  }

  if (teams.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <Sparkles className="mx-auto size-8 text-accent" />
        <h2 className="mt-3 font-display text-xl tracking-wide">
          Teams aren&apos;t seeded yet
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-dim">
          Once the 48 teams are loaded (<code>npm run seed</code>), you can pick
          your two favourites here.
        </p>
        <ButtonLink href="/" className="mt-5">
          Explore the app
        </ButtonLink>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[0, 1, 2].map((s) => (
          <span
            key={s}
            className={cn(
              "h-1.5 rounded-full transition-all",
              s === step ? "w-8 bg-accent" : "w-4 bg-white/15",
            )}
          />
        ))}
      </div>

      {step === 0 ? (
        <section>
          <h2 className="mb-1 flex items-center gap-2 font-display text-2xl tracking-wide">
            <Star className="size-5 text-accent" />
            Favourite team
          </h2>
          <p className="mb-4 text-sm text-dim">
            The team you&apos;ll live and die with this summer.
          </p>
          <TeamPicker
            teams={teams}
            selectedId={fav}
            onPick={(id) => {
              setFav(id);
              if (fav2 === id) setFav2(null);
              setStep(1);
            }}
          />
        </section>
      ) : step === 1 ? (
        <section>
          <button
            onClick={() => setStep(0)}
            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-dim hover:text-text"
          >
            <ArrowLeft className="size-4" /> {teamName(fav)}
          </button>
          <h2 className="mb-1 flex items-center gap-2 font-display text-2xl tracking-wide">
            <Star className="size-5 text-accent" />
            Second favourite
          </h2>
          <p className="mb-4 text-sm text-dim">Your back-up to cheer for.</p>
          <TeamPicker
            teams={teams}
            exclude={fav}
            selectedId={fav2}
            onPick={(id) => {
              setFav2(id);
              setStep(2);
            }}
          />
        </section>
      ) : (
        <section>
          <button
            onClick={() => setStep(1)}
            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-dim hover:text-text"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <h2 className="mb-1 font-display text-2xl tracking-wide">All set!</h2>
          <p className="mb-5 text-sm text-dim">
            Cheering for{" "}
            <span className="font-semibold text-accent">{teamName(fav)}</span>{" "}
            and{" "}
            <span className="font-semibold text-accent">{teamName(fav2)}</span>.
          </p>

          <label className="glass flex cursor-pointer items-center gap-3 rounded-2xl p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface2 text-accent">
              <Bell className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-text">
                Kickoff reminders
              </span>
              <span className="block text-xs text-dim">
                Telegram DM 30 min before & at kickoff (IST)
              </span>
            </span>
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="size-5 accent-[var(--accent)]"
            />
          </label>

          {error ? <p className="mt-3 text-sm text-live">{error}</p> : null}

          <Button
            onClick={finish}
            disabled={saving || fav == null}
            size="lg"
            className="mt-5 w-full"
          >
            {saving ? "Saving…" : "Enter WC26"}
          </Button>
        </section>
      )}
    </div>
  );
}
