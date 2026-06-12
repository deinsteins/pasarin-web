import React from "react";

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className = "", variant = "rectangular" }: SkeletonProps) {
  const baseStyles = "animate-pulse bg-zinc-200 dark:bg-zinc-800";

  const variants = {
    text: "h-3.5 w-full rounded-soft-sm",
    circular: "rounded-full",
    rectangular: "rounded-soft-md",
  };

  return <div className={`${baseStyles} ${variants[variant]} ${className}`} />;
}
