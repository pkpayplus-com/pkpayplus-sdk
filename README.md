# PKPay+ Developer SDK Ecosystem

Official Node.js, Express, Next.js, React 19, Vue 3, Svelte, and Astro SDKs for **PKPay+**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node->=24.0.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.x-blue.svg)](https://react.dev/)

---

## Dedicated Packages for Every Framework

Install the dedicated package designed specifically for your stack — no confusing subpaths, no framework lock-in:

| Framework / Runtime            | Package to Install        | Primary Use Case                                               |
| :----------------------------- | :------------------------ | :------------------------------------------------------------- |
| **Next.js**                    | `npm i @pkpayplus/nextjs` | App Router, Server Actions, Route Handlers, React 19 Client UI |
| **Node.js / Express / NestJS** | `npm i @pkpayplus/node`   | Backend APIs, server session verification, products, prices    |
| **React**                      | `npm i @pkpayplus/react`  | React 19 SPA, Vite, Remix, CRA                                 |
| **Vue**                        | `npm i @pkpayplus/vue`    | Vue 3 & Nuxt 3 composables (`usePKPayPlus`) & plugin           |
| **Svelte**                     | `npm i @pkpayplus/svelte` | Svelte 4 & 5, SvelteKit runes and stores                       |
| **Astro**                      | `npm i @pkpayplus/astro`  | Astro SSR endpoints & client dialog controllers                |
| **HTML / Static Sites**        | _CDN `<script>`_          | Drop-in embed for WordPress, Webflow, Shopify                  |

---

## Quickstarts & API Reference

### 1. Next.js App Router (`@pkpayplus/nextjs`)

> 💡 **Complete Reference App**: Check out the official [Next.js App Router Storefront Example](./examples/nextjs) with dynamic dashboard products and Server Actions.

Install:

```bash
npm install @pkpayplus/nextjs
```

Environment variables (`.env.local`):

```env
PKPAY_SECRET_KEY=sk_live_xxxxxx
PKPAY_MERCHANT_ID=8f7e6d5c-xxxx-xxxx
NEXT_PUBLIC_PKPAY_KEY=pk_live_xxxxxx
```

#### Server Action (`app/actions/checkout.ts`):

```typescript
'use server';

import { pkpayServer } from '@pkpayplus/nextjs/server';

export async function createCheckout(amount: number) {
  // pkpayServer auto-discovers PKPAY_SECRET_KEY & PKPAY_MERCHANT_ID
  const session = await pkpayServer.checkoutSessions.create({
    amount,
    currency: 'USD',
    checkout_flow: 'iframe',
  });

  return { iframeUrl: session.iframe_url!, sessionId: session.session_id };
}
```

#### Client Component (`app/checkout/page.tsx`):

```tsx
'use client';

import {
  PKPayPlusProvider,
  usePKPayPlus,
  PKPayPlusButton,
  PKPayPlusDialog,
} from '@pkpayplus/nextjs';
import { useState } from 'react';
import { createCheckout } from '../actions/checkout';

export default function CheckoutPage() {
  const { openDialog, closeDialog } = usePKPayPlus();
  const [dialogUrl, setDialogUrl] = useState<string | null>(null);

  return (
    <PKPayPlusProvider>
      {/* 1. Drop-in pre-styled button with Server Action */}
      <PKPayPlusButton
        onSessionCreate={async () => {
          const { iframeUrl, sessionId } = await createCheckout(49.99);
          return { iframe_url: iframeUrl, session_id: sessionId };
        }}
        onSuccess={(data) => alert('Payment completed: ' + data.sessionId)}
      />

      {/* 2. Custom button with openDialog hook */}
      <button
        onClick={async () => {
          const { iframeUrl } = await createCheckout(49.99);
          openDialog({
            url: iframeUrl,
            onSuccess: (data) => console.log('Paid:', data.sessionId),
            onCancel: () => console.log('Closed'),
          });
        }}
      >
        Pay via Hook
      </button>

      {/* 3. Declarative Dialog Component */}
      <PKPayPlusDialog
        isOpen={Boolean(dialogUrl)}
        url={dialogUrl || ''}
        onClose={() => setDialogUrl(null)}
        onSuccess={(data) => alert('Paid: ' + data.sessionId)}
      />
    </PKPayPlusProvider>
  );
}
```

#### Server Route Handler for Verification (`app/api/checkout/verify/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { pkpayServer } from '@pkpayplus/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    const session = await pkpayServer.checkoutSessions.verify(sessionId);
    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      amount: session.amount,
      currency: session.currency,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

---

### 2. Node.js / Express / NestJS (`@pkpayplus/node`)

Install:

```bash
npm install @pkpayplus/node
```

Initialization:

```typescript
import { PKPayPlus } from '@pkpayplus/node';

const pkpay = new PKPayPlus({
  secretKey: process.env.PKPAY_SECRET_KEY!,
  merchantId: process.env.PKPAY_MERCHANT_ID!,
});
```

#### Checkout Sessions:

```typescript
// Create session
const session = await pkpay.checkoutSessions.create({
  amount: 49.99,
  currency: 'USD',
  customer: { email: 'buyer@example.com' },
});

// Verify session status
const verification = await pkpay.checkoutSessions.verify(session.session_id);
if (verification.status === 'paid') {
  // Fulfill order
}
```

#### Products & Prices:

```typescript
// Create Product with default price
const product = await pkpay.products.create({
  name: 'Premium Subscription',
  currency: 'USD',
  unit_amount: 4900, // $49.00 in cents
  sku: 'SUB-PREM',
});

// Add another currency price tier
const eurPrice = await pkpay.prices.create(product.id, {
  currency: 'EUR',
  unit_amount: 4500, // €45.00
});

// List products
const list = await pkpay.products.list({ page: 1, per_page: 10 });
```

#### Server Session Verification:

```typescript
app.post('/api/checkout/verify', express.json(), async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await pkpay.checkoutSessions.verify(sessionId);
    res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      amount: session.amount,
      currency: session.currency,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
```

---

### 3. React 19 SPA (`@pkpayplus/react`)

Install:

```bash
npm install @pkpayplus/react
```

Usage:

```tsx
import React, { useState } from 'react';
import {
  PKPayPlusProvider,
  usePKPayPlus,
  PKPayPlusButton,
  PKPayPlusDialog,
} from '@pkpayplus/react';

function App() {
  const { openDialog, closeDialog } = usePKPayPlus();

  return (
    <PKPayPlusProvider publishableKey="pk_live_xxxxxx">
      {/* 1. Drop-in Button */}
      <PKPayPlusButton
        createSessionEndpoint="/api/checkout"
        buttonText="Pay Now"
        onSuccess={(data) => console.log('Paid:', data.sessionId)}
      />

      {/* 2. Custom button */}
      <button
        onClick={async () => {
          const res = await fetch('/api/checkout', { method: 'POST' });
          const { iframe_url } = await res.json();
          openDialog({
            url: iframe_url,
            onSuccess: (data) => alert('Payment completed: ' + data.sessionId),
          });
        }}
      >
        Custom Pay Button
      </button>
    </PKPayPlusProvider>
  );
}
```

---

### 4. Vue 3 / Nuxt 3 (`@pkpayplus/vue`)

Install:

```bash
npm install @pkpayplus/vue
```

Usage:

```vue
<script setup lang="ts">
import { usePKPayPlus } from '@pkpayplus/vue';

const { openDialog, closeDialog } = usePKPayPlus();

async function handlePay() {
  const res = await fetch('/api/checkout', { method: 'POST' });
  const { iframe_url } = await res.json();

  openDialog({
    url: iframe_url,
    onSuccess: (data) => alert('Payment completed: ' + data.sessionId),
    onCancel: () => console.log('Dialog dismissed'),
  });
}
</script>

<template>
  <button @click="handlePay">Pay Now</button>
</template>
```

---

### 5. Svelte 4 & 5 (`@pkpayplus/svelte`)

Install:

```bash
npm install @pkpayplus/svelte
```

Usage:

```svelte
<script lang="ts">
  import { usePKPayPlus } from '@pkpayplus/svelte';

  const { openDialog, closeDialog } = usePKPayPlus();

  async function handlePay() {
    const res = await fetch('/api/checkout', { method: 'POST' });
    const { iframe_url } = await res.json();
    openDialog({ url: iframe_url });
  }
</script>

<button on:click={handlePay}>Pay with PKPay+</button>
```

---

### 6. Astro (`@pkpayplus/astro`)

Install:

```bash
npm install @pkpayplus/astro
```

Usage:

```astro
---
import { getPKPayPlusServer } from '@pkpayplus/astro';

let iframeUrl = '';
if (Astro.request.method === 'POST') {
  const pkpay = getPKPayPlusServer();
  const session = await pkpay.checkoutSessions.create({ amount: 25.00, currency: 'USD' });
  iframeUrl = session.iframe_url!;
}
---
```

---

### 7. Plain HTML & CDN Script Tag

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/@pkpayplus/sdk@latest/dist/cdn/pkpayplus.global.min.js"></script>
  </head>
  <body>
    <button id="pay-btn">Pay $25.00</button>

    <script>
      const pkpay = PKPayPlus.init({ publishableKey: 'pk_live_xxxxxx' });

      document.getElementById('pay-btn').onclick = async () => {
        const res = await fetch('/api/checkout', { method: 'POST' });
        const { iframe_url } = await res.json();

        pkpay.openDialog({
          url: iframe_url,
          onSuccess: (data) => alert('Payment completed! ' + data.sessionId),
          onCancel: () => console.log('Dialog closed')
        });
      };
    </script>
  </body>
</html>
```

---

## Contributing & Local Development

We welcome contributions! To test or contribute to the PKPay+ SDKs locally:

```bash
# Clone and install dependencies
pnpm install

# Run the test suites
pnpm test

# Build all packages locally
pnpm run build
```

---

## License

MIT © [PKPay+](https://pkpayplus.com)
