'use client'

import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import GoogleButton from '../ui/GoogleButton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'

function LoginForm() {
  const router = useRouter()
  const { user, loading, error, loginWithGoogle, isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Redirect to /home if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, redirecting to /home')
      router.push('/home')
    }
  }, [isAuthenticated, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle traditional email/password login logic
    console.log('Login data:', formData)
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      // The loginWithGoogle function will redirect to Google OAuth
    } catch (err) {
      console.error('Google login error:', err)
    }
  }

  return (
    <div className='flex items-center justify-end min-h-screen p-4 relative z-10 mr-[18rem]'>
      <div className='bg-white p-10 rounded-lg shadow-lg w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>Nisit Deeden System</h1>
        </div>

        {/* Form Title */}
        <h2 className='text-xl font-bold mb-6 text-primary'>LOG IN YOUR ACCOUNT</h2>

        {/* Error Message */}
        {error && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <div className='mb-6'>
          <GoogleButton 
            onClick={handleGoogleLogin} 
            disabled={loading}
            loading={loading}
          />
        </div>

        {/* Divider */}
        <div className='flex items-center my-6'>
          <div className='flex-1 border-t border-gray-300'></div>
          <span className='px-4 text-sm text-gray-500'>หรือ</span>
          <div className='flex-1 border-t border-gray-300'></div>
        </div>

        {/* Traditional Login Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label='อีเมล (@ku.th)'
            type='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            placeholder='example@ku.th'
            required
          />
          
          <Input
            label='รหัสผ่าน'
            type='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            placeholder='••••••••••••'
            required
          />

          <Button type='submit' disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </form>

        {/* Register Link */}
        <div className='mt-8 text-sm text-txt-primary text-center'>
          ยังไม่มีบัญชีผู้ใช้?{' '}
          <Link href='/register' className='text-primary font-medium underline hover:text-primary-hover'>
            ลงทะเบียน
          </Link>
        </div>

        {/* Forgot Password Link */}
        <div className='mt-4 text-sm text-center'>
          <Link href='/forgot-password' className='text-gray-600 hover:text-primary'>
            ลืมรหัสผ่าน?
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginForm