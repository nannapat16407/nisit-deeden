'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useAuth from '@/hooks/useAuth'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkAuth } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('กำลังเข้าสู่ระบบ...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage(`เกิดข้อผิดพลาด: ${error}`)
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        if (!code || !state) {
          setStatus('error')
          setMessage('ข้อมูลการยืนยันตัวตนไม่ถูกต้อง')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        // Wait a bit for the backend to set the cookie
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check authentication status
        await checkAuth()
        
        setStatus('success')
        setMessage('เข้าสู่ระบบสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...')
        
        // Redirect to /home
        setTimeout(() => router.push('/home'), 1500)
      } catch (err) {
        console.error('Callback error:', err)
        setStatus('error')
        setMessage('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, router, checkAuth])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
          )}
          {status === 'success' && (
            <div className="text-green-500">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="text-red-500">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {status === 'loading' && 'กำลังดำเนินการ'}
          {status === 'success' && 'สำเร็จ!'}
          {status === 'error' && 'เกิดข้อผิดพลาด'}
        </h2>
        
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}
