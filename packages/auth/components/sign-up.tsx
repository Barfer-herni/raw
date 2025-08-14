'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const SignUp = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the application sign-up page
    router.push('/sign-up');
  }, [router]);

  return null;
};
