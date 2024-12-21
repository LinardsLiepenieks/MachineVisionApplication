import React from 'react';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function StartupScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/startup');
  }, []);

  return null;
}
