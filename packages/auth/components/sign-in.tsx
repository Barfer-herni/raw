'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const SignIn = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the application sign-in page
    router.push('/sign-in');
  }, [router]);

  return null;
};
