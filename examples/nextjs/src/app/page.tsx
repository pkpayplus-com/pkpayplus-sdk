import { pkpayServer } from '@pkpayplus/nextjs/server';
import type { Product } from '@pkpayplus/core';
import { ProductCard } from '@/components/ProductCard';

interface ExtendedProduct extends Product {
  cover_url?: string;
  is_virtual?: boolean;
  is_downloadable?: boolean;
}

// Fallback preview products if API credentials are not yet configured
const SAMPLE_PREVIEW_PRODUCTS: ExtendedProduct[] = [
  {
    id: 'prod_sample_juice',
    merchant_id: 'sample_merchant',
    name: 'Fresh Lemon Juice',
    description: 'Fresh and natural lemon juice made from 100% organic lemons with no added preservatives.',
    sku: 'JUICE-1001',
    status: 'published',
    mode: 'test',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    prices: [
      {
        id: 'price_sample_1',
        product_id: 'prod_sample_juice',
        currency: 'PKR',
        unit_amount: 12000, // Rs 120.00
        is_default: true,
        active: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'prod_sample_shirt',
    merchant_id: 'sample_merchant',
    name: 'Classic Cotton T-Shirt',
    description: 'Premium heavyweight cotton tee with tailored fit, durable stitching, and breathable fabric.',
    sku: 'APP-TEE-01',
    status: 'published',
    mode: 'test',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    prices: [
      {
        id: 'price_sample_2',
        product_id: 'prod_sample_shirt',
        currency: 'PKR',
        unit_amount: 50000, // Rs 500.00
        is_default: true,
        active: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'prod_sample_digital',
    merchant_id: 'sample_merchant',
    name: 'Developer Pro License',
    description: 'Instant lifetime access to our digital SDK toolkit, priority email support, and updates.',
    sku: 'DIGITAL-LIC',
    status: 'published',
    mode: 'test',
    is_virtual: true,
    is_downloadable: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    prices: [
      {
        id: 'price_sample_3',
        product_id: 'prod_sample_digital',
        currency: 'USD',
        unit_amount: 4900, // $49.00
        is_default: true,
        active: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
];

export default async function HomePage() {
  const isConfigured = Boolean(
    process.env.PKPAY_SECRET_KEY && process.env.PKPAY_MERCHANT_ID
  );

  // Auto-detect mode from secret key (sk_test_... -> test mode) or PKPAY_MODE
  const isTestKey =
    process.env.PKPAY_SECRET_KEY?.startsWith('sk_test_') ||
    process.env.NEXT_PUBLIC_PKPAY_KEY?.startsWith('pk_test_') ||
    process.env.PKPAY_MODE === 'test';

  const activeMode = isTestKey ? 'test' : 'live';

  let products: ExtendedProduct[] = [];
  let fetchError: string | null = null;
  let isLiveCatalog = false;

  if (isConfigured) {
    try {
      // 1. First attempt: Query with active mode (test or live) and published status
      const response = await pkpayServer.products.list({
        mode: activeMode,
        status: 'published',
      });

      products = (response.data as ExtendedProduct[]) || [];

      // 2. Fallback: If no products found with status=published, query by mode only
      if (products.length === 0) {
        const fallbackResponse = await pkpayServer.products.list({
          mode: activeMode,
        });
        products = (fallbackResponse.data as ExtendedProduct[]) || [];
      }

      // 3. Fallback: If still empty, query all without mode restriction
      if (products.length === 0) {
        const allResponse = await pkpayServer.products.list();
        products = (allResponse.data as ExtendedProduct[]) || [];
      }

      isLiveCatalog = products.length > 0;
    } catch (err: unknown) {
      fetchError = (err as Error)?.message || 'Failed to fetch products from PKPay+';
    }
  }

  const displayProducts = isLiveCatalog ? products : SAMPLE_PREVIEW_PRODUCTS;

  return (
    <div className="space-y-16">
      {/* Real E-Commerce Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Official Next.js App Router & Server Actions Reference
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Seamless Payments. <span className="text-blue-600">Zero Redirect Friction.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to the official PKPay+ storefront demo. Products are loaded directly from your
            merchant catalog with secure, server-verified checkout.
          </p>

          {/* Value Props Bar */}
          <div className="mt-10 pt-8 border-t border-slate-100 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center justify-center gap-2">
              <span className="text-blue-600 text-base">⚡</span>
              <span>In-App Modal Checkout</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-emerald-600 text-base">🔒</span>
              <span>256-Bit SSL Encryption</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-amber-600 text-base">📦</span>
              <span>Real-Time Catalog Sync</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-purple-600 text-base">🚀</span>
              <span>Server Actions (No API)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Catalog Header & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Product Catalog
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {displayProducts.length} Item{displayProducts.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isLiveCatalog ? (
                <span>
                  Synchronized with your <strong className="text-slate-800">{activeMode === 'test' ? 'Sandbox' : 'Live'}</strong> dashboard catalog.
                </span>
              ) : (
                <span>Showing sample items. Connect your dashboard credentials in <code className="text-slate-700 font-mono">.env.local</code>.</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isTestKey && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Mode: Sandbox
              </span>
            )}
          </div>
        </div>

        {/* API Error Notification if Any */}
        {fetchError && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
            <p className="font-bold">Error loading live dashboard products:</p>
            <p className="text-xs mt-1 font-mono">{fetchError}</p>
          </div>
        )}

        {/* Responsive Real Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Developer Integration Highlights */}
        <section className="mt-24 pt-16 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Engineered for Developers
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Why this Next.js integration architecture delivers the highest conversion and security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold mb-5">
                ⚡
              </div>
              <h4 className="text-base font-bold text-slate-900">Direct Dashboard Catalog</h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Call <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">pkpayServer.products.list()</code> on the server. When you create or edit products on the dashboard, they update here instantly.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold mb-5">
                🔒
              </div>
              <h4 className="text-base font-bold text-slate-900">Zero REST API Routes</h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Powered by Next.js Server Actions (<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">&apos;use server&apos;</code>). Buttons invoke checkout actions directly without creating public endpoints.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold mb-5">
                🛡️
              </div>
              <h4 className="text-base font-bold text-slate-900">Tamper-Proof Checkout</h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                The client never submits price values. The server looks up authoritative amounts by <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">productId</code> before creating the checkout session.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
