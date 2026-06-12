import React from "react";

export interface DividerProps {
  children?: React.ReactNode;
  className?: string;
}

export function Divider({ children, className = "" }: DividerProps) {
  if (!children) {
    return <hr className={`border-t border-zinc-200 dark:border-zinc-800 ${className}`} />;
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
      <span className="flex-shrink mx-3 bg-transparent text-xs font-semibold text-zinc-400 dark:text-zinc-500">
        {children}
      </span>
      <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
    </div>
  );
}
