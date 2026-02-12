'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to auth page for demo registration
    router.push('/auth');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <p className="text-gray-600 dark:text-gray-400">Redirecting to registration...</p>
    </div>
  );
}
