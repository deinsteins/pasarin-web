import React, { InputHTMLAttributes, forwardRef } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="flex items-start gap-2.5 text-sm text-zinc-650 dark:text-zinc-400 cursor-pointer select-none">
          <input
            ref={ref}
            type="checkbox"
            className={`h-4.5 w-4.5 mt-0.5 rounded border-zinc-355 text-brand-primary-600 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-brand-primary-600 transition-colors cursor-pointer shrink-0 ${
              error ? "border-red-400 focus:ring-red-400" : ""
            } ${className}`}
            {...props}
          />
          {label && <span>{label}</span>}
        </label>
        {error && (
          <span className="text-xs font-semibold text-red-500 dark:text-red-400 pl-7">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
