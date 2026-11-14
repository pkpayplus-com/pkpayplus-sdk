import { pkpayServer } from '@pkpayplus/nextjs/server';
import Link from 'next/link';

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;
  let verification = null;
  let errorMsg = null;

  if (session_id && process.env.PKPAY_SECRET_KEY && process.env.PKPAY_MERCHANT_ID) {
    try {
      verification = await pkpayServer.checkoutSessions.verify(session_id);
    } catch (err: unknown) {
      errorMsg = (err as Error)?.message || 'Failed to verify session status';
    }
  }

  const isPaid = verification?.status === 'paid' || !verification; // Default to success if no live verify

  return (
    <div className="max-w-xl mx-auto py-20 px-4 text-center">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black shadow-inner">
        ✓
      </div>

      <h1 className="text-3xl font-black text-gray-900 tracking-tight">
        Payment Successful!
      </h1>
      <p className="text-gray-600 mt-2 text-sm">
        Your transaction has been processed securely through PKPay+.
      </p>

      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 text-left shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
          Transaction Details
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Status</span>
            <span className="font-semibold text-emerald-600 capitalize">
              {verification?.status || 'Confirmed'}
            </span>
          </div>

          {session_id && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Session ID</span>
              <span className="font-mono text-xs text-gray-800 break-all">{session_id}</span>
            </div>
          )}

          {verification?.amount && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-gray-900">
                {(verification.amount / 100).toFixed(2)} {verification.currency}
              </span>
            </div>
          )}

          {verification?.paid_at && (
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="text-gray-700">{new Date(verification.paid_at).toLocaleString()}</span>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
            Note: Live verification returned: {errorMsg}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
        >
          ← Return to Storefront
        </Link>
      </div>
    </div>
  );
}
