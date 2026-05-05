'use client'

import { useEffect } from 'react'
import GoogleButton from '../ui/GoogleButton'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'

function LoginForm() {
  const router = useRouter()
  const { user, loading, error, loginWithGoogle, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/home')
    }
  }, [isAuthenticated, user, router])

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (err) {
      console.error('Google login error:', err)
    }
  }

  return (
    <div className='w-full max-w-[460px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-10 py-12'>
      {/* Header */}
      <div className='text-center mb-10'>
        <h1 className='text-3xl font-bold text-gray-800 mb-3'>
          Nisit Deeden
        </h1>
        <p className='text-gray-400 text-sm font-medium tracking-wide uppercase'>
          Online Document Outstanding Student Award
        </p>
      </div>

      {/* Login heading */}
      <h2 className='text-lg font-semibold text-primary mb-8'>
        LOG IN YOUR ACCOUNT
      </h2>

      {/* Error */}
      {error && (
        <div className='mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg'>
          {error}
        </div>
      )}

      {/* Google button */}
      <GoogleButton
        onClick={handleGoogleLogin}
        disabled={loading}
        loading={loading}
      />
    </div>
  )
}

export default LoginForm
