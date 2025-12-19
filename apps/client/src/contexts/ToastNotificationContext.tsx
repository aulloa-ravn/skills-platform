import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import ToastNotification from '../components/ToastNotification';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
  timestamp: number;
}

export interface ToastOptions {
  title: string;
  message: string;
  variant: ToastVariant;
}

interface ToastNotificationContextValue {
  toasts: Toast[];
  addToast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastNotificationContext = createContext<
  ToastNotificationContextValue | undefined
>(undefined);

/**
 * ToastNotificationProvider component for managing toast notifications
 */
export const ToastNotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Add a new toast notification
   * Automatically removes toast after 4 seconds
   */
  const addToast = useCallback((options: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: Toast = {
      id,
      ...options,
      timestamp: Date.now(),
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  /**
   * Remove a toast notification by id
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value: ToastNotificationContextValue = {
    toasts,
    addToast,
    removeToast,
  };

  return (
    <ToastNotificationContext.Provider value={value}>
      {children}
      {/* Render toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            id={toast.id}
            title={toast.title}
            message={toast.message}
            variant={toast.variant}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastNotificationContext.Provider>
  );
};

/**
 * Hook to access toast notification context
 * @throws Error if used outside ToastNotificationProvider
 */
export const useToast = (): ToastNotificationContextValue => {
  const context = useContext(ToastNotificationContext);
  if (context === undefined) {
    throw new Error(
      'useToast must be used within a ToastNotificationProvider'
    );
  }
  return context;
};
