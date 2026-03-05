"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateScan() {
    const [cloudProvider, setCloudProvider] = useState<string>("AWS")
    const [accountId, setAccountId] = useState<string>("")
    const [accountName, setAccountName] = useState<string>("")
    const [profile, setProfile] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const response = await fetch('http://localhost:8000/scans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
    } catch (error) {
        console.error('Error creating scan:', error);
        setLoading(false);
    }
};

    return (
        <div>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto py-6 px-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Create New Scan
                    </h1>

                    <div className="bg-white shadow-lg rounded-lg p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-grap-700 mb-2">Cloud Provider</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" value={cloudProvider} onChange={(e) => setCloudProvider(e.target.value)}>
                                    <option value="AWS">AWS</option>
                                    <option value="Azure">Azure</option>
                                    <option value="GCP">GCP</option>
                                </select>
                            </div>
                            {/* Account ID */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-black">Account ID</label>
                                <input className="w-full px-3 py-2 border border-grap-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    type="text"
                                    value={accountId}
                                    onChange={(e) => setAccountId(e.target.value)}
                                    placeholder="123456789012"
                                />
                            </div>

                            {/* Account Name */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-black">Account Name</label>
                                <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    type="text"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    placeholder="Production AWS"
                                />
                            </div>

                            {/* Profile */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-black">Profile (Optional)</label>
                                <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    type="text"
                                    value={profile}
                                    onChange={(e) => setProfile(e.target.value)}
                                    placeholder="default"
                                />
                            </div>

                            {/* Submit Button */}
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed" type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Scan'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    )

}

