"use client";

"use client"
'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface NavbarProps {
  isConfigured: boolean;
  mode?: string;
}

export function Navbar({ isConfigured, mode = 'test' }: NavbarProps) {
  const isSandbox = mode === 'test' || mode === 'sandbox';

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/pkpayplus.png"
            alt="PKPay+"
            className="h-7 rounded-sm w-auto object-contain"
          />
          <span className="font-semibold text-sm text-foreground tracking-tight">
            PkPay+
          </span>
        </Link>

        {/* Status & Actions */}
        <div className="flex items-center gap-2.5">
          {isSandbox ? (
            <Badge variant="outline" size="lg" className="font-medium gap-1.5 text-amber-500">
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              Sandbox
            </Badge>
          ) : isConfigured ? (
            <Badge variant="outline" size="lg" className="font-medium text-emerald-600 gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Live
            </Badge>
          ) : null}

          <Link
            href="https://github.com/pkpayplus-com/pkpayplus-js"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' })
            )}
          >
            <span>GitHub</span>
            <ExternalLink className="size-3 opacity-60" />
          </Link>
        </div>
      </div>
    </header>
  );
}
