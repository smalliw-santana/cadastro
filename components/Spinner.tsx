import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'primary' | 'white' | 'slate' | 'indigo';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '', variant = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
    slate: 'text-slate-400',
    indigo: 'text-red-600' // Mapping indigo to red for backward compatibility with theme change
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[variant]} ${className}`} 
    />
  );
};
