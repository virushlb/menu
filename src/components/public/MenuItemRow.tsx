import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Product, ProductImage } from '@/types/db';
import { formatPrice } from '@/lib/format';
import { BRAND } from '@/config/branding';
import { cn } from '@/lib/utils';

function formatTag(tag: string) {
  const t = tag.trim().toLowerCase();
  if (t === 'spicy') return '🌶️ Spicy';
  if (t === 'vegan') return '🌿 Vegan';
  if (t === 'vegetarian') return '🥗 Vegetarian';
  if (t === 'new') return '✨ New';
  if (t === 'signature') return '⭐ Signature';
  if (t === 'gluten-free' || t === 'gluten free') return '🌾 GF';
  return tag;
}

export function MenuItemRow({
  product,
  images,
  onClick,
  className,
  currency,
  featured,
}: {
  product: Product;
  images: ProductImage[];
  onClick: () => void;
  className?: string;
  currency?: string;
  featured?: boolean;
}) {
  const tags = useMemo(() => {
    const raw = product.tags ?? [];
    return raw.slice(0, 4).map((t) => formatTag(t));
  }, [product.tags]);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      className={cn(
        'group w-full px-2 py-4 text-left transition',
        'hover:bg-zinc-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20',
        className
      )}
    >
      <div className="flex items-baseline gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            {featured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                <Star className="h-3.5 w-3.5" />
                Chef’s pick
              </span>
            ) : null}
            <div className="truncate text-[15px] font-semibold text-zinc-900 sm:text-base">
              {product.name}
            </div>
          </div>
        </div>

        {/* dotted leader */}
        <div className="hidden sm:block flex-1 border-b border-dotted border-zinc-300/80" />

        <div className="shrink-0 font-semibold text-zinc-900">
          {formatPrice(product.price, currency ?? BRAND.currency)}
        </div>
      </div>

      {product.description ? (
        <div className="mt-1 text-sm leading-relaxed text-zinc-600">{product.description}</div>
      ) : null}

      {tags.length ? (
        <div className="mt-2 text-xs text-zinc-500">{tags.join(' • ')}</div>
      ) : null}

      {/* Keep it menu-like (no extra "tap" callouts) */}
      {/* Photos are shown inside the modal when opened */}
    </motion.button>
  );
}
