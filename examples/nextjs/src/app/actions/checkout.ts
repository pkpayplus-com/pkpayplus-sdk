'use server';

import { pkpayServer } from '@pkpayplus/nextjs/server';
import type { Product } from '@pkpayplus/core';
import { redirect } from 'next/navigation';

export interface CheckoutResult {
  iframeUrl: string;
  sessionId: string;
  error?: string;
}

interface ProductDetailResponse {
  product?: Product;
  cover_url?: string;
}

interface ExtendedPrice {
  links?: Array<{ id: string; url?: string; active?: boolean }>;
}

/**
 * Helper to unwrap product from API response format: { product: { ... } } or { ... }
 */
function unwrapProduct(raw: unknown): Product {
  const data = raw as ProductDetailResponse & Product;
  if (data?.product && typeof data.product === 'object') {
    return data.product;
  }
  return data;
}

/**
 * Server Action: In-app Modal / Dialog Checkout
 * Fetches dashboard product details server-side and creates an iframe checkout session.
 */
export async function createModalCheckout(productId: string): Promise<CheckoutResult> {
  const secretKey = process.env.PKPAY_SECRET_KEY;
  const merchantId = process.env.PKPAY_MERCHANT_ID;

  if (!secretKey || !merchantId) {
    throw new Error(
      'PKPay+ is not configured. Please set PKPAY_SECRET_KEY and PKPAY_MERCHANT_ID in your .env.local file.'
    );
  }

  // 1. Retrieve the product and its active price directly from PKPay+
  const rawResponse = await pkpayServer.products.get(productId);
  const product = unwrapProduct(rawResponse);

  const defaultPrice = product.prices?.find((p) => p.is_default) || product.prices?.[0];

  if (!defaultPrice) {
    throw new Error(`Product "${product.name || productId}" does not have an active price configured on the dashboard.`);
  }

  // 2. Create the checkout session securely on the server
  const session = await pkpayServer.checkoutSessions.create({
    amount: defaultPrice.unit_amount,
    currency: defaultPrice.currency,
    checkout_flow: 'iframe',
    cart: {
      items: [
        {
          name: product.name,
          unit_price: defaultPrice.unit_amount,
          quantity: 1,
          sku: product.sku,
        },
      ],
    },
    metadata: {
      productId: product.id,
      productName: product.name,
      source: 'nextjs-example-server-action',
    },
  });

  if (!session.iframe_url && !session.session_id) {
    throw new Error('Failed to create checkout session with PKPay+ server.');
  }

  return {
    iframeUrl: session.iframe_url || '',
    sessionId: session.session_id,
  };
}

/**
 * Server Action: Hosted Gateway Redirect Checkout
 * Redirects directly to the product's official hosted payment link (https://pay.pkpayplus.com/l/<link_id>)
 */
export async function createRedirectCheckout(formData: FormData) {
  const productId = formData.get('productId') as string;
  if (!productId) {
    throw new Error('Missing productId parameter.');
  }

  const secretKey = process.env.PKPAY_SECRET_KEY;
  const merchantId = process.env.PKPAY_MERCHANT_ID;

  if (!secretKey || !merchantId) {
    throw new Error(
      'PKPay+ is not configured. Please set PKPAY_SECRET_KEY and PKPAY_MERCHANT_ID in your .env.local file.'
    );
  }

  const rawResponse = await pkpayServer.products.get(productId);
  const product = unwrapProduct(rawResponse);

  const defaultPrice = product.prices?.find((p) => p.is_default) || product.prices?.[0];

  if (!defaultPrice) {
    throw new Error(`Product "${product.name || productId}" does not have an active price.`);
  }

  // 1. Check if the product has a hosted payment link (provided by PKPay+ API)
  const priceWithLinks = defaultPrice as ExtendedPrice;
  const activeLink = priceWithLinks.links?.find((l) => l.active) || priceWithLinks.links?.[0];

  if (activeLink?.url) {
    redirect(activeLink.url);
  }

  // 2. Fallback to checkout session redirect
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await pkpayServer.checkoutSessions.create({
    amount: defaultPrice.unit_amount,
    currency: defaultPrice.currency,
    checkout_flow: 'redirect',
    success_url: `${appUrl}/checkout/success`,
    cancel_url: `${appUrl}/checkout/cancel`,
    cart: {
      items: [
        {
          name: product.name,
          unit_price: defaultPrice.unit_amount,
          quantity: 1,
          sku: product.sku,
        },
      ],
    },
    metadata: {
      productId: product.id,
      source: 'nextjs-example-redirect-action',
    },
  });

  const targetUrl = session.redirect_url || session.iframe_url;
  if (!targetUrl) {
    throw new Error('Checkout URL was not returned by PKPay+ API.');
  }

  redirect(targetUrl);
}
