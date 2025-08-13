import React from 'react';
import { LoaderCircleIcon } from './Icons';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LoaderCircleIcon className={`${sizeClasses[size]} animate-spin text-teal-600`} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
    <div className="space-y-4">
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <LoadingSkeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <LoadingSkeleton className="h-8 w-20" />
        <LoadingSkeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
);