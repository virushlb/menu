import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'soft' | 'outline';

export function Badge({
  variant = 'soft',
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  const styles: Record<BadgeVariant, string> = {
    default: 'bg-zinc-900 text-white',
    soft: 'bg-zinc-100 text-zinc-800',
    outline: 'border border-zinc-200 text-zinc-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
