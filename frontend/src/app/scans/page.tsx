'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Scan {
  id: number;
  account_id: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  overall_score: number | null;
  total_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  is_baseline?: boolean;
}

export default function ScansPage() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_URL}/scans`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch scans');

      const data = await res.json();
      setScans(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/50 text-green-400 border-green-800';
      case 'running':
        return 'bg-blue-900/50 text-blue-400 border-blue-800';
      case 'failed':
        return 'bg-red-900/50 text-red-400 border-red-800';
      default:
        return 'bg-gray-900/50 text-gray-400 border-gray-800';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-green-400 animate-pulse">Loading scans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Security Scans</h1>
            <p className="text-gray-400 mt-2">View and manage your cloud security scans</p>
          </div>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition"
          >
            + New Scan
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-400 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Scans List */}
        {scans.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No scans yet</p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition"
            >
              Run Your First Scan
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">ID</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Score</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Findings</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Started</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition cursor-pointer"
                    onClick={() => router.push(`/scans/${scan.id}`)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">#{scan.id}</span>
                        {/* Baseline Badge */}
                        {scan.is_baseline && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-800">
                            ⭐ Baseline
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(scan.status)}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {scan.overall_score !== null ? (
                        <span className={`text-2xl font-bold ${getScoreColor(scan.overall_score)}`}>
                          {scan.overall_score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-3 text-sm">
                        {scan.critical_count > 0 && (
                          <span className="text-red-400 font-semibold">
                            {scan.critical_count} Critical
                          </span>
                        )}
                        {scan.high_count > 0 && (
                          <span className="text-orange-400 font-semibold">
                            {scan.high_count} High
                          </span>
                        )}
                        {scan.medium_count > 0 && (
                          <span className="text-yellow-400 font-semibold">
                            {scan.medium_count} Medium
                          </span>
                        )}
                        {scan.low_count > 0 && (
                          <span className="text-blue-400 font-semibold">
                            {scan.low_count} Low
                          </span>
                        )}
                        {scan.total_findings === 0 && (
                          <span className="text-green-400 font-semibold">
                            ✅ No issues
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {new Date(scan.started_at).toLocaleDateString()}{' '}
                      {new Date(scan.started_at).toLocaleTimeString()}
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        href={`/scans/${scan.id}`}
                        className="text-green-400 hover:text-green-300 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats Summary */}
        {scans.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Scans</p>
              <p className="text-3xl font-bold text-white">{scans.length}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-400">
                {scans.filter((s) => s.status === 'completed').length}
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Running</p>
              <p className="text-3xl font-bold text-blue-400">
                {scans.filter((s) => s.status === 'running').length}
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Baseline Set</p>
              <p className="text-3xl font-bold text-yellow-400">
                {scans.filter((s) => s.is_baseline).length > 0 ? '✅' : '—'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}