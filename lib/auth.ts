import { User } from "@/types/user.type";

function login(email: string, password: string): Promise<User> {
  // Perform login logic here
  return Promise.resolve({
    user_id: "1",
    email,
    role: "student",
    fname: "John",
    lname: "Doe",
    department: "Computer Science",
  });
}

export { login };
