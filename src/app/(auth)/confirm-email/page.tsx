import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ConfirmEmailPage() {
  return (
    <Card className="text-center">
      <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100">
        <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Check your email</h2>
      <p className="text-sm text-slate-500 mb-6">
        We&apos;ve sent you a confirmation link. Please check your email and click the link to verify
        your account.
      </p>
      <p className="text-xs text-slate-400 mb-6">
        Didn&apos;t receive the email? Check your spam folder or try signing up again.
      </p>
      <Link href="/login">
        <Button variant="outline" className="w-full">
          Back to Sign In
        </Button>
      </Link>
    </Card>
  );
}
