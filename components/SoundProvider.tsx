"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";

import { withBasePath } from "@/lib/app-paths";

type SoundContextValue = {
  playClick: () => void;
  playMessage: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

function canHandleClickSound(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.closest("[data-sound='off']")) {
    return false;
  }

  return Boolean(
    target.closest(
      "button, a, summary, label, [role='button'], [data-sound='click'], input[type='checkbox'], input[type='radio']",
    ),
  );
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const messageAudioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    clickAudioRef.current = new Audio(withBasePath("/sound/click.mp3"));
    clickAudioRef.current.preload = "auto";
    clickAudioRef.current.volume = 0.45;

    messageAudioRef.current = new Audio(withBasePath("/sound/massege.mp3"));
    messageAudioRef.current.preload = "auto";
    messageAudioRef.current.volume = 0.7;

    return () => {
      clickAudioRef.current = null;
      messageAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      unlockedRef.current = true;

      if (!canHandleClickSound(event.target)) {
        return;
      }

      const audio = clickAudioRef.current;
      if (!audio) {
        return;
      }

      audio.currentTime = 0;
      void audio.play().catch(() => {});
    }

    function handleKeyDown() {
      unlockedRef.current = true;
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  const value = useMemo<SoundContextValue>(
    () => ({
      playClick() {
        const audio = clickAudioRef.current;
        if (!audio) {
          return;
        }

        audio.currentTime = 0;
        void audio.play().catch(() => {});
      },
      playMessage() {
        if (!unlockedRef.current) {
          return;
        }

        const audio = messageAudioRef.current;
        if (!audio) {
          return;
        }

        audio.currentTime = 0;
        void audio.play().catch(() => {});
      },
    }),
    [],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error("useSound must be used inside SoundProvider.");
  }

  return context;
}
