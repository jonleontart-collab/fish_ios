"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import { withBasePath } from "@/lib/app-paths";

type ToastTone = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastItem = ToastInput & {
  id: string;
};

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<
  ToastTone,
  {
    icon: typeof CheckCircle2;
    iconClassName: string;
    ringClassName: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClassName: "text-primary",
    ringClassName: "border-primary/20",
  },
  error: {
    icon: AlertCircle,
    iconClassName: "text-danger",
    ringClassName: "border-danger/20",
  },
  info: {
    icon: Info,
    iconClassName: "text-accent",
    ringClassName: "border-accent/20",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const nextToastIdRef = useRef(0);

  function removeToast(id: string) {
    const timeout = timeoutsRef.current[id];
    if (timeout) {
      clearTimeout(timeout);
      delete timeoutsRef.current[id];
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function pushToast({ tone = "info", ...toast }: ToastInput) {
    nextToastIdRef.current += 1;
    const id = `toast-${nextToastIdRef.current}`;
    const nextToast = { id, tone, ...toast };

    setToasts((current) => [nextToast, ...current].slice(0, 4));

    timeoutsRef.current[id] = setTimeout(() => {
      removeToast(id);
    }, 3600);
  }

  useEffect(() => {
    const timeouts = timeoutsRef.current;

    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-0 z-[1400] mx-auto flex w-full max-w-md flex-col gap-3 px-4 pt-safe">
        {toasts.map((toast) => {
          const tone = toast.tone ?? "info";
          const Icon = toneStyles[tone].icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto overflow-hidden rounded-[24px] border bg-[#08111a] shadow-[0_18px_48px_rgba(0,0,0,0.42)] backdrop-blur-2xl animate-in slide-in-from-top-3 ${toneStyles[tone].ringClassName}`}
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(3, 7, 12, 0.72), rgba(3, 7, 12, 0.94)), url('${withBasePath("/modal-backgrounds/notification-center-bg.png")}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="flex items-start gap-3 px-4 py-4">
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/6 ${toneStyles[tone].iconClassName}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">{toast.title}</div>
                  {toast.description ? (
                    <div className="mt-1 text-sm leading-5 text-text-muted">{toast.description}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6 text-text-muted transition hover:text-white"
                  aria-label="Close notification"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
