import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star, Bell, Globe2 } from "lucide-react";
import BrandMark from "@/components/ui/BrandMark";
import TelegramLoginButton from "@/components/auth/TelegramLoginButton";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Log in" };
export const dynamic = "force-dynamic";

const perks = [
  { Icon: Star, text: "Pin your two favourite teams" },
  { Icon: Bell, text: "Telegram kickoff reminders (IST)" },
  { Icon: Globe2, text: "Globe auto-flies to your team's first match" },
];

export default async function LoginPage() {
  if (await getSession()) redirect("/");
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME;

  return (
    <div className="rise-in text-center">
      <div className="mb-7 flex justify-center">
        <BrandMark href={null} className="text-3xl" />
      </div>
      <h1 className="font-display text-4xl leading-none tracking-wide">
        Make it yours
      </h1>
      <p className="mx-auto mt-3 max-w-xs text-sm text-dim">
        Sign in with Telegram to personalise WC26. One tap — no password.
      </p>

      <ul className="mx-auto mb-8 mt-7 max-w-xs space-y-3 text-left">
        {perks.map(({ Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface2 text-accent">
              <Icon className="size-4" />
            </span>
            <span className="text-sm text-text">{text}</span>
          </li>
        ))}
      </ul>

      {botUsername ? (
        <Suspense fallback={<div className="min-h-[48px]" />}>
          <TelegramLoginButton botUsername={botUsername} />
        </Suspense>
      ) : (
        <div className="glass mx-auto max-w-sm rounded-2xl p-4 text-left text-sm text-dim">
          <p className="font-semibold text-text">Telegram login not configured</p>
          <p className="mt-1.5">
            Set <code className="text-accent">NEXT_PUBLIC_BOT_USERNAME</code> and{" "}
            <code className="text-accent">BOT_TOKEN</code> (from{" "}
            <a
              href="https://t.me/BotFather"
              className="text-accent underline"
              target="_blank"
              rel="noreferrer"
            >
              @BotFather
            </a>
            ), then <code className="text-accent">/setdomain</code> to this
            site. See the README.
          </p>
        </div>
      )}

      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-dim">
        ← Continue without signing in
      </Link>
    </div>
  );
}
