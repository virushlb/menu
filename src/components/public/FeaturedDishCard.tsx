import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Product, ProductImage } from '@/types/db';
import { formatPrice } from '@/lib/format';
import { BRAND } from '@/config/branding';
import { cn } from '@/lib/utils';

export function FeaturedDishCard({
  product,
  images,
  currency,
  onClick,
  className,
}: {
  product: Product;
  images: ProductImage[];
  currency?: string;
  onClick: () => void;
  className?: string;
}) {
  const cover = images[0]?.url;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'group relative w-[280px] shrink-0 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 text-left shadow-sm transition hover:shadow-soft',
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full">
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-100 to-zinc-200" />
        )}

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* badge */}
        <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-200/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-950 shadow-sm backdrop-blur">
          <Star className="h-3.5 w-3.5" />
          Chef’s pick
        </div>

        {/* content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-serif text-lg text-white">{product.name}</div>
              {product.description ? (
                <div className="mt-1 clamp-2 text-xs text-white/80">{product.description}</div>
              ) : null}
            </div>
            <div className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
              {formatPrice(product.price, currency ?? BRAND.currency)}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
