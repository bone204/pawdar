"use client";

import React, { useState } from "react";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Eye icons for password toggle
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

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
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);

    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    const passwordToggle = isPassword ? (
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-4 text-muted hover:text-foreground transition-colors duration-200 flex items-center justify-center select-none"
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    ) : null;

    const hasRightSlot = isPassword || !!rightIcon;

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
            type={resolvedType}
            className={`w-full px-4 py-3 bg-input border ${
              error
                ? "border-danger focus:ring-danger/20"
                : "border-border focus:border-primary focus:ring-primary/20"
            } ${leftIcon ? "pl-11" : ""} ${
              hasRightSlot ? "pr-11" : ""
            } text-foreground rounded-xl transition-all duration-300 outline-none focus:ring-4`}
            {...props}
          />

          {/* Password toggle takes priority over rightIcon for password fields */}
          {isPassword ? passwordToggle : rightIcon && (
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
