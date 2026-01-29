'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'

function HomePage() {
  const router = useRouter()
  const { user, loading, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              ยินดีต้อนรับสู่ระบบ Nisit Deeden
            </h1>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              ข้อมูลผู้ใช้งาน
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-1">ชื่อ</p>
                <p className="font-semibold text-gray-800">{user.first_name}</p>
                <p className="text-sm text-gray-600 mb-1">นามสกุล</p>
                <p className="font-semibold text-gray-800">{user.last_name}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-1">อีเมล</p>
                <p className="font-semibold text-gray-800">{user.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-1">บทบาท</p>
                <p className="font-semibold text-gray-800 capitalize">{user.role}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-1">ประเภทบัญชี</p>
                <p className="font-semibold text-gray-800">
                  {user.provider === 'google' ? 'Google OAuth' : 'Local Account'}
                </p>
              </div>
            </div>

            {user.is_oauth && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">✓</span> คุณเข้าสู่ระบบผ่าน Google OAuth
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              เมนูหลัก
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">📄 เอกสาร</h3>
                <p className="text-sm text-gray-600">จัดการเอกสารของคุณ</p>
              </div>
              
              <div className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">👤 โปรไฟล์</h3>
                <p className="text-sm text-gray-600">แก้ไขข้อมูลส่วนตัว</p>
              </div>
              
              <div className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">⚙️ ตั้งค่า</h3>
                <p className="text-sm text-gray-600">ปรับแต่งระบบ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage