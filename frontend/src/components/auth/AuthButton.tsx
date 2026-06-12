import React, { ButtonHTMLAttributes } from "react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function AuthButton({ children, isLoading, className = "", ...props }: AuthButtonProps) {
  return (
    <button
      disabled={isLoading || props.disabled}
      className={`relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 px-4 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin text-white"
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
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
