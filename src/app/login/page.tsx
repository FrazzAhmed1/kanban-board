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
    console.log('--- LOGIN ATTEMPT ---')
    console.log('Email:', email)

    const result = await signInEmailPassword(email, password)

    console.log('Result:', result)
    console.log('Hook error:', error)

    if (result?.isSuccess) {
      console.log('LOGIN SUCCESS → redirecting')
      router.push('/boards')
    } else {
      console.log('LOGIN FAILED')
    }
  }

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
          Error: {error.message}
        </p>
      )}
    </div>
  )
}
