"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAppSelector, useAppDispatch } from '@/store/useStore';
import { setIsLogin } from '@/store/slice'

export default function Home() {
  const dispatch = useAppDispatch();
  const [passwordInput, setPasswordInput] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const isLogin = useAppSelector((state) => state.app.isLogin);
  const password = useAppSelector((state) => state.app.password);

  useEffect(() => {
    if (isLogin) {
      router.push('/');
    } 
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordInput === password) {
        router.push('/dashboard')
        console.log('Before update:', isLogin);
        dispatch(setIsLogin(true));
        console.log('After update:', isLogin);

    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to the Financial Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Please enter the password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
          </div>
          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Access Dashboard
            </Button>
          </div>
        </form>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}