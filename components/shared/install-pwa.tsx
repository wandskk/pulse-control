"use client";

import { Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function usePwaInstallOffer() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const mq = window.matchMedia("(display-mode: standalone)");
    const onChange = () => setInstalled(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (installed) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [installed]);

  const runInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }, [deferred]);

  const showIosHint = useCallback(() => {
    toast.info(
      "No Safari: toque em Partilhar (□↑) e depois «Adicionar ao ecrã principal».",
      { duration: 8000 },
    );
  }, []);

  const showAndroidHint = useCallback(() => {
    toast.info(
      "No Chrome: menu (⋮) → «Instalar aplicação» ou «Adicionar à página inicial». Noutros browsers, use o menu e procure «Instalar» ou «Adicionar ao ecrã principal».",
      { duration: 10000 },
    );
  }, []);

  return {
    installed,
    canPrompt: Boolean(deferred),
    runInstall,
    iosManual: !deferred && isIOS(),
    androidManual: !deferred && isAndroid(),
    showIosHint,
    showAndroidHint,
  };
}

/** Item de menu (mesmo estilo dos links do sheet do header). */
export function InstallPwaMenuItem({
  onAfterPick,
}: {
  onAfterPick?: () => void;
}) {
  const {
    installed,
    canPrompt,
    runInstall,
    iosManual,
    androidManual,
    showIosHint,
    showAndroidHint,
  } = usePwaInstallOffer();

  if (installed) return null;

  if (canPrompt) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="h-11 justify-start gap-3 px-0 font-normal"
        onClick={() => {
          onAfterPick?.();
          void runInstall();
        }}
      >
        <Download className="size-4 shrink-0" aria-hidden />
        Instalar app
      </Button>
    );
  }

  if (iosManual) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="h-11 justify-start gap-3 px-0 font-normal"
        onClick={() => {
          onAfterPick?.();
          showIosHint();
        }}
      >
        <Download className="size-4 shrink-0" aria-hidden />
        Como instalar no iPhone
      </Button>
    );
  }

  if (androidManual) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="h-11 justify-start gap-3 px-0 font-normal"
        onClick={() => {
          onAfterPick?.();
          showAndroidHint();
        }}
      >
        <Download className="size-4 shrink-0" aria-hidden />
        Como instalar no Android
      </Button>
    );
  }

  return null;
}

/** Linha discreta no login: prompt nativo, dica iOS ou dica Android (UA). */
export function InstallPwaLoginHint({ className }: { className?: string }) {
  const {
    installed,
    canPrompt,
    runInstall,
    iosManual,
    androidManual,
    showIosHint,
    showAndroidHint,
  } = usePwaInstallOffer();

  if (installed) return null;

  if (canPrompt) {
    return (
      <p className={cn("text-center text-sm text-muted-foreground", className)}>
        <button
          type="button"
          className="font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => void runInstall()}
        >
          Instalar como app
        </button>
      </p>
    );
  }

  if (iosManual) {
    return (
      <p className={cn("text-center text-sm text-muted-foreground", className)}>
        <button
          type="button"
          className="font-medium text-primary underline-offset-4 hover:underline"
          onClick={showIosHint}
        >
          Como instalar no ecrã principal
        </button>
      </p>
    );
  }

  if (androidManual) {
    return (
      <p className={cn("text-center text-sm text-muted-foreground", className)}>
        <button
          type="button"
          className="font-medium text-primary underline-offset-4 hover:underline"
          onClick={showAndroidHint}
        >
          Como instalar no Android
        </button>
      </p>
    );
  }

  return null;
}
