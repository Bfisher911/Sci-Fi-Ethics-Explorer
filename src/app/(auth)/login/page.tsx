import { Suspense } from 'react';
import { AuthPageForm } from '@/components/auth/auth-page-form';

// AuthPageForm reads ?email=... via useSearchParams to prefill the
// email field after a contextual redirect (e.g. signup → "Go to log
// in"). Next 15 requires that to live inside a Suspense boundary
// during prerender or the build bails out.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageForm mode="login" />
    </Suspense>
  );
}
