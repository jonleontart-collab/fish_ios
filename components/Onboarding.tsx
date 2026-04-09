"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe2, KeyRound, ShieldCheck, UserRound } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { apiPath, withBasePath } from "@/lib/app-paths";
import { languageOptions, type TranslationMap } from "@/lib/i18n";

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
  languageLabel: string;
  termsLabel: string;
  termsLink: string;
  submitLogin: string;
  submitRegister: string;
  loading: string;
  genericError: string;
}> = {
  ru: {
    access: "Закрытое сообщество рыбаков, карты, чаты и умные выезды",
    loginTab: "Вход",
    registerTab: "Регистрация",
    loginTitle: "Вход в FishFlow",
    registerTitle: "Создать аккаунт",
    loginDescription: "Введи никнейм и пароль, чтобы открыть приложение.",
    registerDescription: "Создай профиль с настоящим именем, датой рождения и доступом к своим местам, чатам и выездам.",
    nicknameLabel: "Никнейм",
    nicknamePlaceholder: "nickname",
    passwordLabel: "Пароль",
    passwordPlaceholder: "password",
    firstNameLabel: "Имя",
    firstNamePlaceholder: "Введите имя",
    lastNameLabel: "Фамилия",
    lastNamePlaceholder: "Введите фамилию",
    birthDateLabel: "Дата рождения",
    languageLabel: "Язык",
    termsLabel: "Я принимаю",
    termsLink: "условия сервиса и политику данных",
    submitLogin: "Войти",
    submitRegister: "Создать аккаунт",
    loading: "Подождите...",
    genericError: "Не удалось выполнить авторизацию.",
  },
  en: {
    access: "Private angler community with maps, chats, and smarter trips",
    loginTab: "Login",
    registerTab: "Register",
    loginTitle: "Login to FishFlow",
    registerTitle: "Create your account",
    loginDescription: "Enter your nickname and password to open the app.",
    registerDescription: "Create a real profile with your name, date of birth, and access to places, chats, and trips.",
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "nickname",
    passwordLabel: "Password",
    passwordPlaceholder: "password",
    firstNameLabel: "First name",
    firstNamePlaceholder: "Enter first name",
    lastNameLabel: "Last name",
    lastNamePlaceholder: "Enter last name",
    birthDateLabel: "Date of birth",
    languageLabel: "Language",
    termsLabel: "I accept the",
    termsLink: "Terms and Privacy Notice",
    submitLogin: "Log in",
    submitRegister: "Create account",
    loading: "Please wait...",
    genericError: "Authorization failed.",
  },
  es: {
    access: "Comunidad privada de pesca con mapas, chats y salidas más inteligentes",
    loginTab: "Entrar",
    registerTab: "Registro",
    loginTitle: "Entrar en FishFlow",
    registerTitle: "Crear cuenta",
    loginDescription: "Introduce tu apodo y contraseña para abrir la aplicación.",
    registerDescription: "Crea un perfil real con tu nombre, fecha de nacimiento y acceso a lugares, chats y salidas.",
    nicknameLabel: "Apodo",
    nicknamePlaceholder: "nickname",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "password",
    firstNameLabel: "Nombre",
    firstNamePlaceholder: "Introduce el nombre",
    lastNameLabel: "Apellido",
    lastNamePlaceholder: "Introduce el apellido",
    birthDateLabel: "Fecha de nacimiento",
    languageLabel: "Idioma",
    termsLabel: "Acepto los",
    termsLink: "Términos y el aviso de privacidad",
    submitLogin: "Entrar",
    submitRegister: "Crear cuenta",
    loading: "Espera...",
    genericError: "No se pudo autorizar.",
  },
  fr: {
    access: "Communauté privée de pêche avec cartes, chats et sorties plus intelligentes",
    loginTab: "Connexion",
    registerTab: "Inscription",
    loginTitle: "Connexion à FishFlow",
    registerTitle: "Créer un compte",
    loginDescription: "Entrez votre pseudo et votre mot de passe pour ouvrir l'application.",
    registerDescription: "Créez un vrai profil avec votre nom, votre date de naissance et l’accès aux spots, chats et sorties.",
    nicknameLabel: "Pseudo",
    nicknamePlaceholder: "nickname",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "password",
    firstNameLabel: "Prénom",
    firstNamePlaceholder: "Entrez le prénom",
    lastNameLabel: "Nom",
    lastNamePlaceholder: "Entrez le nom",
    birthDateLabel: "Date de naissance",
    languageLabel: "Langue",
    termsLabel: "J’accepte les",
    termsLink: "Conditions et la notice de confidentialité",
    submitLogin: "Se connecter",
    submitRegister: "Créer un compte",
    loading: "Veuillez patienter...",
    genericError: "Échec de l'autorisation.",
  },
  pt: {
    access: "Comunidade privada de pesca com mapas, chats e saídas mais inteligentes",
    loginTab: "Entrar",
    registerTab: "Cadastro",
    loginTitle: "Entrar no FishFlow",
    registerTitle: "Criar conta",
    loginDescription: "Digite seu apelido e senha para abrir o aplicativo.",
    registerDescription: "Crie um perfil real com seu nome, data de nascimento e acesso a locais, chats e viagens.",
    nicknameLabel: "Apelido",
    nicknamePlaceholder: "nickname",
    passwordLabel: "Senha",
    passwordPlaceholder: "password",
    firstNameLabel: "Nome",
    firstNamePlaceholder: "Digite o nome",
    lastNameLabel: "Sobrenome",
    lastNamePlaceholder: "Digite o sobrenome",
    birthDateLabel: "Data de nascimento",
    languageLabel: "Idioma",
    termsLabel: "Aceito os",
    termsLink: "Termos e o aviso de privacidade",
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
  acceptedTerms: false,
};

const initialLoginState = {
  handle: "",
  password: "",
};

export default function Onboarding() {
  const router = useRouter();
  const { lang, setLanguage } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const t = translations[lang];

  const maxBirthDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 13);
    return date.toISOString().slice(0, 10);
  }, []);

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
          <Image
            src={withBasePath("/graphics/hero-main-river.png")}
            alt=""
            fill
            className="object-cover mix-blend-screen"
            priority
          />
        </div>
      </div>

      <div className="w-full max-w-md rounded-[36px] border border-white/8 bg-[rgba(4,10,16,0.82)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
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
              <p className="max-w-[15rem] text-sm text-[#93a9c3]">{t.access}</p>
            </div>
          </div>

          <label className="grid gap-1 text-right">
            <span className="inline-flex items-center justify-end gap-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#93a9c3]">
              <Globe2 size={13} />
              {t.languageLabel}
            </span>
            <select
              value={lang}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm font-semibold text-white outline-none transition hover:bg-white/10"
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code} className="bg-[#07111c] text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
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
                  max={maxBirthDate}
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

              <label className="flex items-start gap-3 rounded-[20px] border border-white/8 bg-white/[0.04] px-4 py-4">
                <input
                  type="checkbox"
                  checked={registerForm.acceptedTerms}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, acceptedTerms: event.target.checked }))
                  }
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-primary"
                  required
                />
                <span className="text-sm leading-6 text-[#b8c4d2]">
                  {t.termsLabel}{" "}
                  <a
                    href={withBasePath("/legal/terms-and-privacy.html")}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {t.termsLink}
                  </a>
                  .
                </span>
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

        <a
          href={withBasePath("/legal/terms-and-privacy.html")}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex items-center gap-2 text-xs text-[#92a7bf] transition hover:text-white"
        >
          <ShieldCheck size={14} className="text-primary" />
          <span>{t.termsLink}</span>
        </a>
      </div>
    </div>
  );
}
