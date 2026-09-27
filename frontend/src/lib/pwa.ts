import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

/** Call once at startup: the install event can fire before React mounts. */
export function initPwa() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((l) => l());
  });

  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    // An installed PWA can sit open on a phone's home screen for days, so it can end up
    // stuck running whatever JS bundle happened to be cached whenever it was last force-quit
    // and relaunched — a newer service worker installing in the background does not, by
    // itself, do anything to a page that is already open. That's what caused the logo/chart
    // label to look "random": some opens were landing on an old cached build, others on the
    // current one, with no way to tell which. Reload once, automatically, the moment a new
    // service worker actually takes over this page, so every open ends up on the same build.
    let reloaded = false;
    let hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      // The very first activation (no previous controller) is just this tab adopting the
      // service worker for the first time, not an update — nothing to refresh for yet.
      if (!hadController) {
        hadController = true;
        return;
      }
      reloaded = true;
      window.location.reload();
    });

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        // Browsers only check for a new sw.js on their own schedule (Chrome: at most once a
        // day; iOS standalone apps are even less predictable). Check explicitly whenever the
        // app is opened or brought back to the foreground, so an update is picked up the same
        // day it ships rather than whenever the platform gets around to it.
        const check = () => reg.update().catch(() => {});
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") check();
        });
        window.addEventListener("focus", check);
      }).catch(() => {});
    });
  }
}

export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function useInstall() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);

  return {
    installed: isStandalone(),
    canPrompt: !!deferredPrompt,
    ios: isIos(),
    async prompt() {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      listeners.forEach((l) => l());
    },
  };
}
