import React from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export interface AlertProps {
  children: React.ReactNode;
  variant?: "success" | "error" | "warning" | "info";
  className?: string;
}

export function Alert({ children, variant = "error", className = "" }: AlertProps) {
  const baseStyles =
    "flex items-center gap-2.5 rounded-soft-md border p-3.5 text-sm font-medium transition-all";

  const variants = {
    success:
      "border-green-250 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400",
    error:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400",
    warning:
      "border-amber-200 bg-amber-50 text-amber-705 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400",
    info:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400",
  };

  const icons = {
    success: <CheckCircle className="h-4.5 w-4.5 shrink-0" />,
    error: <AlertCircle className="h-4.5 w-4.5 shrink-0" />,
    warning: <AlertCircle className="h-4.5 w-4.5 shrink-0" />,
    info: <Info className="h-4.5 w-4.5 shrink-0" />,
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {icons[variant]}
      <div>{children}</div>
    </div>
  );
}
