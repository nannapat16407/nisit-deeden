import Button from '../ui/Button'
import Input from '../ui/Input'

function LoginForm() {
  return (
    <>
      <div className='text-2xl font-bold mb-4 text-txt-primary'>LoginForm</div>
      <Button>Login</Button>
      <Input>email</Input>
      <Input>password</Input>
    </>
  )
}

export default LoginForm