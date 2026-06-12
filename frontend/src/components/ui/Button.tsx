import React, { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "pill";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "relative inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2";

    // Variant styles
    const variants = {
      primary:
        "bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 text-white shadow-soft-md hover:from-brand-primary-600 hover:to-brand-primary-700 hover:shadow-soft-lg focus:ring-brand-primary-500 focus:ring-offset-2 dark:focus:ring-brand-primary-400",
      secondary:
        "bg-gradient-to-r from-brand-secondary-500 to-brand-secondary-600 text-white shadow-soft-md hover:from-brand-secondary-600 hover:to-brand-secondary-700 hover:shadow-soft-lg focus:ring-brand-secondary-500 focus:ring-offset-2 dark:focus:ring-brand-secondary-400",
      outline:
        "border border-zinc-200 bg-white text-zinc-700 shadow-soft-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-350 dark:hover:bg-zinc-900 focus:ring-zinc-400",
      ghost:
        "text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white focus:ring-zinc-400",
      pill:
        "rounded-full bg-brand-primary-50 text-brand-primary-700 hover:bg-brand-primary-100 dark:bg-brand-primary-950/40 dark:text-brand-primary-400 dark:hover:bg-brand-primary-950/60 focus:ring-brand-primary-500",
    };

    // Size styles
    const sizes = {
      sm: "py-2 px-3 text-xs",
      md: "py-3 px-5 text-sm",
      lg: "py-4 px-6 text-base",
    };

    // Border radius system - pill has its own, otherwise use soft system
    const radius = variant === "pill" ? "" : "rounded-soft-md";

    const variantClass = variants[variant];
    const sizeClass = sizes[size];

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`${baseStyles} ${variantClass} ${sizeClass} ${radius} ${className}`}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin text-currentColor"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Memproses...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
