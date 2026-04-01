import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({ label, error, fullWidth, className, icon: Icon, ...props }) => {
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none
            ${error ? 'border-red-500' : 'border-slate-300'}
            ${Icon ? 'pl-10' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};