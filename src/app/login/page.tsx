'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSignInEmailPassword } from '@nhost/nextjs'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const router = useRouter()

  const {
    signInEmailPassword,
    isLoading,
    error
  } = useSignInEmailPassword()

  async function loginLogic() {
    
    const result = await signInEmailPassword(email, password)

    if (result?.isSuccess) {
      
      router.push('/boards')
    } else {
      
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Sign in to Kanban
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={loginLogic}
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Logging in…' : 'Login'}
          </button>

          {error && (
            <p className="text-sm text-red-600 text-center">
              {error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
