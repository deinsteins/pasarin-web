import React, { useState, InputHTMLAttributes, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  prefixText?: string;
  prefixFlag?: string;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon: Icon,
      type = "text",
      prefixText,
      prefixFlag,
      rightElement,
      className = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    // Calculate left padding dynamically based on icon or prefix presence
    let paddingLeftClass = "pl-4";
    if (prefixText) {
      paddingLeftClass = "pl-[4.5rem]";
    } else if (Icon) {
      paddingLeftClass = "pl-11";
    }

    // Calculate right padding
    const paddingRightClass = isPassword || rightElement ? "pr-12" : "pr-4";

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {/* Prefix (e.g. Phone prefix with flag) */}
          {prefixText && (
            <div className="absolute left-3.5 flex items-center gap-1.5 text-zinc-500 pointer-events-none text-sm font-medium">
              {prefixFlag && <span className="text-base leading-none">{prefixFlag}</span>}
              <span className="text-xs font-semibold text-zinc-400">{prefixText}</span>
            </div>
          )}

          {/* Left Icon (only shown if prefix is not present) */}
          {!prefixText && Icon && (
            <div className="absolute left-3.5 text-zinc-400 pointer-events-none dark:text-zinc-500">
              <Icon className="h-[18px] w-[18px] stroke-[1.75]" />
            </div>
          )}

          <input
            ref={ref}
            type={currentType}
            className={`w-full rounded-soft-md border border-zinc-200 bg-white py-3 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-transparent focus:ring-2 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-650 dark:hover:border-zinc-700 dark:focus:ring-brand-primary-600 ${paddingLeftClass} ${paddingRightClass} ${
              error
                ? "border-red-450 hover:border-red-450 focus:ring-red-400 dark:border-red-500/80 dark:hover:border-red-500/80 dark:focus:ring-red-500"
                : ""
            } ${className}`}
            {...props}
          />

          {/* Right side Elements */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 stroke-[1.75]" />
              ) : (
                <Eye className="h-5 w-5 stroke-[1.75]" />
              )}
            </button>
          )}

          {!isPassword && rightElement && (
            <div className="absolute right-3.5 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs font-semibold text-red-500 dark:text-red-400 mt-1 pl-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
