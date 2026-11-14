'use client';

import { PKPayPlusButton } from '@pkpayplus/react';
import type { Product } from '@pkpayplus/core';
import { createModalCheckout, createRedirectCheckout } from '@/app/actions/checkout';
import { useState } from 'react';
import Link from 'next/link';
import {
  Frame,
  FramePanel,
  FrameTitle,
  FrameDescription,
} from '@/components/ui/frame';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExtendedPrice {
  links?: Array<{ id: string; url?: string; active?: boolean }>;
}

interface ExtendedProduct extends Product {
  cover_url?: string;
  short_description?: string;
  is_virtual?: boolean;
  is_downloadable?: boolean;
}

export function ProductCard({ product }: { product: ExtendedProduct }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const price = product.prices?.find((p) => p.is_default) || product.prices?.[0];
  const currency = price?.currency?.toUpperCase() || 'USD';

  // Read hosted payment link directly from the product price (provided by PKPay+ API)
  const priceWithLinks = price as (typeof price & ExtendedPrice) | undefined;
  const activeLink = priceWithLinks?.links?.find((l) => l.active) || priceWithLinks?.links?.[0];
  const hostedUrl = activeLink?.url || null;

  // Format currency with proper symbols (e.g. Rs, $, €, ৳)
  const formatCurrency = (amount: number, curr: string) => {
    const numericAmount = Number(amount);
    if (curr === 'PKR' || curr === 'INR') {
      return `Rs ${numericAmount.toFixed(2)}`;
    }
    if (curr === 'BDT') {
      return `৳ ${numericAmount.toFixed(2)}`;
    }
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr,
      }).format(numericAmount);
    } catch {
      return `${curr} ${numericAmount.toFixed(2)}`;
    }
  };

  const formattedPrice = price ? formatCurrency(price.unit_amount, currency) : 'Contact for price';
  const formattedComparePrice =
    price?.compare_at_amount && price.compare_at_amount > price.unit_amount
      ? formatCurrency(price.compare_at_amount, currency)
      : null;

  return (
    <Frame className="w-full">
      <FramePanel className="flex flex-col gap-4 p-5">
        {/* Product Image Area */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-muted/30 flex items-center justify-center">
          {product.cover_url ? (
            <img
              src={product.cover_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <span className="text-4xl text-muted-foreground/40 select-none">📦</span>
          )}

          {product.sku && (
            <div className="absolute top-2.5 left-2.5">
              <Badge variant="outline" size="sm" className="bg-background/90 backdrop-blur-xs text-[10px]">
                {product.sku}
              </Badge>
            </div>
          )}

          {formattedComparePrice && (
            <div className="absolute top-2.5 right-2.5">
              <Badge variant="destructive" size="sm" className="text-[10px] font-bold">
                Sale
              </Badge>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <FrameTitle className="text-base font-semibold text-foreground truncate">
              {product.name}
            </FrameTitle>
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="font-bold text-sm text-foreground">{formattedPrice}</span>
              {formattedComparePrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formattedComparePrice}
                </span>
              )}
            </div>
          </div>

          <FrameDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-8">
            {product.description || product.short_description || 'Direct merchant catalog product.'}
          </FrameDescription>
        </div>

        {/* Dual Checkout Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <PKPayPlusButton
            buttonText="Inline Checkout"
            className={cn(
              buttonVariants({ variant: 'default', size: 'default' })
            )}
            onSessionCreate={async () => {
              setErrorMessage(null);
              try {
                const { iframeUrl, sessionId } = await createModalCheckout(product.id);
                return { iframe_url: iframeUrl, session_id: sessionId };
              } catch (err: unknown) {
                setErrorMessage((err as Error)?.message || 'Checkout failed');
                throw err;
              }
            }}
            onSuccess={(data) => {
              if (data?.sessionId) {
                window.location.href = `/checkout/success?session_id=${data.sessionId}`;
              } else {
                setSuccessInfo('Payment completed successfully!');
              }
            }}
          />

          {hostedUrl ? (
            <Link
              href={hostedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'default' })
              )}
            >
              <span>Hosted Checkout</span>
            </Link>
          ) : (
            <form action={createRedirectCheckout} className="w-full">
              <input type="hidden" name="productId" value={product.id} />
              <button
                type="submit"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'default' }),
                  'w-full cursor-pointer font-medium text-xs tracking-tight justify-center h-9 sm:h-8'
                )}
              >
                Hosted Checkout
              </button>
            </form>
          )}
        </div>

        {/* Status / Error Alerts if Any */}
        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-destructive/8 text-destructive-foreground text-xs border border-destructive/20">
            {errorMessage}
          </div>
        )}

        {successInfo && (
          <div className="p-2.5 rounded-lg bg-success/8 text-success-foreground text-xs border border-success/20">
            ✓ {successInfo}
          </div>
        )}
      </FramePanel>
    </Frame>
  );
}
