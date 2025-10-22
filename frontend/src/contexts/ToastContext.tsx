import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface ToastMessage {
  id: number;
  title?: string;
  description?: string;
  variant: 'default' | 'success' | 'error' | 'warning';
  duration: number;
}

interface ShowToastOptions {
  title?: string;
  variant?: ToastMessage['variant'];
  duration?: number;
}

interface ToastContextData {
  showToast: (description: string, options?: ShowToastOptions) => void;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<ToastMessage['variant'], string> = {
  default: 'bg-slate-900/95 text-white border border-slate-800 shadow-lg shadow-slate-900/30',
  success: 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30',
  error: 'bg-red-600 text-white shadow-lg shadow-red-900/30',
  warning: 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-900/25',
};

type ActiveTimeout = { id: number; timeout: number };

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeoutsRef = React.useRef<ActiveTimeout[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeoutIndex = timeoutsRef.current.findIndex((item) => item.id === id);
    if (timeoutIndex >= 0) {
      window.clearTimeout(timeoutsRef.current[timeoutIndex].timeout);
      timeoutsRef.current.splice(timeoutIndex, 1);
    }
  }, []);

  const scheduleRemoval = useCallback((toast: ToastMessage) => {
    const timeout = window.setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);

    timeoutsRef.current.push({ id: toast.id, timeout });
  }, [removeToast]);

  const showToast = useCallback<ToastContextData['showToast']>((description, options) => {
    const toast: ToastMessage = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      description,
      title: options?.title,
      variant: options?.variant ?? 'default',
      duration: options?.duration ?? 4000,
    };

    setToasts((current) => [...current, toast]);
    scheduleRemoval(toast);
  }, [scheduleRemoval]);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed top-[calc(64px+1.5rem)] right-6 z-[9999] flex max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex flex-col gap-1 rounded-xl px-4 py-3 text-sm shadow-lg transition-all duration-200 ${VARIANT_STYLES[toast.variant]}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {toast.title && <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{toast.title}</p>}
                <p className="font-medium leading-relaxed">{toast.description}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:text-white"
              >
                fechar
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextData {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast precisa ser usado dentro de um ToastProvider');
  }
  return context;
}
