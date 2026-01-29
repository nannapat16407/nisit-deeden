import { User } from "@/types/user.type"
import { ROUTES_BY_ROLE } from "@/constants/route"

function Navbar({ first_name, last_name, role }: User) {
  const navigationLinks = ROUTES_BY_ROLE[role as keyof typeof ROUTES_BY_ROLE]

  return (
    <nav className="bg-white px-10 py-4 flex items-center justify-between">
      {/* LEFT - Logo */}
      <div className="flex items-center gap-3">
        <img src="/ku-logo.png" alt="KU Logo" className="h-8 w-8" />
        <span className="font-semibold text-green-700">Kasetsart University</span>
      </div>

      {/* CENTER - Navigation */}
      <div className="bg-white shadow-lg rounded-full px-10 py-3">
        <ul className="flex items-center gap-14 text-gray-600 font-medium">
          <li className="cursor-pointer font-bold hover:text-green-600">Home</li>
          <li className="cursor-pointer font-bold text-white bg-primary px-5 py-2 rounded-full">
            Documents
          </li>
          <li className="cursor-pointer font-bold hover:text-green-600">
            Track Status
          </li>
        </ul>
      </div>

      {/* RIGHT - Profile */}
      <div className="flex items-center gap-3 cursor-pointer">
        <img
          src="/profile.jpg"
          alt="Profile"
          className="h-10 w-10 rounded-full object-cover"
        />

        <div className="leading-tight">
          <p className="font-semibold text-gray-800">{first_name} {last_name}</p>
          <span className="inline-block text-xs font-semibold text-gray-700 bg-yellow-300 px-3 py-0.5 rounded-full">
            {role}
          </span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar