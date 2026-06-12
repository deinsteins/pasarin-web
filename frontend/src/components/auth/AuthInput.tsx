import React, { useState, InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon: Icon, type = "text", className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 text-zinc-400 pointer-events-none dark:text-zinc-500">
              <Icon className="h-[18px] w-[18px] stroke-[1.75]" />
            </div>
          )}
          <input
            ref={ref}
            type={currentType}
            className={`w-full rounded-xl border border-zinc-200 bg-white py-3 pr-4 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600 dark:hover:border-zinc-700 dark:focus:ring-indigo-600 ${
              Icon ? "pl-11" : "pl-4"
            } ${
              error
                ? "border-red-400 hover:border-red-400 focus:ring-red-400 dark:border-red-500/80 dark:hover:border-red-500/80 dark:focus:ring-red-500"
                : ""
            } ${className}`}
            {...props}
          />
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

AuthInput.displayName = "AuthInput";
