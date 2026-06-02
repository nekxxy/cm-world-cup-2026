import Link from "next/link";
import { cn } from "@/lib/cn";

/** The WC26 wordmark — Anton display face with an accent "26". */
export default function BrandMark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const mark = (
    <span
      className={cn(
        "font-display text-2xl leading-none tracking-wide",
        className,
      )}
    >
      WC<span className="text-accent">26</span>
    </span>
  );

  if (href === null) return mark;
  return (
    <Link href={href} aria-label="WC26 home" className="inline-flex">
      {mark}
    </Link>
  );
}
