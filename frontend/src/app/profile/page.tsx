"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getMe, updateProfile, updatePassword, updateAvatar } from "@/lib/api"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    getMe().then((u) => {
      setUser(u)
      setFullName(u.full_name || "")
      setEmail(u.email || "")
    })
  }, [])

  async function handleProfileSave() {
    setProfileMsg(null)
    setProfileError(null)
    try {
      const res = await updateProfile({ full_name: fullName, email })
      if (res) setProfileMsg("Profile updated successfully!")
      else setProfileError("Failed to update profile.")
    } catch (e: any) {
      setProfileError(e.message || "Failed to update profile.")
    }
  }

  async function handlePasswordSave() {
    setPasswordMsg(null)
    setPasswordError(null)
    if (!currentPassword || !newPassword) {
      setPasswordError("Both fields are required.")
      return
    }
    try {
      await updatePassword(currentPassword, newPassword)
      setPasswordMsg("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
    } catch {
      setPasswordError("Current password is incorrect.")
    }
  }

async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async () => {
    const img = new Image()
    img.onload = async () => {
    const canvas = document.createElement("canvas")
    const MAX = 256
    const scale = Math.min(MAX / img.width, MAX / img.height, 1)
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const base64 = canvas.toDataURL("image/jpeg", 0.8)
    try {
      await updateAvatar(base64)
      setUser((prev: any) => ({ ...prev, avatar: base64 }))
      setProfileMsg("Photo updated successfully!")
      window.dispatchEvent(new Event("avatar-updated"))
    } catch {
      setProfileError("Failed to update photo.")
    }
  }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
}

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.email?.[0].toUpperCase() ?? "?"

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>

        {/* Avatar Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-6">
          <div className="relative">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border-4 border-green-500" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-2xl">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-gray-700 hover:bg-gray-600 rounded-full p-1.5 border border-gray-600 transition"
            >
              📷
            </button>
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.full_name || "User"}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-green-400 hover:underline"
            >
              Change photo
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* Profile Info Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Personal Info</h2>

          {profileMsg && <div className="bg-green-900/40 border border-green-500 text-green-400 text-sm rounded-lg px-4 py-3">{profileMsg}</div>}
          {profileError && <div className="bg-red-900/40 border border-red-500 text-red-400 text-sm rounded-lg px-4 py-3">{profileError}</div>}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={handleProfileSave}
            className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg text-sm transition"
          >
            Save Changes
          </button>
        </div>

        {/* Password Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Change Password</h2>

          {passwordMsg && <div className="bg-green-900/40 border border-green-500 text-green-400 text-sm rounded-lg px-4 py-3">{passwordMsg}</div>}
          {passwordError && <div className="bg-red-900/40 border border-red-500 text-red-400 text-sm rounded-lg px-4 py-3">{passwordError}</div>}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={handlePasswordSave}
            className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg text-sm transition"
          >
            Update Password
          </button>
        </div>

      </div>
    </div>
  )
}