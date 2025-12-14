"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// =============================================================================
// TYPY
// =============================================================================

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// =============================================================================
// PROVIDER
// =============================================================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: "success", title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: "error", title, message });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: "warning", title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: "info", title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// =============================================================================
// TOAST CONTAINER
// =============================================================================

const ICONS: Record<ToastType, string> = {
  success: "fa-check-circle",
  error: "fa-times-circle",
  warning: "fa-exclamation-triangle",
  info: "fa-info-circle",
};

function ToastContainer({ 
  toasts, 
  onRemove 
}: { 
  toasts: Toast[]; 
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => onRemove(toast.id)}
        >
          <div className="shrink-0">
            <i className={`fas ${ICONS[toast.type]} text-xl`} aria-hidden="true"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{toast.title}</p>
            {toast.message && (
              <p className="text-sm opacity-90 mt-0.5">{toast.message}</p>
            )}
          </div>
          <button 
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(toast.id);
            }}
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastProvider;
