# PKPay+ Next.js App Router Reference Project

Official, production-grade Next.js App Router reference implementation for the **PKPay+** payment ecosystem.

Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Next.js Server Actions**.

---

## 🌟 Key Highlights

- **Dynamic Dashboard Products**: Renders products created directly on your [PKPay+ Merchant Dashboard](https://dashboard.pkpayplus.com) with zero manual price duplication.
- **Pure Server Actions (`'use server'`)**: Checkout sessions are created directly via Server Actions with zero custom REST routes.
- **Tamper-Proof Security**: The client only supplies the `productId`. The server fetches the authoritative price directly from PKPay+ before creating checkout sessions.
- **Tailwind CSS v4 Ready**: Clean CSS-first styling powered by the latest `@tailwindcss/postcss` and `@import "tailwindcss";`.
- **Standard `src/` Directory Layout**: Modern Next.js application organization with `src/app/` and `src/components/`.
- **Dual Checkout Experiences**:
  - **In-App Modal / Dialog**: Built-in `<PKPayPlusButton />` and custom `usePKPayPlus().openDialog()` hook.
  - **Hosted Gateway Redirect**: Standard redirect flow to the PKPay+ payment gateway with automatic return to `/checkout/success`.
- **Direct Session Verification**: Post-payment status verification on `/checkout/success` using `pkpayServer.checkoutSessions.verify(sessionId)`.

---

## 📁 Project Structure

```text
examples/nextjs/
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── checkout.ts      # Server Actions ('use server') for creating checkout sessions
│   │   ├── checkout/
│   │   │   ├── success/page.tsx # Verifies session status via pkpayServer.checkoutSessions.verify
│   │   │   └── cancel/page.tsx  # Cancellation fallback page
│   │   ├── globals.css          # Tailwind CSS v4 styles (@import "tailwindcss";)
│   │   ├── layout.tsx           # Root layout with PKPayPlusProvider
│   │   ├── page.tsx             # Server Component fetching products.list() from dashboard
│   │   └── providers.tsx        # Client Provider wrapper
│   └── components/
│       ├── Navbar.tsx           # Header with API connection indicator
│       └── ProductCard.tsx      # Interactive product card with Modal & Redirect triggers
├── .env.example                 # Environment variables template
├── .gitignore                   # Excludes node_modules, .next, .env*.local
├── .npmrc                       # Standalone lockfile configuration (shared-workspace-lockfile=false)
├── next.config.ts               # Clean Next.js configuration
├── package.json                 # Standalone dependencies & pnpm scripts
├── pnpm-lock.yaml               # Isolated pnpm lockfile
├── postcss.config.mjs           # Tailwind CSS v4 PostCSS plugin
├── README.md                    # Developer quickstart & integration guide
└── tsconfig.json                # TypeScript configuration with @/* -> ./src/*
```

---

## 🚀 Quickstart with pnpm

### 1. Install Dependencies

Navigate to `examples/nextjs`:

```bash
cd examples/nextjs
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials from the [PKPay+ Merchant Dashboard](https://dashboard.pkpayplus.com/settings/api-keys):

```env
# Secret key used for server-side operations (Server Actions)
PKPAY_SECRET_KEY=sk_test_your_secret_key_here

# Your PKPay+ Merchant UUID
PKPAY_MERCHANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Public key for client-side dialog initialization
NEXT_PUBLIC_PKPAY_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Base URL for redirects (default: http://localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: If run without `.env.local`, the store opens in **Preview Mode** displaying sample products so you can test the UI layout immediately.

### 3. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 Code Walkthrough

### 1. Dynamic Catalog from Dashboard (`src/app/page.tsx`)

In Next.js App Router, React Server Components run securely on the server. You can fetch all published products directly from PKPay+:

```tsx
import { pkpayServer } from '@pkpayplus/nextjs/server';

export default async function HomePage() {
  // Fetches published products created in your PKPay+ merchant dashboard
  const { data: products } = await pkpayServer.products.list({ status: 'published' });

  return (
    <div className="grid grid-cols-2 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 2. Pure Server Actions (`src/app/actions/checkout.ts`)

Instead of creating client-accessible `/api/checkout` endpoints, define a Server Action:

```typescript
'use server';

import { pkpayServer } from '@pkpayplus/nextjs/server';

export async function createModalCheckout(productId: string) {
  // 1. Fetch authoritative product price from PKPay+ server
  const product = await pkpayServer.products.get(productId);
  const price = product.prices?.find((p) => p.is_default) || product.prices?.[0];

  if (!price) throw new Error('No active price found for product');

  // 2. Create the checkout session
  const session = await pkpayServer.checkoutSessions.create({
    amount: price.unit_amount,
    currency: price.currency,
    checkout_flow: 'iframe',
    cart: {
      items: [{ name: product.name, unit_price: price.unit_amount, quantity: 1 }],
    },
    metadata: { productId: product.id },
  });

  return {
    iframeUrl: session.iframe_url || '',
    sessionId: session.session_id,
  };
}
```

### 3. Client Component Checkout Trigger (`src/components/ProductCard.tsx`)

In client components, connect the button directly to the Server Action:

```tsx
'use client';

import { PKPayPlusButton } from '@pkpayplus/react';
import { createModalCheckout } from '@/app/actions/checkout';

export function ProductCard({ product }) {
  return (
    <PKPayPlusButton
      buttonText="Pay with Modal"
      onSessionCreate={async () => {
        const { iframeUrl, sessionId } = await createModalCheckout(product.id);
        return { iframe_url: iframeUrl, session_id: sessionId };
      }}
      onSuccess={(data) => {
        alert('Payment completed: ' + data.sessionId);
      }}
    />
  );
}
```

### 4. Verifying Payment on Return (`src/app/checkout/success/page.tsx`)

When the payment finishes, the return page queries the status:

```tsx
import { pkpayServer } from '@pkpayplus/nextjs/server';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;

  if (session_id) {
    const session = await pkpayServer.checkoutSessions.verify(session_id);
    console.log('Payment status:', session.status); // e.g. 'paid'
  }

  return <div>Payment Confirmed</div>;
}
```

---

## 🛠️ Verification & Building

Run TypeScript type-checking:
```bash
pnpm typecheck
```

Build the production bundle:
```bash
pnpm build
```

---

## 📄 License

MIT © [PKPay+](https://pkpayplus.com)
