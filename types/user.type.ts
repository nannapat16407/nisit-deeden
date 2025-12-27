type User = {
  id: string
  email: string
  role: 'student' | 'officer' | 'admin' | 'dean'
  name: string
  age: number
  grade: string
  department: string
  major: string
}

export type { User };