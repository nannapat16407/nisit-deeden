import LoginForm from '@/components/auth/LoginForm'
import HalfBackground from '@/components/ui/HalfBackground'
import { } from '@/constants/route'

function LoginPage() {
  return (
    <div className='relative h-screen'>
      <HalfBackground />
      <LoginForm />
    </div>
  )
}

export default LoginPage