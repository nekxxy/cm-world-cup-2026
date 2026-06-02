import Image from "next/image";
import type { Team } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Circular flag/crest for a team. Falls back to the team code (or a neutral
 * marker for knockout placeholders) when no image is available.
 */
export default function Flag({
  team,
  size = 28,
  className,
}: {
  team?: Team | null;
  size?: number;
  className?: string;
}) {
  if (team?.flagUrl) {
    return (
      <Image
        src={team.flagUrl}
        alt=""
        width={size}
        height={size}
        className={cn(
          "shrink-0 rounded-full object-cover ring-1 ring-white/15",
          className,
        )}
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-surface2 text-[10px] font-bold uppercase text-dim ring-1 ring-white/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {team?.code ?? "?"}
    </span>
  );
}
