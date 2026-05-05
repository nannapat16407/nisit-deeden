import LoginForm from '@/components/auth/LoginForm'

function LoginPage() {
  return (
    <div className='flex min-h-screen'>
      {/* Left panel — green background */}
      <div className='hidden lg:flex w-1/2 bg-primary flex-col items-center justify-center p-12'>
        {/* Logo box */}
        <div className='bg-white rounded-3xl w-52 h-52 flex flex-col items-center justify-center mb-10 shadow-lg'>
          <span className='text-5xl font-extrabold text-primary tracking-wide'>KU</span>
          <div className='h-1 w-24 bg-yellow-400 my-3 rounded-full' />
          <span className='text-5xl font-extrabold text-gray-900 tracking-wide'>DD</span>
        </div>

        {/* Text */}
        <div className='text-center text-white'>
          <h1 className='text-3xl font-bold mb-2'>Nisit Deeden</h1>
          <p className='text-sm opacity-90'>Online Document Outstanding Student Award</p>
          <p className='text-sm opacity-90'>Submission System</p>
        </div>
      </div>

      {/* Right panel — white background */}
      <div className='w-full lg:w-1/2 flex items-center justify-center bg-white'>
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
