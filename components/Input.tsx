import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, fullWidth, className, ...props }) => {
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        className={`
          w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none
          ${error ? 'border-red-500' : 'border-slate-300'}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};