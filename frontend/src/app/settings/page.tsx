"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Account {
  id: number
  cloud_provider: string
  account_id: string
  account_name: string
  profile: string | null
  created_at: string
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

  const fetchAccounts = () => {
    fetch("http://localhost:8000/accounts")
      .then(res => res.json())
      .then(data => {
        setAccounts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  useEffect(() => {
  const token = localStorage.getItem("token")
  if (!token) {
    router.push("/login")
  }
}, [])

  const handleAdd = async () => {
    if (!accountId || !accountName) return
    setSaving(true)
    await fetch("http://localhost:8000/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    await fetch(`http://localhost:8000/accounts/${id}`, { method: "DELETE" })
    fetchAccounts()
  }

  const providerColor = (p: string) =>
    p === "AWS" ? "bg-orange-100 text-orange-700" :
    p === "Azure" ? "bg-blue-100 text-blue-700" :
    "bg-red-100 text-red-700"

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

      {/* Add Account */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Cloud Account</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Cloud Provider</label>
            <select
              value={cloudProvider}
              onChange={e => setCloudProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AWS">AWS</option>
              <option value="Azure">Azure</option>
              <option value="GCP">GCP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Account ID</label>
            <input
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              placeholder="123456789012"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Account Name</label>
            <input
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              placeholder="Production AWS"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Profile (Optional)</label>
            <input
              value={profile}
              onChange={e => setProfile(e.target.value)}
              placeholder="default"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={saving || !accountId || !accountName}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? "Adding..." : "Add Account"}
        </button>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Cloud Accounts</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : accounts.length === 0 ? (
          <p className="text-gray-400">No accounts added yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="pb-2">Provider</th>
                <th className="pb-2">Account ID</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Profile</th>
                <th className="pb-2">Added</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr key={account.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${providerColor(account.cloud_provider)}`}>
                      {account.cloud_provider}
                    </span>
                  </td>
                  <td className="py-2 text-gray-600 font-mono">{account.account_id}</td>
                  <td className="py-2 text-gray-800">{account.account_name}</td>
                  <td className="py-2 text-gray-500">{account.profile ?? "default"}</td>
                  <td className="py-2 text-gray-400">{new Date(account.created_at).toLocaleDateString()}</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}