import React from "react";

export interface TabItem {
  id: string;
  label: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  tabClassName?: string;
}

export function Tabs({
  tabs,
  value,
  onChange,
  className = "",
  tabClassName = "",
}: TabsProps) {
  return (
    <div className={`flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 gap-1 sm:gap-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pb-3.5 pt-2 px-3 text-xs sm:text-sm font-bold tracking-tight transition-all relative cursor-pointer ${
              isActive
                ? "text-brand-primary-600 dark:text-brand-primary-400 font-extrabold border-b-2 border-brand-primary-500"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-305"
            } ${tabClassName}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
