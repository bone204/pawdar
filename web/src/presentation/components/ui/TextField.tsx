"use client";

import React from "react";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// forwardRef is required for react-hook-form register() to attach ref correctly
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      className = "",
      id,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-foreground/80 tracking-wide uppercase select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-4 text-muted pointer-events-none select-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            className={`w-full px-4 py-3 bg-input border ${
              error
                ? "border-danger focus:ring-danger/20"
                : "border-border focus:border-primary focus:ring-primary/20"
            } ${leftIcon ? "pl-11" : ""} ${
              rightIcon ? "pr-11" : ""
            } text-foreground rounded-xl transition-all duration-300 outline-none focus:ring-4`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 text-muted flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <span className="text-xs text-danger font-medium select-none animate-pulse">
            {error}
          </span>
        )}
      </div>
    );
  },
);

TextField.displayName = "TextField";
