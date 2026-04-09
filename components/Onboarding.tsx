"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, Globe, KeyRound, UserRound } from "lucide-react";

import { apiPath, withBasePath } from "@/lib/app-paths";

const languages = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
];

const initialRegisterState = {
  firstName: "",
  lastName: "",
  handle: "",
  birthDate: "",
  password: "",
};

const initialLoginState = {
  handle: "",
  password: "",
};

export default function Onboarding() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [lang, setLang] = useState("ru");
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const title = useMemo(
    () => (mode === "login" ? "Вход в FishFlow" : "Регистрация в FishFlow"),
    [mode],
  );

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? apiPath("/api/auth/login") : apiPath("/api/auth/register");
      const payload =
        mode === "login"
          ? { ...loginForm, lang }
          : {
              ...registerForm,
              handle: registerForm.handle.trim(),
              lang,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Не удалось выполнить авторизацию.");
      }

      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось выполнить авторизацию.");
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-8 text-text-main">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(94,156,255,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(103,232,178,0.18),transparent_30%),linear-gradient(180deg,#02060b_0%,#04090f_45%,#010203_100%)]" />
        <div className="absolute inset-0 opacity-15">
          <Image src={withBasePath("/graphics/hero-main-river.png")} alt="" fill className="object-cover mix-blend-screen" priority />
        </div>
      </div>

      <div className="w-full max-w-md rounded-[36px] border border-white/8 bg-[rgba(4,10,16,0.82)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-7">
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-white/5">
            <Image
              src={withBasePath("/brand/app-mark-square.png")}
              alt="FishFlow"
              width={44}
              height={44}
              className="h-11 w-11"
            />
          </div>
          <div>
            <div className="font-display text-[34px] font-bold tracking-tight text-white">FishFlow</div>
            <p className="text-sm text-[#93a9c3]">Private fishing community access</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-[22px] border border-white/8 bg-white/4 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
              mode === "login" ? "bg-primary text-slate-950" : "text-text-muted hover:text-white"
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
              mode === "register" ? "bg-primary text-slate-950" : "text-text-muted hover:text-white"
            }`}
          >
            Регистрация
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#a6b7cc]">
            <Globe size={16} className="text-primary" />
            Язык интерфейса
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => setLang(language.code)}
                className={`rounded-[18px] border px-3 py-3 text-sm font-semibold transition ${
                  lang === language.code
                    ? "border-primary bg-primary/18 text-primary"
                    : "border-white/8 bg-white/3 text-[#c8d3df] hover:border-white/16 hover:text-white"
                }`}
              >
                {language.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <h1 className="text-[28px] font-semibold tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#91a0b5]">
            {mode === "login"
              ? "Введи никнейм и пароль, чтобы открыть приложение."
              : "Создай аккаунт с полными данными профиля и паролем."}
          </p>
        </div>

        <form onSubmit={submitAuth} className="space-y-4">
          {mode === "login" ? (
            <>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#b8c4d2]">Никнейм</span>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f8298]" />
                  <input
                    value={loginForm.handle}
                    onChange={(event) => setLoginForm((current) => ({ ...current, handle: event.target.value }))}
                    placeholder="nickname"
                    className="h-14 w-full rounded-[20px] border border-white/8 bg-white/[0.04] pl-11 pr-4 text-white outline-none transition placeholder:text-[#607387] focus:border-primary/50 focus:bg-white/[0.06]"
                    autoComplete="username"
                    required
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#b8c4d2]">Пароль</span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f8298]" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="password"
                    className="h-14 w-full rounded-[20px] border border-white/8 bg-white/[0.04] pl-11 pr-4 text-white outline-none transition placeholder:text-[#607387] focus:border-primary/50 focus:bg-white/[0.06]"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </label>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[#b8c4d2]">Имя</span>
                  <input
                    value={registerForm.firstName}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, firstName: event.target.value }))
                    }
                    className="h-14 rounded-[20px] border border-white/8 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-[#607387] focus:border-primary/50 focus:bg-white/[0.06]"
                    autoComplete="given-name"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[#b8c4d2]">Фамилия</span>
                  <input
                    value={registerForm.lastName}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, lastName: event.target.value }))
                    }
                    className="h-14 rounded-[20px] border border-white/8 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-[#607387] focus:border-primary/50 focus:bg-white/[0.06]"
                    autoComplete="family-name"
                    required
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#b8c4d2]">Никнейм</span>
                <input
                  value={registerForm.handle}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, handle: event.target.value }))}
                  placeholder="nickname"
                  className="h-14 rounded-[20px] border border-white/8 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-[#607387] focus:border-primary/50 focus:bg-white/[0.06]"
                  autoComplete="username"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#b8c4d2]">Дата рождения</span>
                <input
                  type="date"
                  value={registerForm.birthDate}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, birthDate: event.target.value }))
                  }
                  className="h-14 rounded-[20px] border border-white/8 bg-white/[0.04] px-4 text-white outline-none transition focus:border-primary/50 focus:bg-white/[0.06]"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#b8c4d2]">Пароль</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="minimum 6 characters"
                  className="h-14 rounded-[20px] border border-white/8 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-[#607387] focus:border-primary/50 focus:bg-white/[0.06]"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </label>
            </>
          )}

          {error ? (
            <div className="rounded-[18px] border border-[rgba(255,71,102,0.24)] bg-[rgba(255,71,102,0.08)] px-4 py-3 text-sm text-[#ff93a5]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-primary px-5 font-semibold text-slate-950 shadow-[0_16px_44px_rgba(103,232,178,0.2)] transition hover:bg-[#84f0c1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {isLoading ? "Подождите..." : mode === "login" ? "Войти" : "Создать аккаунт"}
            </span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
