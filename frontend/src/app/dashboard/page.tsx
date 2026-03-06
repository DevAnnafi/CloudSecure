"use client"

import { useEffect, useState } from "react"
import { getDashboard, getMe } from "@/lib/api"
import Link from "next/link"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart
} from "recharts"
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    getMe().then(setUser).catch(() => null)
    getDashboard()
      .then(setData)
      .catch((err) => { console.error("Dashboard fetch error:", err); setLoading(false) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-green-400 text-lg animate-pulse">Loading dashboard...</div>
    </div>
  )
  if (!data) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-red-400 text-lg">Failed to load dashboard.</div>
    </div>
  )

  const scoreColor =
    data.security_score >= 80 ? "#22c55e" :
    data.security_score >= 60 ? "#eab308" : "#ef4444"

  const scoreLabel =
    data.security_score >= 80 ? "Good" :
    data.security_score >= 60 ? "Fair" : "At Risk"

  const severityData = [
    { name: "Critical", value: data.severity.critical, color: "#ef4444" },
    { name: "High",     value: data.severity.high,     color: "#f97316" },
    { name: "Medium",   value: data.severity.medium,   color: "#eab308" },
    { name: "Low",      value: data.severity.low,       color: "#60a5fa" },
  ].filter(d => d.value > 0)

  const scoreTrendData = [...data.recent_scans]
    .reverse()
    .map((scan: any) => ({
      date: new Date(scan.started_at).toLocaleDateString(),
      score: scan.score ?? 0,
    }))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const metrics = [
    { label: "Security Score", value: data.security_score, sub: scoreLabel, color: scoreColor, bg: "from-green-950 to-gray-900", border: "border-green-800" },
    { label: "Total Findings", value: data.total_findings, sub: "issues detected", color: "#f1f5f9", bg: "from-gray-800 to-gray-900", border: "border-gray-700" },
    { label: "Critical", value: data.severity.critical, sub: "needs attention", color: "#ef4444", bg: "from-red-950 to-gray-900", border: "border-red-900" },
    { label: "High", value: data.severity.high, sub: "high severity", color: "#f97316", bg: "from-orange-950 to-gray-900", border: "border-orange-900" },
    { label: "Medium", value: data.severity.medium, sub: "medium severity", color: "#eab308", bg: "from-yellow-950 to-gray-900", border: "border-yellow-900" },
    { label: "Low", value: data.severity.low, sub: "low severity", color: "#60a5fa", bg: "from-blue-950 to-gray-900", border: "border-blue-900" },
    { label: "Total Scans", value: data.total_scans, sub: "scans run", color: "#a78bfa", bg: "from-purple-950 to-gray-900", border: "border-purple-900" },
  ]

  const displayName =
  user?.full_name || user?.email?.split("@")[0]

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-green-400 text-sm font-medium uppercase tracking-widest mb-1">Security Dashboard</p>
          <h1 className="text-3xl font-bold text-white">
            {user ? (
              <>{greeting}, {displayName}</>
            ) : (
              <span className="text-gray-600 animate-pulse">Loading...</span>
            )}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Here's your real-time cloud security overview.</p>
        </div>
        <Link
          href="/scans/new"
          className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl text-sm transition shadow-lg shadow-green-900/40"
        >
          + New Scan
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.slice(0, 4).map((m) => (
          <div key={m.label} className={`bg-gradient-to-br ${m.bg} border ${m.border} rounded-2xl p-5`}>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{m.label}</p>
            <p className="text-4xl font-bold" style={{ color: m.color }}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {metrics.slice(4).map((m) => (
          <div key={m.label} className={`bg-gradient-to-br ${m.bg} border ${m.border} rounded-2xl p-5`}>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{m.label}</p>
            <p className="text-4xl font-bold" style={{ color: m.color }}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Donut Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Findings by Severity</h2>
          {severityData.length === 0 ? (
            <p className="text-gray-600 text-center py-12">No findings yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="value">
                    {severityData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2 flex-wrap">
                {severityData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-gray-400">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Area Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Security Score Trend</h2>
          {scoreTrendData.length === 0 ? (
            <p className="text-gray-600 text-center py-12">No scan history yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={scoreTrendData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} />
                <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: "#22c55e", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Cloud Coverage */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Findings by Cloud Provider</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "AWS", value: data.cloud_coverage.aws, color: "#f97316", bg: "bg-orange-950/40 border-orange-900", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" className="w-12 h-6 object-contain mx-auto" alt="AWS" /> },
            { name: "Azure", value: data.cloud_coverage.azure, color: "#60a5fa", bg: "bg-blue-950/40 border-blue-900", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" className="w-8 h-6 object-contain mx-auto" alt="Azure" /> },
            { name: "GCP", value: data.cloud_coverage.gcp, color: "#ef4444", bg: "bg-red-950/40 border-red-900", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Google-cloud-platform.svg" className="w-10 h-6 object-contain mx-auto" alt="GCP" /> },
          ].map((cloud) => (
            <div key={cloud.name} className={`${cloud.bg} border rounded-xl p-5 text-center`}>
              <div className="mb-2">{cloud.icon}</div>
              <p className="text-3xl font-bold" style={{ color: cloud.color }}>{cloud.value}</p>
              <p className="text-xs text-gray-500 mt-1">{cloud.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Scans</h2>
          <Link href="/scans" className="text-xs text-green-400 hover:text-green-300 transition">View all →</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 text-xs uppercase tracking-wider border-b border-gray-800">
              <th className="pb-3">ID</th>
              <th className="pb-3">Score</th>
              <th className="pb-3">Critical</th>
              <th className="pb-3">High</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_scans.map((scan: any) => (
              <tr key={scan.id} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition">
                <td className="py-3">
                  <Link href={`/scans/${scan.id}`} className="text-green-400 hover:text-green-300 font-mono">#{scan.id}</Link>
                </td>
                <td className="py-3 font-bold" style={{ color: scan.score >= 80 ? "#22c55e" : scan.score >= 60 ? "#eab308" : "#ef4444" }}>
                  {scan.score ?? "—"}
                </td>
                <td className="py-3 text-red-400">{scan.critical_count}</td>
                <td className="py-3 text-orange-400">{scan.high_count}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    scan.status === "completed" ? "bg-green-900/50 text-green-400 border border-green-800" :
                    scan.status === "failed" ? "bg-red-900/50 text-red-400 border border-red-800" :
                    "bg-yellow-900/50 text-yellow-400 border border-yellow-800"
                  }`}>
                    {scan.status}
                  </span>
                </td>
                <td className="py-3 text-gray-500 text-xs">{new Date(scan.started_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}