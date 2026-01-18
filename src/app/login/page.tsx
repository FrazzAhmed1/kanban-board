'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  useSignInEmailPassword,
  useAuthenticationStatus
} from '@nhost/nextjs'

export default function LoginPage() {
  const router = useRouter()

  const { isAuthenticated, isLoading: authLoading } =
    useAuthenticationStatus()
    new
  const {
    signInEmailPassword,
    isLoading,
    error
  } = useSignInEmailPassword()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/boards')
    }
  }, [isAuthenticated, router])

 async function loginLogic() {
  const result = await signInEmailPassword(email, password)

  if (result?.isSuccess || result?.error?.error === 'already-signed-in') {
    router.push('/boards')
  }
}


  if (authLoading) return <p>Checking auth…</p>

  return (
    <div style={{ padding: '2rem', maxWidth: '400px' }}>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />

      <button onClick={loginLogic} disabled={isLoading}>
        {isLoading ? 'Logging in…' : 'Login'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          {error.message}
        </p>
      )}
    </div>
  )
}
