import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "vegetable"
    | "fruit"
    | "organic"
    | "spices"
    | "meat"
    | "neutral";
  className?: string;
}

export function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors";

  const variants = {
    primary:
      "bg-brand-primary-50 text-brand-primary-700 dark:bg-brand-primary-950/40 dark:text-brand-primary-400",
    secondary:
      "bg-brand-secondary-50 text-brand-secondary-700 dark:bg-brand-secondary-950/40 dark:text-brand-secondary-400",
    vegetable:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    fruit:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    organic:
      "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400",
    spices:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
    meat:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    neutral:
      "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
