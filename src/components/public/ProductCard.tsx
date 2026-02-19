import React from 'react';
import { motion } from 'framer-motion';
import type { Product, ProductImage } from '@/types/db';
import { formatPrice } from '@/lib/format';
import { BRAND } from '@/config/branding';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export function ProductCard({
  product,
  images,
  onClick,
}: {
  product: Product;
  images: ProductImage[];
  onClick: () => void;
}) {
  const cover = images[0]?.url;

  return (
    <motion.button
      layout
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'group flex w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left shadow-sm transition hover:shadow-soft'
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-100 to-zinc-200" />
        )}
        {product.tags?.length ? (
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.tags.slice(0, 3).map((t) => (
              <Badge key={t} className="bg-white/80 backdrop-blur">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-zinc-900">{product.name}</div>
          </div>
          <div className="shrink-0 text-sm font-semibold text-zinc-900">
            {formatPrice(product.price, BRAND.currency)}
          </div>
        </div>

        {product.description ? (
          <div className="mt-2 clamp-2 text-sm text-zinc-600">{product.description}</div>
        ) : (
          <div className="mt-2 text-sm text-zinc-500">No description</div>
        )}

        <div className="mt-auto pt-4 text-xs font-medium text-zinc-500">
          Tap to view details
        </div>
      </div>
    </motion.button>
  );
}
