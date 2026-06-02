"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced to the server logs in production.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[520px] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-6xl text-grad">Oof</p>
      <h1 className="mt-2 font-display text-2xl tracking-wide">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-xs text-sm text-dim">
        We hit a snag rendering this view. Try again — your data is safe.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="glass">
          Home
        </ButtonLink>
      </div>
    </main>
  );
}
