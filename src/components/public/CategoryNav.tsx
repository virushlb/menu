import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/db';

export function CategoryNav({
  categories,
  activeSectionId,
  onJump,
}: {
  categories: Category[];
  activeSectionId: string | null;
  onJump: (categoryId: string) => void;
}) {
  return (
    <div className="-mx-6 px-6 sm:-mx-10 sm:px-10">
      <div className="no-scrollbar flex gap-2 overflow-x-auto py-3">
        {categories.map((c) => {
          const id = `cat-${c.id}`;
          const isActive = activeSectionId === id;
          return (
            <button
              key={c.id}
              onClick={() => onJump(c.id)}
              className={cn(
                'relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition',
                'border',
                isActive
                  ? 'text-white border-zinc-900'
                  : 'text-zinc-700 border-zinc-200 hover:bg-zinc-50'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="active-cat-pill"
                  className="absolute inset-0 rounded-full bg-zinc-900"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative">{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
