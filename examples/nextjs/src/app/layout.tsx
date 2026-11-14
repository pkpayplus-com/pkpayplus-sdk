import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import { Inter, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geistMono = Geist_Mono({subsets:['latin'],variable:'--font-mono'});

const interHeading = Inter({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-mono", inter.variable, interHeading.variable, geistMono.variable)}>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased font-sans">
        <Navbar isConfigured={isConfigured} mode={mode} />
        <Providers>
          <div className="flex-1">{children}</div>
        </Providers>

        {/* Minimalist Footer */}
        <footer className="border-t border-border/60 py-6 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
            <span>© {new Date().getFullYear()} PKPay+ Store</span>
            <div className="flex items-center gap-4">
              <Link
                href="https://dashboard.pkpayplus.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="https://github.com/pkpayplus-com/pkpayplus-js"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
