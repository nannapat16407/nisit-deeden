import RegisterForm from '@/components/auth/RegisterForm'
import HalfBackground from '@/components/ui/HalfBackground'

function RegisterPage() {
  return (
    <div className='relative min-h-screen'>
      <HalfBackground />
      <RegisterForm />
    </div>
  )
}

export default RegisterPage