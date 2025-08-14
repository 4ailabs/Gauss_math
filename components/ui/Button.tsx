import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircleIcon } from './Icons';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-600 disabled:bg-slate-400',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-500 disabled:bg-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    ghost: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? 'cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <LoaderCircleIcon className="w-4 h-4 animate-spin" />
      ) : icon && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};