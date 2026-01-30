import { User } from "@/types/user.type";

function login(email: string, password: string): Promise<User> {
  // Perform login logic here
  return Promise.resolve({
    id: "1",
    email,
    role: "student",
    first_name: "John",
    last_name: "Doe",
    department: "Computer Science",
  });
}

export { login };
