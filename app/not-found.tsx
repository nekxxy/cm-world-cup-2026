import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import BrandMark from "@/components/ui/BrandMark";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[520px] flex-col items-center justify-center px-6 text-center">
      <BrandMark href={null} className="text-2xl" />
      <p className="mt-8 font-display text-7xl text-grad">404</p>
      <h1 className="mt-2 font-display text-2xl tracking-wide">Off the pitch</h1>
      <p className="mt-2 max-w-xs text-sm text-dim">
        That page isn&apos;t in the squad. Let&apos;s get you back to the action.
      </p>
      <ButtonLink href="/" className="mt-8">
        Back home
      </ButtonLink>
      <Link href="/schedule" className="mt-4 text-sm font-semibold text-accent">
        View fixtures
      </Link>
    </main>
  );
}
