import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  icon,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-95";
  
  const variants = {
    primary: "bg-rose-500 hover:bg-rose-600 text-white disabled:bg-rose-300",
    secondary: "bg-slate-800 hover:bg-slate-900 text-white disabled:bg-slate-600",
    outline: "border-2 border-slate-200 hover:border-rose-500 hover:text-rose-500 text-slate-600 bg-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <i className="fas fa-circle-notch fa-spin"></i>
      ) : icon ? (
        <i className={`fas ${icon}`}></i>
      ) : null}
      {children}
    </button>
  );
};