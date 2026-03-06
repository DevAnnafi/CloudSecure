'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function Home() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchScans = () => {
    fetch('http://localhost:8000/scans')
      .then(res => res.json())
      .then(data => {
        setScans(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching scans:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchScans();
  }, []);

  useEffect(() => {
  const token = localStorage.getItem("token")
  if (!token) {
    router.push("/login")
  }
}, [])

  const createScan = () => {
    setCreating(true);
    
    fetch('http://localhost:8000/scans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cloud_provider: 'AWS',
        account_id: '123456789012',
        account_name: 'Test Production',
        profile: 'default'
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log('Scan created:', data);
        setCreating(false);
        setTimeout(fetchScans, 3000);
      })
      .catch(error => {
        console.error('Error creating scan:', error);
        setCreating(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Scans</h1>
            <p className="mt-2 text-gray-600">View and manage your cloud security scans</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('scans/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + New Scan
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Scans
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading scans...</p>
          ) : scans.length === 0 ? (
            <p className="text-gray-500">No scans yet. Create your first scan!</p>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Findings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Started
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scans.map((scan) => (
                    <tr 
                      key={scan.id}
                      onClick={() => router.push(`/scans/${scan.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {scan.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          scan.status === 'completed' ? 'bg-green-100 text-green-800' :
                          scan.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                          scan.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {scan.overall_score !== null ? (
                          <span className={`font-bold ${
                            scan.overall_score >= 80 ? 'text-green-600' :
                            scan.overall_score >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {scan.overall_score}/100
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          {scan.critical_count > 0 && (
                            <span className="text-red-600 font-semibold">
                              {scan.critical_count}C
                            </span>
                          )}
                          {scan.high_count > 0 && (
                            <span className="text-orange-600 font-semibold">
                              {scan.high_count}H
                            </span>
                          )}
                          {scan.medium_count > 0 && (
                            <span className="text-yellow-600 font-semibold">
                              {scan.medium_count}M
                            </span>
                          )}
                          {scan.low_count > 0 && (
                            <span className="text-blue-600 font-semibold">
                              {scan.low_count}L
                            </span>
                          )}
                          {scan.total_findings === 0 && (
                            <span className="text-green-600">✓ Clean</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(scan.started_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}