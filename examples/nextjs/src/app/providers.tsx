'use client';

import { PKPayPlusProvider } from '@pkpayplus/react';
import type React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_PKPAY_PUBLISHABLE_KEY || 'pk_test_sample_key';

  return (
    <PKPayPlusProvider publishableKey={publishableKey}>
      {children}
    </PKPayPlusProvider>
  );
}
