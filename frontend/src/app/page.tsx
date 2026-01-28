'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authStorage } from '@/lib/auth';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = authStorage.getToken();
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return <LandingPage />;
}
