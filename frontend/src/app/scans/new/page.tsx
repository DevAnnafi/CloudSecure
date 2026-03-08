"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cloudsecure-production.up.railway.app';

interface Account {
  id: number;
  cloud_provider: string;
  account_id: string;
  account_name: string;
  profile?: string;
}

const providers = [
  {
    value: "AWS",
    label: "Amazon Web Services",
    color: "border-orange-500 bg-orange-950/30",
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" className="w-12 h-7 object-contain" alt="AWS" />,
  },
  {
    value: "Azure",
    label: "Microsoft Azure",
    color: "border-blue-500 bg-blue-950/30",
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" className="w-8 h-7 object-contain" alt="Azure" />,
  },
  {
    value: "GCP",
    label: "Google Cloud",
    color: "border-red-500 bg-red-950/30",
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Google-cloud-platform.svg" className="w-10 h-7 object-contain" alt="GCP" />,
  },
]

const providerIcons: Record<string, string> = {
  AWS: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
  Azure: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg",
  GCP: "https://upload.wikimedia.org/wikipedia/commons/0/01/Google-cloud-platform.svg",
}

export default function CreateScan() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [cloudProvider, setCloudProvider] = useState<string>("AWS")
  const [accountId, setAccountId] = useState<string>("")
  const [accountName, setAccountName] = useState<string>("")
  const [profile, setProfile] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetch(`${API_URL}/accounts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setAccounts(data))
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    const isManual = !selectedAccount
    if (isManual && (!accountId.trim() || !accountName.trim())) {
      setError("Account ID and Account Name are required.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) { setError("You must be logged in."); return }

      const body = selectedAccount
        ? {
            cloud_provider: selectedAccount.cloud_provider,
            account_id: selectedAccount.account_id,
            account_name: selectedAccount.account_name,
            profile: selectedAccount.profile
          }
        : {
            cloud_provider: cloudProvider,
            account_id: accountId,
            account_name: accountName,
            profile: profile || undefined
          }

      const response = await fetch(`${API_URL}/scans/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(err)
      }

      const data = await response.json()
      router.push(`/scans/${data.id}`)
    } catch {
      setError("Failed to create scan. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-green-400 text-xs font-medium uppercase tracking-widest mb-1">New Scan</p>
          <h1 className="text-3xl font-bold text-white">Configure Scan</h1>
          <p className="text-gray-500 text-sm mt-1">Set up your cloud security scan parameters</p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Saved Accounts */}
        {accounts.length > 0 && (
          <div className="space-y-3">
            <label className="block text-xs text-gray-400 uppercase tracking-wider">Saved Accounts</label>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2">
              {accounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccount(selectedAccount?.id === account.id ? null : account)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl border transition text-left ${
                    selectedAccount?.id === account.id
                      ? account.cloud_provider === 'AWS' ? 'border-orange-500 bg-orange-950/30' :
                        account.cloud_provider === 'Azure' ? 'border-blue-500 bg-blue-950/30' :
                        'border-red-500 bg-red-950/30'
                      : 'border-gray-800 hover:border-gray-600 bg-gray-800/40'
                  }`}
                >
                  <img src={providerIcons[account.cloud_provider]} className="w-8 h-6 object-contain shrink-0" alt={account.cloud_provider} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{account.account_name}</p>
                    <p className="text-gray-500 text-xs font-mono">{account.account_id}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    account.cloud_provider === 'AWS' ? 'bg-orange-900/50 text-orange-400' :
                    account.cloud_provider === 'Azure' ? 'bg-blue-900/50 text-blue-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {account.cloud_provider}
                  </span>
                  {selectedAccount?.id === account.id && (
                    <span className="text-green-400 text-xs font-bold">Selected</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-gray-600 text-xs">
              <div className="flex-1 h-px bg-gray-800" />
              or configure manually below
              <div className="flex-1 h-px bg-gray-800" />
            </div>
          </div>
        )}

        {/* Cloud Provider Selector */}
        <div className="space-y-3">
          <label className="block text-xs text-gray-400 uppercase tracking-wider">Cloud Provider</label>
          <div className="grid grid-cols-3 gap-3">
            {providers.map((p) => (
              <button
                key={p.value}
                onClick={() => { setCloudProvider(p.value); setSelectedAccount(null) }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                  cloudProvider === p.value && !selectedAccount
                    ? p.color
                    : "border-gray-800 bg-gray-900 hover:border-gray-600"
                }`}
              >
                {p.icon}
                <span className="text-sm font-semibold text-white">{p.value}</span>
                <span className="text-xs text-gray-500 text-center leading-tight">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Form Fields */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Account ID</label>
            <input
              type="text"
              value={selectedAccount ? selectedAccount.account_id : accountId}
              onChange={e => { setAccountId(e.target.value); setSelectedAccount(null) }}
              placeholder="123456789012"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Account Name</label>
            <input
              type="text"
              value={selectedAccount ? selectedAccount.account_name : accountName}
              onChange={e => { setAccountName(e.target.value); setSelectedAccount(null) }}
              placeholder="Production AWS"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              Profile <span className="text-gray-600 normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={selectedAccount ? (selectedAccount.profile || "") : profile}
              onChange={e => { setProfile(e.target.value); setSelectedAccount(null) }}
              placeholder="default"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/scans')}
            className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl text-sm transition border border-gray-700"
          >
            ← Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition shadow-lg shadow-green-900/40"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Starting scan...
              </span>
            ) : "Start Scan"}
          </button>
        </div>

      </div>
    </div>
  )
}