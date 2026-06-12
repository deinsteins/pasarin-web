import React from "react";

export interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  glass?: boolean;
  className?: string;
  bodyClassName?: string;
}

export function Card({
  children,
  title,
  subtitle,
  glass = true,
  className = "",
  bodyClassName = "",
}: CardProps) {
  const cardStyle = glass
    ? "backdrop-blur-xl bg-white/70 border-zinc-200/80 shadow-soft-xl dark:border-zinc-800/60 dark:bg-zinc-900/70"
    : "bg-white border-zinc-200/60 shadow-soft-md dark:border-zinc-850 dark:bg-zinc-900";

  return (
    <div
      className={`w-full overflow-hidden rounded-soft-lg border p-6 sm:p-8 md:p-10 transition-all ${cardStyle} ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-6 text-center">
          {title && (
            <h2 className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 bg-clip-text text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent dark:from-white dark:via-zinc-200 dark:to-zinc-400 font-heading">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 font-body">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
