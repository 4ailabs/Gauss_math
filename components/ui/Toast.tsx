import React, { useState, useEffect } from 'react';
import { CheckIcon, AlertCircleIcon, XIcon } from './Icons';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <CheckIcon className="w-5 h-5 text-green-500" />,
          text: 'text-green-800',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: <AlertCircleIcon className="w-5 h-5 text-red-500" />,
          text: 'text-red-800',
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: <div className="w-5 h-5 bg-blue-500 rounded-full" />,
          text: 'text-blue-800',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${styles.bg} border rounded-lg p-4 shadow-lg`}>
        <div className="flex items-start gap-3">
          {styles.icon}
          <div className="flex-1">
            <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast container for managing multiple toasts
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
  }>;
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemoveToast,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
};