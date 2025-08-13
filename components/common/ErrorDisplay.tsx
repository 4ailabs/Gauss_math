import React from 'react';
import { AlertCircleIcon, XIcon } from '../ui/Icons';

interface ErrorDisplayProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onDismiss,
  className = '',
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mt-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-900 mb-1">Error</h4>
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};