'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cloudsecure-production.up.railway.app';

interface Scan {
  id: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  overall_score: number | null;
  total_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

export default function ScansPage() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetch(`${API_URL}/scans/`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setScans(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [])

  async function handleDelete(e: React.MouseEvent, scanId: number) {
    e.stopPropagation()
    if (confirmId !== scanId) {
      setConfirmId(scanId)
      return
    }
    setDeletingId(scanId)
    setConfirmId(null)
    const token = localStorage.getItem("token")
    await fetch(`${API_URL}/scans/${scanId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
    setScans(prev => prev.filter(s => s.id !== scanId))
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-400 text-xs font-medium uppercase tracking-widest mb-1">Security Scans</p>
            <h1 className="text-3xl font-bold text-white">All Scans</h1>
            <p className="text-gray-500 text-sm mt-1">View and manage your cloud security scans</p>
          </div>
        </div>

        {loading ? (
          <div className="text-green-400 animate-pulse py-12 text-center">Loading scans...</div>
        ) : scans.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
            <p className="text-gray-400 text-lg font-medium">No scans yet</p>
            <p className="text-gray-600 text-sm mt-1 mb-6">Run your first scan from the dashboard</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Findings</th>
                  <th className="px-6 py-4">Started</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr
                    key={scan.id}
                    onClick={() => router.push(`/scans/${scan.id}`)}
                    className="border-b border-gray-800/50 hover:bg-gray-800/40 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 font-mono text-green-400">#{scan.id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        scan.status === 'completed' ? 'bg-green-900/50 text-green-400 border-green-800' :
                        scan.status === 'running' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-800' :
                        scan.status === 'failed' ? 'bg-red-900/50 text-red-400 border-red-800' :
                        'bg-gray-800 text-gray-400 border-gray-700'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold" style={{
                      color: scan.overall_score === null ? '#6b7280' :
                        scan.overall_score >= 80 ? '#22c55e' :
                        scan.overall_score >= 60 ? '#eab308' : '#ef4444'
                    }}>
                      {scan.overall_score !== null ? `${scan.overall_score}/100` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {scan.critical_count > 0 && <span className="text-red-400 font-semibold">{scan.critical_count}C</span>}
                        {scan.high_count > 0 && <span className="text-orange-400 font-semibold">{scan.high_count}H</span>}
                        {scan.medium_count > 0 && <span className="text-yellow-400 font-semibold">{scan.medium_count}M</span>}
                        {scan.low_count > 0 && <span className="text-blue-400 font-semibold">{scan.low_count}L</span>}
                        {scan.total_findings === 0 && <span className="text-green-400">✓ Clean</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(scan.started_at).toLocaleString()}</td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      {deletingId === scan.id ? (
                        <span className="text-gray-600 text-xs">Deleting...</span>
                      ) : confirmId === scan.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => handleDelete(e, scan.id)}
                            className="text-xs text-red-400 hover:text-red-300 font-semibold transition"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmId(null) }}
                            className="text-xs text-gray-500 hover:text-gray-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={e => handleDelete(e, scan.id)}
                          className="text-xs text-gray-600 hover:text-red-400 transition"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}