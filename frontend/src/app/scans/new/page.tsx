"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const providers = [
  {
  value: "AWS",
  label: "Amazon Web Services",
  color: "border-orange-500 bg-orange-950/30",
  icon: (
    <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" className="w-12 h-7 object-contain" alt="AWS" />
  ),
},
{
  value: "Azure",
  label: "Microsoft Azure",
  color: "border-blue-500 bg-blue-950/30",
  icon: (
    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" className="w-8 h-7 object-contain" alt="Azure" />
  ),
},
{
  value: "GCP",
  label: "Google Cloud",
  color: "border-red-500 bg-red-950/30",
  icon: (
    <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Google-cloud-platform.svg" className="w-10 h-7 object-contain" alt="GCP" />
  ),
},
]

export default function CreateScan() {
  const [cloudProvider, setCloudProvider] = useState<string>("AWS")
  const [accountId, setAccountId] = useState<string>("")
  const [accountName, setAccountName] = useState<string>("")
  const [profile, setProfile] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!accountId.trim() || !accountName.trim()) {
      setError("Account ID and Account Name are required.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch('http://localhost:8000/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cloud_provider: cloudProvider,
          account_id: accountId,
          account_name: accountName,
          profile: profile || undefined
        })
      });
      const data = await response.json();
      router.push(`/scans/${data.id}`);
    } catch {
      setError("Failed to create scan. Please try again.")
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-green-400 text-xs font-medium uppercase tracking-widest mb-1">New Scan</p>
          <h1 className="text-3xl font-bold text-white">Configure Scan</h1>
          <p className="text-gray-500 text-sm mt-1">Set up your cloud security scan parameters</p>
        </div>

        {/* Cloud Provider Selector */}
        <div className="space-y-3">
          <label className="block text-xs text-gray-400 uppercase tracking-wider">Cloud Provider</label>
          <div className="grid grid-cols-3 gap-3">
            {providers.map((p) => (
              <button
                key={p.value}
                onClick={() => setCloudProvider(p.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                  cloudProvider === p.value
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

        {/* Form Fields */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Account ID</label>
            <input
              type="text"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              placeholder="123456789012"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Account Name</label>
            <input
              type="text"
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
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
              value={profile}
              onChange={e => setProfile(e.target.value)}
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
            ) : "🔍 Start Scan"}
          </button>
        </div>

      </div>
    </div>
  )
}