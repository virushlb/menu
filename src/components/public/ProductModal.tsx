import React, { useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Product, ProductImage } from '@/types/db';
import { BRAND } from '@/config/branding';
import { formatPrice } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export function ProductModal({
  open,
  onClose,
  product,
  images,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  product: Product;
  images: ProductImage[];
  currency?: string;
}) {
  const [index, setIndex] = useState(0);

  const safeIndex = useMemo(() => {
    if (!images.length) return 0;
    return Math.min(Math.max(index, 0), images.length - 1);
  }, [index, images.length]);

  const current = images[safeIndex]?.url;

  const goPrev = () => setIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));
  const goNext = () => setIndex((i) => (images.length ? (i + 1) % images.length : 0));

  return (
    <AnimatePresence>
      {open && (
        <Dialog as="div" className="relative z-50" open={open} onClose={onClose}>
          <motion.div
            className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-10">
              <Dialog.Panel
                as={motion.div}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 } as const}
                className="paper-surface grain w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-200/70 shadow-soft"
              >
                <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                  <div className="relative bg-zinc-100">
                    <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:h-full">
                      {current ? (
                        <img
                          src={current}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-zinc-100 to-zinc-200" />
                      )}

                      {images.length > 1 && (
                        <>
                          <button
                            onClick={goPrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur transition hover:bg-white"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={goNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur transition hover:bg-white"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={onClose}
                        className="absolute right-3 top-3 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur transition hover:bg-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto px-4 py-3">
                        {images.map((img, i) => (
                          <button
                            key={img.id}
                            onClick={() => setIndex(i)}
                            className={cn(
                              'h-14 w-14 shrink-0 overflow-hidden rounded-xl border transition',
                              i === safeIndex ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-400'
                            )}
                          >
                            <img src={img.url} alt={product.name} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <Dialog.Title className="font-serif text-2xl md:text-3xl">
                        {product.name}
                      </Dialog.Title>
                      <div className="shrink-0 text-base font-semibold text-zinc-900">
                        {formatPrice(product.price, currency ?? BRAND.currency)}
                      </div>
                    </div>

                    {product.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.tags.map((t) => (
                          <Badge key={t} variant="soft">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : null}

                    {product.description ? (
                      <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                        {product.description}
                      </p>
                    ) : (
                      <p className="mt-5 text-sm text-zinc-600">No description.</p>
                    )}

                    <div className="mt-8 rounded-2xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur">
                      <div className="text-xs font-semibold tracking-wide text-zinc-500">Note</div>
                      <div className="mt-1 text-sm text-zinc-700">
                        Menu only — no online ordering. Prices & availability may change.
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
