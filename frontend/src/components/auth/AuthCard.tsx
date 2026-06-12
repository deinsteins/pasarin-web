import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 p-8 shadow-[0_20px_50px_rgba(8,_112,_184,_0.08)] backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/70 sm:p-10">
      <div className="mb-8 text-center">
        <h2 className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-white dark:via-zinc-200 dark:to-zinc-400">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
