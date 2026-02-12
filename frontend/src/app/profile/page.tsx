'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard which shows the demo profile
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
    </div>
  );
}
