import { User } from "@/types/user.type";

function login(email: string, password: string): Promise<User> {
  // Perform login logic here
  return Promise.resolve({
    id: "1",
    email,
    role: "student",
    name: "John Doe",
    age: 20,
    grade: "A",
    department: "Computer Science",
    major: "Software Engineering",
  });
}

export { login }