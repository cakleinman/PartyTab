"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Check if app is installed in standalone mode
function subscribeToStandalone(callback: () => void) {
  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getStandaloneSnapshot() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

function getStandaloneServerSnapshot() {
  return false;
}

// Check if iOS device - static value that doesn't change
function subscribeToIOS() {
  // iOS detection doesn't change, no need to subscribe
  return () => {};
}

function getIOSSnapshot() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function getIOSServerSnapshot() {
  return false;
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const isStandalone = useSyncExternalStore(
    subscribeToStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  );
  const isIOS = useSyncExternalStore(
    subscribeToIOS,
    getIOSSnapshot,
    getIOSServerSnapshot
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Derive installed state from standalone mode
  const installed = isStandalone || isInstalled;

  useEffect(() => {
    // Listen for install prompt (Android/Desktop Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  // Already installed
  if (installed) {
    return null;
  }

  // iOS - show manual instructions
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSInstructions(true)}
          className="flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 text-sm font-medium hover:bg-sand-50 transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Install App
        </button>

        {showIOSInstructions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Install PartyTab</h2>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="rounded-full p-2 hover:bg-sand-100"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 text-sm text-ink-600">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-white text-xs font-medium">1</span>
                  <p>
                    Tap the <strong>Share</strong> button{" "}
                    <svg className="inline h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>{" "}
                    at the bottom of Safari
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-white text-xs font-medium">2</span>
                  <p>
                    Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-white text-xs font-medium">3</span>
                  <p>
                    Tap <strong>&quot;Add&quot;</strong> in the top right corner
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Android/Desktop - show native install button
  if (deferredPrompt) {
    return (
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 text-sm font-medium hover:bg-sand-50 transition"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Install App
      </button>
    );
  }

  // Not installable (desktop browser without support, or already dismissed)
  return null;
}
