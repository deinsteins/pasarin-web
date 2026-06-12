import React from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}: SwitchProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label
      className={`inline-flex items-center gap-3 cursor-pointer select-none ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${className}`}
    >
      <div
        onClick={handleToggle}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-brand-primary-500 focus:ring-offset-2 ${
          checked ? "bg-brand-primary-500" : "bg-zinc-200 dark:bg-zinc-800"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      {label && <span className="text-sm font-medium text-zinc-750 dark:text-zinc-300">{label}</span>}
    </label>
  );
}
