'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

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

export default function Scan() {
    const params = useParams();
    const scanId = params.id;

    const [scan, getScan] = useState<Scan | null>(null);
    const [loading, getLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch(`http://localhost:8000/scans/${scanId}`)
            .then(response => response.json())
            .then(data => {
                getScan(data)
                getLoading(false)
            })

            .catch(error => console.error(error))
    
    }, [scanId]);

    return (
        <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto py-6 px-4">
            {loading && (
                <p>Loading...</p>
            )}

            {!loading && !scan && (
                <p> Scan not found</p>
            )}


            {!loading && scan && (
                <div> 
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Scan #{scan.id}
                    </h1>

                    <div className="bg-white shadow-lg rounded-lg p-8 mb-6 text-center"> 
                        <p className="text-gray-500 text-sm mb-2">Security Score</p>
    
                        {scan.overall_score !== null ? (
                            <p className={`text-8xl font-bold ${
                                scan.overall_score >= 80 ? 'text-green-600' :
                                scan.overall_score >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>
                                {scan.overall_score}
                                <span className="text-4xl text-gray-400">/100</span>
                            </p>
                        ) : (
                            <p className="text-gray-400 text-4xl">No Score</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Status Card */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <p className="text-gray-500 text-sm">Status</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                scan.status === 'completed' ? 'bg-green-100 text-green-800' :
                                scan.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                                scan.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {scan.status}
                            </span>
                        </div>

                        {/* Started Card */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <p className="text-gray-500 text-sm">Started</p>
                            <p className="text-gray-900 font-semibold">
                                {new Date(scan.started_at).toLocaleString()}
                            </p>
                        </div>

                        {/* Completed Card */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <p className="text-gray-500 text-sm">Completed</p>
                            <p className="text-gray-900 font-semibold">
                                {scan.completed_at ? new Date(scan.completed_at).toLocaleString() : 'In progress'}
                            </p>
                        </div>

                        {/* Total Findings Card */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <p className="text-gray-500 text-sm">Total Findings</p>
                            <p className="text-gray-900 font-bold text-2xl">{scan.total_findings}</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Findings by Severity
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white shadow rounded-lg p-6 text-center">
                                <p className="text-red-600 font-bold text-3xl">{scan.critical_count}</p>
                                <p className="text-gray-500 text-sm">Critical</p>
                            </div>
                            <div className="bg-white shadow rounded-lg p-6 text-center">
                                <p className="text-orange-600 font-bold text-3xl">{scan.high_count}</p>
                                <p className="text-gray-500 text-sm">High</p>
                            </div>
                            <div className="bg-white shadow rounded-lg p-6 text-center">
                                <p className="text-yellow-600 font-bold text-3xl">{scan.medium_count}</p>
                                <p className="text-gray-500 text-sm">Medium</p>
                            </div>
                            <div className="bg-white shadow rounded-lg p-6 text-center">
                                <p className="text-blue-600 font-bold text-3xl">{scan.low_count}</p>
                                <p className="text-gray-500 text-sm">Low</p>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}