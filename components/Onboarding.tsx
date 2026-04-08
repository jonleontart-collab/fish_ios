"use client";

import { useState } from "react";
import { ArrowRight, Globe } from "lucide-react";
import Image from "next/image";

const languages = [
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
];

export default function Onboarding() {
  const [lang, setLang] = useState("ru");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), lang }),
      });

      if (res.ok) {
        window.location.reload(); // Hard reload to apply cookie and login state
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 font-sans text-text-main relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[#07111c]/80 backdrop-blur-3xl" />
        <Image src="/graphics/hero-main-river.png" alt="River" fill className="object-cover opacity-10 mix-blend-screen" priority />
      </div>

      <div className="z-10 w-full max-w-sm flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-elevated/50 shadow-xl border border-divider/10 backdrop-blur-md">
          <Image src="/brand/app-mark.png" alt="FishFlow Logo" width={56} height={56} className="h-14 w-auto drop-shadow-md" />
        </div>
        
        <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-white drop-shadow-sm">FishFlow</h1>
        <p className="mb-10 text-text-muted text-base">International Fishing Community</p>

        <form onSubmit={handleJoin} className="w-full flex flex-col gap-5">
          {/* Language Selector */}
          <div className="relative group w-full">
            <Globe className="absolute left-4 top-4 h-5 w-5 text-text-muted transition-colors group-focus-within:text-primary z-10" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full h-14 appearance-none rounded-2xl bg-surface-elevated/80 pl-12 pr-4 text-white placeholder-text-muted outline-none border border-divider/50 focus:border-primary focus:bg-surface-elevated transition-colors relative z-0"
              required
            >
              <option value="" disabled>Select language...</option>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name Input */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваш никнейм (Your Nickname)"
            className="w-full h-14 rounded-2xl bg-surface-elevated/80 px-5 text-white placeholder-text-muted outline-none flex items-center border border-divider/50 focus:border-primary focus:bg-surface-elevated transition-colors"
            required
            autoComplete="off"
            maxLength={24}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground shadow-lg transition-all active:scale-95 disabled:opacity-50 hover:bg-primary-hover"
          >
            {isLoading ? "Starting..." : "Begin Journey"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
