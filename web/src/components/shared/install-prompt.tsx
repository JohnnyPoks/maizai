"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "maizai-install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-xl border border-brand-200 bg-white p-4 shadow-xl sm:left-auto sm:right-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
          <Download size={18} className="text-brand-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-brand-900">Install MaizAI</p>
          <p className="mt-0.5 text-xs text-earth-600">
            Add it to your home screen for quick, app-like access.
          </p>
          <div className="mt-3 flex gap-2">
            <Button onClick={install} className="h-8 bg-brand-500 px-3 text-xs text-white hover:bg-brand-600">
              Install
            </Button>
            <Button onClick={dismiss} variant="outline" className="h-8 border-earth-200 px-3 text-xs text-earth-600">
              Not now
            </Button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="text-earth-400 hover:text-earth-600">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
