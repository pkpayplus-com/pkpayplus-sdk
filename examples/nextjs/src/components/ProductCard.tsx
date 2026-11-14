'use client';

import { PKPayPlusButton } from '@pkpayplus/react';
import type { Product } from '@pkpayplus/core';
import { createModalCheckout, createRedirectCheckout } from '@/app/actions/checkout';
import { useState } from 'react';

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
    <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Real Product Image Area */}
        <div className="relative w-full h-64 bg-slate-100 overflow-hidden flex items-center justify-center">
          {product.cover_url ? (
            <img
              src={product.cover_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/40 text-slate-300">
              <span className="text-6xl">📦</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/95 text-slate-800 shadow-sm backdrop-blur-md">
              {product.sku || (product.is_virtual ? 'Digital' : 'In Stock')}
            </span>
          </div>

          {formattedComparePrice && (
            <div className="absolute top-3.5 right-3.5">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm">
                Save
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>

          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed min-h-[40px]">
            {product.description || product.short_description || 'High quality product fulfilled with instant payment confirmation.'}
          </p>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {formattedPrice}
              </span>
              {formattedComparePrice && (
                <span className="text-sm font-semibold text-slate-400 line-through">
                  {formattedComparePrice}
                </span>
              )}
            </div>

            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Success Notification */}
          {successInfo && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
              ✓ {successInfo}
            </div>
          )}
        </div>
      </div>

      {/* Modern Checkout Footer */}
      <div className="p-6 pt-0 space-y-3">
        {/* In-App Modal Dialog Checkout Button */}
        <PKPayPlusButton
          buttonText="Buy Now"
          className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
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
            setSuccessInfo(`Payment completed! Session: ${data.sessionId}`);
          }}
        />

        {/* Hosted Payment Page: Direct Link to https://pay.pkpayplus.com/l/<link_id> */}
        {hostedUrl ? (
          <a
            href={hostedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center justify-center gap-1"
          >
            Or open hosted checkout page ↗
          </a>
        ) : (
          <form action={createRedirectCheckout} className="text-center">
            <input type="hidden" name="productId" value={product.id} />
            <button
              type="submit"
              className="w-full py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center justify-center gap-1"
            >
              Or open hosted checkout page →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
