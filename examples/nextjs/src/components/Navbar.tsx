import Link from 'next/link';

interface NavbarProps {
  isConfigured: boolean;
  mode?: string;
}

export function Navbar({ isConfigured, mode = 'test' }: NavbarProps) {
  const isSandbox = mode === 'test' || mode === 'sandbox';

  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      {/* Top Banner if in Sandbox Mode */}
      {isSandbox && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold py-1.5 px-4 text-center tracking-wide">
          <span>⚡ Sandbox Mode — You&apos;re testing with sandbox products & test payment simulation.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              PK
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xl tracking-tight block">
                PKPay<span className="text-blue-600">+</span> Store
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block -mt-0.5">
                Next.js App Router Demo
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/" className="text-blue-600 hover:text-blue-700 transition">
              All Products
            </Link>
            <a
              href="https://dashboard.pkpayplus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition flex items-center gap-1"
            >
              Merchant Dashboard ↗
            </a>
          </nav>
        </div>

        {/* Right Badges & Actions */}
        <div className="flex items-center gap-3">
          {isSandbox ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Sandbox Catalog
            </span>
          ) : isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Mode
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Demo Preview
            </span>
          )}

          <a
            href="https://github.com/pkpayplus-com/pkpayplus-js"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
          >
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
