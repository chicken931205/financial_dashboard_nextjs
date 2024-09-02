"use client";

import Link from 'next/link'
import { useEffect} from 'react'
import { useAppDispatch } from '@/store/useStore'
import { setPassword } from '@/store/slice';

export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const newPassword = 'password';
    dispatch(setPassword(newPassword));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to the Financial Dashboard</h1>
      <Link href="/dashboard" className="text-blue-500 hover:underline">
        Go to Dashboard
      </Link>
    </main>
  )
}
