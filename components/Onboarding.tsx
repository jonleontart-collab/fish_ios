"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, UserRound } from "lucide-react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";
import { apiPath, withBasePath } from "@/lib/app-paths";
import type { TranslationMap } from "@/lib/i18n";

const translations: TranslationMap<{
  access: string;
  loginTab: string;
  registerTab: string;
  loginTitle: string;
  registerTitle: string;
  loginDescription: string;
  registerDescription: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  firstNameLabel: string;
  firstNamePlaceholder: string;
  lastNameLabel: string;
  lastNamePlaceholder: string;
  birthDateLabel: string;
  submitLogin: string;
  submitRegister: string;
  loading: string;
  genericError: string;
}> = {
  ru: {
    access: "Вход в закрытое рыболовное сообщество",
    loginTab: "Вход",
    registerTab: "Регистрация",
    loginTitle: "Вход в FishFlow",
    registerTitle: "Регистрация в FishFlow",
    loginDescription: "Введи никнейм и пароль, чтобы открыть приложение.",
    registerDescription: "Создай аккаунт с именем, фамилией, датой рождения и паролем.",
    nicknameLabel: "Никнейм",
    nicknamePlaceholder: "nickname",
    passwordLabel: "Пароль",
    passwordPlaceholder: "password",
    firstNameLabel: "Имя",
    firstNamePlaceholder: "Введите имя",
    lastNameLabel: "Фамилия",
    lastNamePlaceholder: "Введите фамилию",
    birthDateLabel: "Дата рождения",
    submitLogin: "Войти",
    submitRegister: "Создать аккаунт",
    loading: "Подождите...",
    genericError: "Не удалось выполнить авторизацию.",
  },
  en: {
    access: "Access to the private fishing community",
    loginTab: "Login",
    registerTab: "Register",
    loginTitle: "Login to FishFlow",
    registerTitle: "Create your FishFlow account",
    loginDescription: "Enter your nickname and password to open the app.",
    registerDescription: "Create an account with your first name, last name, birth date, and password.",
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "nickname",
    passwordLabel: "Password",
    passwordPlaceholder: "password",
    firstNameLabel: "First name",
    firstNamePlaceholder: "Enter first name",
    lastNameLabel: "Last name",
    lastNamePlaceholder: "Enter last name",
    birthDateLabel: "Date of birth",
    submitLogin: "Log in",
    submitRegister: "Create account",
    loading: "Please wait...",
    genericError: "Authorization failed.",
  },
  es: {
    access: "Acceso a la comunidad privada de pesca",
    loginTab: "Entrar",
    registerTab: "Registro",
    loginTitle: "Entrar en FishFlow",
    registerTitle: "Crear cuenta en FishFlow",
    loginDescription: "Introduce tu apodo y contraseña para abrir la aplicación.",
    registerDescription: "Crea una cuenta con nombre, apellido, fecha de nacimiento y contraseña.",
    nicknameLabel: "Apodo",
    nicknamePlaceholder: "nickname",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "password",
    firstNameLabel: "Nombre",
    firstNamePlaceholder: "Introduce el nombre",
    lastNameLabel: "Apellido",
    lastNamePlaceholder: "Introduce el apellido",
    birthDateLabel: "Fecha de nacimiento",
    submitLogin: "Entrar",
    submitRegister: "Crear cuenta",
    loading: "Espera...",
    genericError: "No se pudo autorizar.",
  },
  fr: {
    access: "Accès à la communauté privée de pêche",
    loginTab: "Connexion",
    registerTab: "Inscription",
    loginTitle: "Connexion à FishFlow",
    registerTitle: "Créer un compte FishFlow",
    loginDescription: "Entrez votre pseudo et votre mot de passe pour ouvrir l'application.",
    registerDescription: "Créez un compte avec prénom, nom, date de naissance et mot de passe.",
    nicknameLabel: "Pseudo",
    nicknamePlaceholder: "nickname",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "password",
    firstNameLabel: "Prénom",
    firstNamePlaceholder: "Entrez le prénom",
    lastNameLabel: "Nom",
    lastNamePlaceholder: "Entrez le nom",
    birthDateLabel: "Date de naissance",
    submitLogin: "Se connecter",
    submitRegister: "Créer un compte",
    loading: "Veuillez patienter...",
    genericError: "Échec de l'autorisation.",
  },
  pt: {
    access: "Acesso à comunidade privada de pesca",
    loginTab: "Entrar",
    registerTab: "Cadastro",
    loginTitle: "Entrar no FishFlow",
    registerTitle: "Criar conta no FishFlow",
    loginDescription: "Digite seu apelido e senha para abrir o aplicativo.",
    registerDescription: "Crie uma conta com nome, sobrenome, data de nascimento e senha.",
    nicknameLabel: "Apelido",
    nicknamePlaceholder: "nickname",
    passwordLabel: "Senha",
    passwordPlaceholder: "password",
    firstNameLabel: "Nome",
    firstNamePlaceholder: "Digite o nome",
    lastNameLabel: "Sobrenome",
    lastNamePlaceholder: "Digite o sobrenome",
    birthDateLabel: "Data de nascimento",
    submitLogin: "Entrar",
    submitRegister: "Criar conta",
    loading: "Aguarde...",
    genericError: "Falha na autorização.",
  },
};

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
  const router = useRouter();
  const { lang } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const t = translations[lang];

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
        throw new Error(data?.error ?? t.genericError);
      }

      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.genericError);
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
            <p className="text-sm text-[#93a9c3]">{t.access}</p>
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
            {t.loginTab}
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
            {t.registerTab}
          </button>
        </div>

        <div className="mb-6">
          <LanguageSwitcher />
        </div>

        <div className="mb-5">
          <h1 className="text-[28px] font-semibold tracking-tight text-white">
            {mode === "login" ? t.loginTitle : t.registerTitle}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#91a0b5]">
            {mode === "login" ? t.loginDescription : t.registerDescription}
          </p>
        </div>

        <form onSubmit={submitAuth} className="space-y-4">
          {mode === "login" ? (
            <>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#b8c4d2]">{t.nicknameLabel}</span>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f8298]" />
                  <input
                    value={loginForm.handle}
                    onChange={(event) => setLoginForm((current) => ({ ...current, handle: event.target.value }))}
                    placeholder={t.nicknamePlaceholder}
                    className="h-14 w-full rounded-[20px] border border-white/8 bg-white/[0.04] pl-11 pr-4 text-white outline-none transition placeholder:text-[#607387] focus:border-primary/50 focus:bg-white/[0.06]"
                    autoComplete="username"
                    required
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#b8c4d2]">{t.passwordLabel}</span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f8298]" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder={t.passwordPlaceholder}
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
                  <span className="text-sm font-medium text-[#b8c4d2]">{t.firstNameLabel}</span>
                  <input
                    value={registerForm.firstName}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, firstName: event.target.value }))
                    }
                    placeholder={t.firstNamePlaceholder}
                    className="h-14 rounded-[20px] border border-white/8 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-[#607387] focus:border-primary/50 focus:bg-white/[0.06]"
                    autoComplete="given-name"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[#b8c4d2]">{t.lastNameLabel}</span>
                  <input
                    value={registerForm.lastName}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, lastName: event.target.value }))
                    }
                    placeholder={t.lastNamePlaceholder}
                    className="h-14 rounded-[20px] border border-white/8 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-[#607387] focus:border-primary/50 focus:bg-white/[0.06]"
                    autoComplete="family-name"
                    required
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#b8c4d2]">{t.nicknameLabel}</span>
                <input
                  value={registerForm.handle}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, handle: event.target.value }))}
                  placeholder={t.nicknamePlaceholder}
                  className="h-14 rounded-[20px] border border-white/8 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-[#607387] focus:border-primary/50 focus:bg-white/[0.06]"
                  autoComplete="username"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#b8c4d2]">{t.birthDateLabel}</span>
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
                <span className="text-sm font-medium text-[#b8c4d2]">{t.passwordLabel}</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder={t.passwordPlaceholder}
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
            <span>{isLoading ? t.loading : mode === "login" ? t.submitLogin : t.submitRegister}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
