import React from "react";
import { Leaf, Plus } from "lucide-react";
import { Badge } from "./Badge";

export interface ProductCardProps {
  image?: string;
  category: string;
  categoryVariant?: "vegetable" | "fruit" | "organic" | "spices" | "meat";
  location: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  rating?: number;
  reviewCount?: number;
  badgeText?: string;
  onAddToCart?: () => void;
  className?: string;
}

export function ProductCard({
  image,
  category,
  categoryVariant = "vegetable",
  location,
  title,
  description,
  price,
  unit,
  rating = 5.0,
  reviewCount = 0,
  badgeText,
  onAddToCart,
  className = "",
}: ProductCardProps) {
  // Format price to Rupiah
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      className={`group flex flex-col justify-between overflow-hidden rounded-soft-lg border border-slate-200/60 bg-white p-4 shadow-soft-md transition-all duration-300 hover:scale-[1.01] hover:shadow-soft-lg dark:border-slate-850 dark:bg-zinc-900 ${className}`}
    >
      <div>
        {/* Image / Placeholder */}
        <div className="relative aspect-square w-full overflow-hidden rounded-soft-md bg-gradient-to-tr from-brand-primary-50 to-brand-primary-100/50 dark:from-brand-primary-950/10 dark:to-brand-primary-900/10 flex items-center justify-center mb-3">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Leaf className="h-14 w-14 text-brand-primary-500 stroke-[1.25] transition-transform duration-300 group-hover:rotate-12" />
          )}

          {badgeText && (
            <span className="absolute top-2 left-2 rounded-full bg-brand-primary-500 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-soft-sm">
              {badgeText}
            </span>
          )}

          <span className="absolute top-2 right-2 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-slate-700 shadow-soft-sm backdrop-blur-md dark:bg-zinc-900/95 dark:text-zinc-300">
            ★ {rating.toFixed(1)} {reviewCount > 0 && `(${reviewCount})`}
          </span>
        </div>

        {/* Category & Location */}
        <div className="flex gap-1.5 items-center mb-1 flex-wrap">
          <Badge variant={categoryVariant}>{category}</Badge>
          <span className="text-[11px] text-slate-400 font-medium line-clamp-1">{location}</span>
        </div>

        {/* Title */}
        <h4 className="font-heading text-base font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-brand-primary-600 dark:group-hover:text-brand-primary-400 transition-colors">
          {title}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 font-body mt-1 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Footer / Price & Action */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">
            Harga {unit}
          </span>
          <span className="font-heading text-sm font-extrabold text-brand-secondary-600 dark:text-brand-secondary-400">
            {formatPrice(price)}
          </span>
        </div>

        {onAddToCart && (
          <button
            onClick={onAddToCart}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-500 text-white shadow-soft-md hover:bg-brand-primary-600 active:scale-90 transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </div>
  );
}
