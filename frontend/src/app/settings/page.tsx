"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cloudsecure-production.up.railway.app';

interface Account {
  id: number
  cloud_provider: string
  account_id: string
  account_name: string
  profile: string | null
  created_at: string
}

const providerLogo: Record<string, string> = {
  AWS: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
  Azure: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg",
  GCP: "https://upload.wikimedia.org/wikipedia/commons/0/01/Google-cloud-platform.svg",
}

const providerBorder: Record<string, string> = {
  AWS: "border-orange-500 bg-orange-950/30",
  Azure: "border-blue-500 bg-blue-950/30",
  GCP: "border-red-500 bg-red-950/30",
}

export default function SettingsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [cloudProvider, setCloudProvider] = useState("AWS")
  const [accountId, setAccountId] = useState("")
  const [accountName, setAccountName] = useState("")
  const [profile, setProfile] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchAccounts = () => {
    const token = localStorage.getItem("token")
    fetch(`${API_URL}/accounts`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setAccounts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchAccounts()
  }, [])

  const handleAdd = async () => {
    if (!accountId || !accountName) return
    setSaving(true)
    const token = localStorage.getItem("token")
    await fetch(`${API_URL}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        cloud_provider: cloudProvider,
        account_id: accountId,
        account_name: accountName,
        profile: profile || null,
      }),
    })
    setAccountId("")
    setAccountName("")
    setProfile("")
    setSaving(false)
    fetchAccounts()
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    const token = localStorage.getItem("token")
    await fetch(`${API_URL}/accounts/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
    setDeletingId(null)
    fetchAccounts()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-green-400 text-xs font-medium uppercase tracking-widest mb-1">Settings</p>
          <h1 className="text-3xl font-bold text-white">Cloud Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your connected cloud provider accounts</p>
        </div>

        {/* Add Account */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Add Cloud Account</h2>

          {/* Provider Selector */}
          <div className="grid grid-cols-3 gap-3">
            {["AWS", "Azure", "GCP"].map((p) => (
              <button
                key={p}
                onClick={() => setCloudProvider(p)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                  cloudProvider === p ? providerBorder[p] : "border-gray-800 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <img src={providerLogo[p]} className="h-6 object-contain" alt={p} />
                <span className="text-xs font-semibold text-white">{p}</span>
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Account ID</label>
              <input
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                placeholder="123456789012"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Account Name</label>
              <input
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                placeholder="Production AWS"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                Profile <span className="text-gray-600 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                value={profile}
                onChange={e => setProfile(e.target.value)}
                placeholder="default"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={saving || !accountId || !accountName}
            className="px-6 py-3 bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition shadow-lg shadow-green-900/40"
          >
            {saving ? "Adding..." : "+ Add Account"}
          </button>
        </div>

        {/* Accounts List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Connected Accounts</h2>

          {loading ? (
            <p className="text-green-400 animate-pulse text-center py-8">Loading accounts...</p>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">☁️</p>
              <p className="text-gray-500">No accounts added yet</p>
              <p className="text-gray-600 text-sm mt-1">Add your first cloud account above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map(account => (
                <div key={account.id} className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition">
                  <img
                    src={providerLogo[account.cloud_provider]}
                    className="h-6 w-10 object-contain shrink-0"
                    alt={account.cloud_provider}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{account.account_name}</p>
                    <p className="text-xs text-gray-500 font-mono">{account.account_id}</p>
                  </div>
                  <div className="text-xs text-gray-500 shrink-0">
                    {account.profile ?? "default"}
                  </div>
                  <div className="text-xs text-gray-600 shrink-0">
                    {new Date(account.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleDelete(account.id)}
                    disabled={deletingId === account.id}
                    className="text-red-400 hover:text-red-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-900 hover:border-red-700 transition disabled:opacity-50"
                  >
                    {deletingId === account.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}