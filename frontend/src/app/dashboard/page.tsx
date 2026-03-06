"use client"

import { useEffect, useState } from "react"
import { getDashboard } from "@/lib/api"
import Link from "next/link"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => {
        console.error("Dashboard fetch error:", err)
        setLoading(false)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-500">Loading dashboard...</div>
  if (!data)   return <div className="p-8 text-red-500">Failed to load dashboard.</div>

  const scoreColor =
    data.security_score >= 80 ? "text-green-500" :
    data.security_score >= 60 ? "text-yellow-500" : "text-red-500"

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

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Security Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Security Score</p>
          <p className={`text-5xl font-bold ${scoreColor}`}>{data.security_score}</p>
          <p className="text-xs text-gray-400 mt-1">out of 100</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Total Findings</p>
          <p className="text-5xl font-bold text-gray-800">{data.total_findings}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Critical</p>
          <p className="text-5xl font-bold text-red-500">{data.severity.critical}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 mb-1">High</p>
          <p className="text-5xl font-bold text-orange-400">{data.severity.high}</p>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Medium</p>
          <p className="text-4xl font-bold text-yellow-500">{data.severity.medium}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Low</p>
          <p className="text-4xl font-bold text-blue-400">{data.severity.low}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Total Scans</p>
          <p className="text-4xl font-bold text-gray-700">{data.total_scans}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Severity Donut Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Findings by Severity</h2>
          {severityData.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No findings</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {severityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-gray-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Trend Line Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Score Trend</h2>
          {scoreTrendData.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No scan history</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={scoreTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Cloud Coverage */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Findings by Cloud</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-500">{data.cloud_coverage.aws}</p>
            <p className="text-sm text-gray-500 mt-1">AWS</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-500">{data.cloud_coverage.azure}</p>
            <p className="text-sm text-gray-500 mt-1">Azure</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-500">{data.cloud_coverage.gcp}</p>
            <p className="text-sm text-gray-500 mt-1">GCP</p>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Recent Scans</h2>
          <Link href="/scans" className="text-sm text-blue-500 hover:underline">View all →</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="pb-2">ID</th>
              <th className="pb-2">Score</th>
              <th className="pb-2">Critical</th>
              <th className="pb-2">High</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_scans.map((scan: any) => (
              <tr key={scan.id} className="border-b hover:bg-gray-50">
                <td className="py-2">
                  <Link href={`/scans/${scan.id}`} className="text-blue-500 hover:underline">
                    #{scan.id}
                  </Link>
                </td>
                <td className={`py-2 font-bold ${scan.score >= 80 ? "text-green-500" : scan.score >= 60 ? "text-yellow-500" : "text-red-500"}`}>
                  {scan.score}
                </td>
                <td className="py-2 text-red-500">{scan.critical_count}</td>
                <td className="py-2 text-orange-400">{scan.high_count}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${scan.status === "completed" ? "bg-green-100 text-green-700" : scan.status === "failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {scan.status}
                  </span>
                </td>
                <td className="py-2 text-gray-400">{new Date(scan.started_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}