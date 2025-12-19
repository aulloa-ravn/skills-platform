import React, { useEffect, useState } from 'react';
import type { ToastVariant } from '../contexts/ToastNotificationContext';

interface ToastNotificationProps {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
  onRemove: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  title,
  message,
  variant,
  onRemove,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger slide-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Variant-based styling
  const variantStyles = {
    success:
      'bg-green-500/10 border-green-500/30 text-green-300 backdrop-blur-md',
    error: 'bg-red-500/10 border-red-500/30 text-red-300 backdrop-blur-md',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300 backdrop-blur-md',
    warning:
      'bg-yellow-500/10 border-yellow-500/30 text-yellow-300 backdrop-blur-md',
  };

  const iconStyles = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    warning: 'text-yellow-400',
  };

  const icons = {
    success: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    error: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    info: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`
        ${variantStyles[variant]}
        pointer-events-auto
        min-w-[320px] max-w-md
        rounded-lg border
        p-4
        shadow-xl
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconStyles[variant]}`}>
          {icons[variant]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs opacity-90 break-words">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
