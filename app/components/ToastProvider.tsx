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
    <div className="pointer-events-auto w-full max-w-xs animate-fade-in-up rounded-2xl border border-sand-200 bg-white p-4 text-center shadow-xl ring-1 ring-ink-900/5 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-medium text-ink-900 break-words">{toast.message}</span>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-full bg-sand-100 px-4 py-1.5 text-xs font-semibold text-ink-700 hover:bg-sand-200"
        >
          Okay
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
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 pointer-events-none p-6 bg-black/5 backdrop-blur-[1px]">
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
