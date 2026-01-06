'use client'

import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Link from 'next/link'

function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    studentId: '',
    prefix: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle registration logic
    console.log('Register data:', formData)
  }

  return (
    <div className='flex items-center justify-end min-h-screen p-4 relative z-10 mr-[18rem]'>
      <div className='bg-white p-10 rounded-lg shadow-lg w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>Nisit Deeden System</h1>
        </div>

        {/* Form Title */}
        <h2 className='text-xl font-bold mb-6 text-primary'>Register</h2>

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
            label='ชื่อ (ไทย)'
            type='text'
            name='firstName'
            value={formData.firstName}
            onChange={handleChange}
            placeholder='ชื่อ'
            required
          />

          <Input
            label='นามสกุล (ไทย)'
            type='text'
            name='lastName'
            value={formData.lastName}
            onChange={handleChange}
            placeholder='นามสกุล'
            required
          />

          <Input
            label='รหัสนิสิต (10 หลัก)'
            type='text'
            name='studentId'
            value={formData.studentId}
            onChange={handleChange}
            placeholder='xxxxxxxxxx'
            required
          />

          <Button type='submit'>ยืนยัน</Button>
        </form>

        {/* Back to Login Link */}
        <div className='mt-4 text-center'>
          <Link 
            href='/login' 
            className='text-primary text-sm hover:text-primary-hover flex items-center justify-center gap-2'
          >
            <span>←</span>
            <span>กลับ</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm