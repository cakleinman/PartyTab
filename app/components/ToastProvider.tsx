"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Toast = {
  id: string;
  message: string;
};

type ToastContextValue = {
  pushToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white/95 px-4 py-3 text-sm text-ink-700 shadow-md backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="flex-1 break-words leading-tight">{toast.message}</span>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 text-xs font-semibold text-ink-500 hover:text-ink-700 pt-0.5"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-12 left-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:w-full sm:max-w-sm">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
