import { pkpayServer } from '@pkpayplus/nextjs/server';
import type { Product } from '@pkpayplus/core';
import { ProductCard } from '@/components/ProductCard';
import { Badge } from '@/components/ui/badge';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Products
            </h1>
            <Badge variant="secondary" size="sm">
              {displayProducts.length}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isLiveCatalog
              ? `Directly synced with your ${activeMode === 'test' ? 'Sandbox' : 'Live'} merchant catalog.`
              : 'Showing preview catalog. Configure credentials in .env.local.'}
          </p>
        </div>
      </div>

      {/* API Error Notification if Any */}
      {fetchError && (
        <div className="mb-8 p-4 bg-destructive/8 border border-destructive/20 rounded-xl text-destructive-foreground text-xs">
          <p className="font-bold">Error loading live dashboard products:</p>
          <p className="text-xs mt-1 font-mono">{fetchError}</p>
        </div>
      )}

      {/* Responsive Coss UI Frame Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
