import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'PKPay+ Official Next.js Reference Store',
  description: 'Production-ready Next.js App Router and Server Actions reference integration for PKPay+',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isConfigured = Boolean(
    process.env.PKPAY_SECRET_KEY && process.env.PKPAY_MERCHANT_ID
  );

  const isTestKey =
    process.env.PKPAY_SECRET_KEY?.startsWith('sk_test_') ||
    process.env.NEXT_PUBLIC_PKPAY_KEY?.startsWith('pk_test_') ||
    process.env.PKPAY_MODE === 'test';

  const mode = isTestKey ? 'test' : 'live';

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 antialiased font-sans">
        <Navbar isConfigured={isConfigured} mode={mode} />
        <Providers>
          <div className="flex-1">{children}</div>
        </Providers>

        {/* Real E-Commerce Footer */}
        <footer className="border-t border-slate-200 bg-white py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                    PK
                  </div>
                  <span className="font-extrabold text-slate-900 text-lg">
                    PKPay<span className="text-blue-600">+</span>
                  </span>
                </div>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                  The developer-first payment infrastructure for modern web applications.
                  Secure, flexible, and built for Next.js App Router.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Integration
                </h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li>
                    <a href="https://github.com/pkpayplus-com/pkpayplus-js" className="hover:text-blue-600 transition">
                      SDK Repository
                    </a>
                  </li>
                  <li>
                    <a href="https://dashboard.pkpayplus.com" className="hover:text-blue-600 transition">
                      Merchant Dashboard
                    </a>
                  </li>
                  <li>
                    <span className="text-slate-400">Server Actions Architecture</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Security
                </h4>
                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Server-Side Price Validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Zero Secret Key Leakage</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
              <p>© {new Date().getFullYear()} PKPay+ Official Reference Store. MIT License.</p>
              <div className="flex items-center gap-4">
                <span>Next.js 16</span>
                <span>•</span>
                <span>React 19</span>
                <span>•</span>
                <span>Tailwind CSS v4</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
