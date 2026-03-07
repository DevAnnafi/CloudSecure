"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function Login() { 
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    async function handleLogin() {
        try {
            setLoading(true)
            const response = await fetch("https://cloud-secure-2kuhbpxtn-devannafis-projects.vercel.app/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            })

            if (!response.ok) {
                setError("Invalid email or password")
                return
            }

            const data = await response.json()
            
            localStorage.setItem("token", data.access_token)

            router.push("/dashboard")
        }

        catch {
            setError("Something went wrong")
        }

        finally {
            setLoading(false)

        }
            
    }

    return (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md shadow-2xl">
      
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mt-3">CloudSecure</h1>
        <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-500 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold rounded-lg text-sm transition mt-2"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        Don't have an account?{" "}
        <a href="/register" className="text-green-400 hover:underline">Register</a>
      </p>

    </div>
  </div>

)

}


