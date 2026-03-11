'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Finding {
  id: number;
  severity: string;
  title: string;
  description: string;
  resource: string;
  resource_id?: string;
}

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

interface DriftData {
  scan_id: number;
  baseline_id: number;
  drift: {
    score: {
      current: number;
      baseline: number;
      change: number;
      percentage: number;
    };
    findings: {
      total: { current: number; baseline: number; change: number };
      critical: { current: number; baseline: number; change: number };
      high: { current: number; baseline: number; change: number };
      medium: { current: number; baseline: number; change: number };
      low: { current: number; baseline: number; change: number };
    };
    new_findings: number;
    resolved_findings: number;
    new_findings_list: Finding[];
    resolved_findings_list: Finding[];
  };
  trend: 'improving' | 'declining' | 'stable';
}

export default function ScanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [scan, setScan] = useState<Scan | null>(null);
  const [drift, setDrift] = useState<DriftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingBaseline, setSettingBaseline] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScanDetails();
  }, [scanId]);

  const fetchScanDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch scan details
      const scanRes = await fetch(`${API_URL}/scans/${scanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!scanRes.ok) throw new Error('Failed to fetch scan');
      const scanData = await scanRes.json();
      setScan(scanData);

      // Fetch drift if scan is completed and not baseline
      if (scanData.status === 'completed' && !scanData.is_baseline) {
        try {
          const driftRes = await fetch(`${API_URL}/scans/${scanId}/drift`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (driftRes.ok) {
            const driftData = await driftRes.json();
            setDrift(driftData);
          }
        } catch (err) {
          // No baseline set yet, that's ok
          console.log('No baseline set');
        }
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSetBaseline = async () => {
    try {
      setSettingBaseline(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/scans/${scanId}/set-baseline`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to set baseline');

      // Refresh scan details
      await fetchScanDetails();
      setSettingBaseline(false);
    } catch (err: any) {
      setError(err.message);
      setSettingBaseline(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-green-400 animate-pulse">Loading scan details...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Scan not found'}</p>
          <Link href="/scans" className="text-green-400 hover:text-green-300">
            ← Back to Scans
          </Link>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-900/50 text-red-400 border-red-800';
      case 'high': return 'bg-orange-900/50 text-orange-400 border-orange-800';
      case 'medium': return 'bg-yellow-900/50 text-yellow-400 border-yellow-800';
      case 'low': return 'bg-blue-900/50 text-blue-400 border-blue-800';
      default: return 'bg-gray-900/50 text-gray-400 border-gray-800';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '➡️';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'improving') return 'text-green-400';
    if (trend === 'declining') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/scans" className="text-green-400 hover:text-green-300 mb-4 inline-block">
            ← Back to Scans
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Scan #{scan.id}</h1>
              
              {/* Status Badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                scan.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                scan.status === 'running' ? 'bg-blue-900/50 text-blue-400' :
                scan.status === 'failed' ? 'bg-red-900/50 text-red-400' :
                'bg-gray-900/50 text-gray-400'
              }`}>
                {scan.status}
              </span>

              {/* Baseline Badge */}
              {scan.is_baseline && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-800">
                  ⭐ Baseline
                </span>
              )}
            </div>

            {/* Set Baseline Button */}
            {scan.status === 'completed' && !scan.is_baseline && (
              <button
                onClick={handleSetBaseline}
                disabled={settingBaseline}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-semibold rounded-lg transition disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {settingBaseline ? 'Setting...' : ' Set as Baseline'}
              </button>
            )}
          </div>

          <p className="text-gray-400 mt-2">
            Started: {new Date(scan.started_at).toLocaleString()}
          </p>
          {scan.completed_at && (
            <p className="text-gray-400">
              Completed: {new Date(scan.completed_at).toLocaleString()}
            </p>
          )}
        </div>

        {/* Score Card */}
        {scan.overall_score !== null && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Security Score</h2>
                <p className={`text-5xl font-bold ${getScoreColor(scan.overall_score)}`}>
                  {scan.overall_score.toFixed(1)}
                  <span className="text-2xl text-gray-400">/100</span>
                </p>
              </div>

              {/* Finding Counts */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-red-400 text-2xl font-bold">{scan.critical_count}</p>
                  <p className="text-gray-400 text-sm">Critical</p>
                </div>
                <div className="text-center">
                  <p className="text-orange-400 text-2xl font-bold">{scan.high_count}</p>
                  <p className="text-gray-400 text-sm">High</p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-400 text-2xl font-bold">{scan.medium_count}</p>
                  <p className="text-gray-400 text-sm">Medium</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-400 text-2xl font-bold">{scan.low_count}</p>
                  <p className="text-gray-400 text-sm">Low</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drift Detection Section */}
        {drift && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
               Drift Analysis
              <span className={`text-sm ${getTrendColor(drift.trend)}`}>
                {getTrendIcon(drift.trend)} {drift.trend}
              </span>
            </h2>

            {/* Score Drift */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-950 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Current Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(drift.drift.score.current)}`}>
                  {drift.drift.score.current.toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-950 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Baseline Score</p>
                <p className="text-3xl font-bold text-gray-400">
                  {drift.drift.score.baseline.toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-950 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Change</p>
                <p className={`text-3xl font-bold ${
                  drift.drift.score.change > 0 ? 'text-green-400' :
                  drift.drift.score.change < 0 ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {drift.drift.score.change > 0 ? '+' : ''}
                  {drift.drift.score.change.toFixed(1)}
                  <span className="text-lg ml-2">
                    ({drift.drift.score.percentage > 0 ? '+' : ''}
                    {drift.drift.score.percentage.toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>

            {/* Finding Changes */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-950 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2"> New Findings</p>
                <p className="text-2xl font-bold text-red-400">{drift.drift.new_findings}</p>
              </div>
              <div className="bg-gray-950 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2"> Resolved Findings</p>
                <p className="text-2xl font-bold text-green-400">{drift.drift.resolved_findings}</p>
              </div>
            </div>

            {/* New Findings List */}
            {drift.drift.new_findings_list.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3 text-red-400"> New Findings:</h3>
                <div className="space-y-2">
                  {drift.drift.new_findings_list.map((finding) => (
                    <div key={finding.id} className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{finding.title}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{finding.resource_id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved Findings List */}
            {drift.drift.resolved_findings_list.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400"> Resolved Findings:</h3>
                <div className="space-y-2">
                  {drift.drift.resolved_findings_list.map((finding) => (
                    <div key={finding.id} className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{finding.title}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{finding.resource_id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}