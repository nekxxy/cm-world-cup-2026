import Link from "next/link";
import BrandMark from "@/components/ui/BrandMark";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="rise-in text-center">
      <div className="mb-8 flex justify-center">
        <BrandMark href={null} className="text-3xl" />
      </div>
      <h1 className="font-display text-3xl tracking-wide">Log in</h1>
      <p className="mx-auto mt-3 max-w-xs text-sm text-dim">
        Telegram login arrives in the auth phase. You&apos;ll sign in with one
        tap and pick your two favourite teams.
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
