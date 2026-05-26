"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center justify-center font-bold tracking-wide rounded-2xl select-none cursor-pointer transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-primary/25 disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:brightness-105 active:brightness-95 hover:shadow-[0_6px_16px_rgba(201,109,46,0.2)] dark:hover:shadow-[0_6px_16px_rgba(234,168,94,0.25)] border border-primary/10",
    secondary: "border-2 border-primary bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
