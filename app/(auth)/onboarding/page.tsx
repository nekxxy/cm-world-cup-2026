import Link from "next/link";

export const metadata = { title: "Pick your teams" };

export default function OnboardingPage() {
  return (
    <div className="rise-in text-center">
      <h1 className="font-display text-3xl tracking-wide">Pick your teams</h1>
      <p className="mx-auto mt-3 max-w-xs text-sm text-dim">
        The two-favourite selection flow is built in the onboarding phase.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm font-semibold text-accent"
      >
        ← Back home
      </Link>
    </div>
  );
}
