import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-xl mx-auto py-20 px-4 text-center">
      <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black">
        ✕
      </div>

      <h1 className="text-3xl font-black text-gray-900 tracking-tight">
        Checkout Cancelled
      </h1>
      <p className="text-gray-600 mt-2 text-sm">
        The checkout was cancelled and no charges were made.
      </p>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition"
        >
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}
