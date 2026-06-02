"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <Button variant="glass" onClick={logout} className="w-full">
      <LogOut className="size-4" />
      Log out
    </Button>
  );
}
