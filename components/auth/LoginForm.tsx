'use client'

import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Link from 'next/link'

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle login logic
    console.log('Login data:', formData)
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

        {/* Form */}
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

          <Button type='submit'>เข้าสู่ระบบ</Button>
        </form>

        {/* Register Link */}
        <div className='mt-8 text-sm text-txt-primary text-center'>
          ยังไม่มีบัญชีผู้ใช้?{' '}
          <Link href='/register' className='text-primary font-medium underline hover:text-primary-hover'>
            ลงทะเบียน
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginForm