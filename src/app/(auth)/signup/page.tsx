import { Suspense } from 'react';
import { AuthPageForm } from '@/components/auth/auth-page-form';

// AuthPageForm reads ?email=... via useSearchParams to prefill the
// email field after a contextual redirect (e.g. login → "Create an
// account"). Next 15 requires that to live inside a Suspense
// boundary during prerender or the build bails out.
export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageForm mode="signup" />
    </Suspense>
  );
}
