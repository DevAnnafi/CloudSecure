"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { getMe, getDashboard } from "@/lib/api"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dashData, setDashData] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  getMe().then(setUser).catch(() => null)
  getDashboard().then(setDashData).catch(() => null)

  function handleAvatarUpdate() {
    getMe().then(setUser).catch(() => null)
  }
  window.addEventListener("avatar-updated", handleAvatarUpdate)
  return () => window.removeEventListener("avatar-updated", handleAvatarUpdate)
}, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  function handleLogout() {
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (pathname === "/login" || pathname === "/register" || pathname === "/" || pathname === "/terms" || pathname === "/privacy" || pathname === "/cookies" || pathname === "/docs") return null

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.email?.[0].toUpperCase() ?? "?"

  const score = dashData?.security_score ?? null
  const scoreColor = score === null ? "#6b7280" : score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444"

  const lastScan = dashData?.recent_scans?.[0]
    ? new Date(dashData.recent_scans[0].started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null

  return (
    <nav className="bg-gray-900 text-white px-8 py-4 flex items-center justify-between shadow">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold tracking-tight">CloudSecure</span>
      </div>

      <div className="flex gap-6 text-sm font-medium">
        <Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link>
        <Link href="/scans" className="hover:text-green-400 transition-colors">Scans</Link>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="focus:outline-none"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-green-500" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm">
              {initials}
            </div>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-3 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">

            {/* Header */}
            <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-700">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-green-500" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{user?.full_name || "User"}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Security Score + Last Scan */}
            <div className="px-4 py-3 border-b border-gray-700 grid grid-cols-2 gap-3">
              <div className="bg-gray-900 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Security Score</p>
                <p className="text-2xl font-bold" style={{ color: scoreColor }}>
                  {score ?? "—"}
                </p>
                <p className="text-xs" style={{ color: scoreColor }}>
                  {score === null ? "No scans" : score >= 80 ? "Secure" : score >= 60 ? "Fair" : "At Risk"}
                </p>
              </div>
              <div className="bg-gray-900 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Last Scan</p>
                <p className="text-xs font-semibold text-white mt-2">
                  {lastScan ?? "Never"}
                </p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span></span> Profile Settings
              </Link>
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <span></span> Settings
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-700 py-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700 transition-colors"
              >
                <span>↩</span> Log Out
              </button>
            </div>

          </div>
        )}
      </div>
    </nav>
  )
}