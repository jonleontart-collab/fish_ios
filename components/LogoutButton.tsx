"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { apiPath } from "@/lib/app-paths";

export function LogoutButton({
  label = "Выйти",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      await fetch(apiPath("/api/auth/logout"), {
        method: "POST",
      });
    } finally {
      router.push("/");
      router.refresh();
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-text-main transition hover:bg-white/10 disabled:opacity-60 ${className}`}
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
      <span>{label}</span>
    </button>
  );
}
