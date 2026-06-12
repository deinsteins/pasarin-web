import React, { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            className={`w-full rounded-soft-md border border-zinc-200 bg-white py-3 px-4 text-sm text-zinc-900 outline-none transition-all duration-200 hover:border-zinc-300 focus:border-transparent focus:ring-2 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:hover:border-zinc-700 dark:focus:ring-brand-primary-600 appearance-none cursor-pointer ${
              error
                ? "border-red-400 hover:border-red-400 focus:ring-red-400 dark:border-red-500/80 dark:hover:border-red-500/80 dark:focus:ring-red-500"
                : ""
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 pointer-events-none text-zinc-500 dark:text-zinc-400">
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
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

Select.displayName = "Select";
