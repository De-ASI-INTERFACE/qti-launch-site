/**
 * ToastProvider — lightweight global toast system.
 * Used by useGuardedSwap to surface simulation errors and tx confirmations
 * without pulling in a heavy toast library.
 *
 * RP-DEASI-JUP-2026-0619-001
 */

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id:      string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts:    Toast[];
  addToast:  (message: string, variant: ToastVariant) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6_000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastStack toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-green-900 border-green-500 text-green-100",
  error:   "bg-red-900   border-red-500   text-red-100",
  warning: "bg-yellow-900 border-yellow-500 text-yellow-100",
  info:    "bg-blue-900  border-blue-500  text-blue-100",
};

function ToastStack({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm
            ${VARIANT_STYLES[t.variant]}`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
