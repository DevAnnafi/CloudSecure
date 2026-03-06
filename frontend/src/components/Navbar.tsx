"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem("token")
    router.push("/login")
}

  if (pathname === "/login" || pathname === "/register") return null

  
  return (
    <nav className="bg-gray-900 text-white px-8 py-4 flex items-center justify-between shadow">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold tracking-tight">CloudSecure</span>
      </div>
      <div className="flex gap-6 text-sm font-medium">
        <Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link>
        <Link href="/" className="hover:text-green-400 transition-colors">Scans</Link>
        <Link href="/settings" className="hover:text-green-400 transition-colors">Settings</Link>
      </div>
      <button
        onClick={handleLogout}
        className="hover:text-red-400 transition-colors text-sm font-medium"
        >
        Logout
        </button>
    </nav>
  )
}

