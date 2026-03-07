"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

interface Finding {
  id: number;
  severity: string;
  title: string;
  resource: string;
  description: string;
  cloud_provider: string;
  account_name: string;
}

function getRemediation(title: string): string[] {
  const t = title.toLowerCase()
  if (t.includes("public access") && t.includes("s3")) return ["Go to AWS Console → S3 → select the bucket", "Click 'Permissions' tab", "Under 'Block public access', click Edit", "Enable all four Block Public Access settings", "Click Save changes"]
  if (t.includes("acl") && t.includes("s3")) return ["Go to AWS Console → S3 → select the bucket", "Click 'Permissions' tab → Access Control List", "Remove any 'Everyone' or 'Authenticated Users' grants", "Save changes"]
  if (t.includes("encryption") && t.includes("s3")) return ["Go to AWS Console → S3 → select the bucket", "Click 'Properties' tab", "Under 'Default encryption', click Edit", "Select SSE-S3 or SSE-KMS", "Click Save changes"]
  if (t.includes("imdsv1") || t.includes("metadata")) return ["Go to AWS Console → EC2 → select the instance", "Click Actions → Instance Settings → Modify instance metadata options", "Set 'IMDSv2' to Required", "Click Save"]
  if (t.includes("iam") || t.includes("privilege") || t.includes("wildcard")) return ["Go to AWS Console → IAM → Policies", "Find and edit the policy with wildcard (*) permissions", "Replace '*' actions with only the specific actions needed", "Apply least-privilege principle", "Click Save changes"]
  return ["Review the affected resource in your cloud console", "Apply the principle of least privilege", "Consult your cloud provider's security best practices documentation"]
}

const severityColor: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#60a5fa",
}

const severityBg: Record<string, string> = {
  CRITICAL: "bg-red-900/50 text-red-400 border-red-800",
  HIGH: "bg-orange-900/50 text-orange-400 border-orange-800",
  MEDIUM: "bg-yellow-900/50 text-yellow-400 border-yellow-800",
  LOW: "bg-blue-900/50 text-blue-400 border-blue-800",
}

export default function ScanDetailPage() {
  const params = useParams();
  const scanId = params.id;
  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [expandedFinding, setExpandedFinding] = useState<number | null>(null)
  const [cloudFilter, setCloudFilter] = useState<string>("ALL")
  const [severityFilter, setSeverityFilter] = useState<string>("ALL")

  useEffect(() => {
    if (!token) { router.push("/login"); return }
    fetch(`${API_URL}/scans/${scanId}`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setScan(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [scanId])

  useEffect(() => {
    if (!scan || !token) return;
    fetch(`${API_URL}/findings/${scanId}`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(setFindings)
      .catch(console.error);
  }, [scan, scanId])

  const filteredFindings = findings.filter(f => {
    const cloudMatch = cloudFilter === "ALL" || f.cloud_provider === cloudFilter
    const severityMatch = severityFilter === "ALL" || f.severity === severityFilter
    return cloudMatch && severityMatch
  })

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-green-400 animate-pulse">Loading scan...</p>
    </div>
  )

  if (!scan) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-red-400">Scan not found.</p>
    </div>
  )

  const scoreColor = scan.overall_score === null ? "#6b7280" : scan.overall_score >= 80 ? "#22c55e" : scan.overall_score >= 60 ? "#eab308" : "#ef4444"
  const scoreLabel = scan.overall_score === null ? "Pending" : scan.overall_score >= 80 ? "Secure" : scan.overall_score >= 60 ? "Fair" : "At Risk"

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-400 text-xs font-medium uppercase tracking-widest mb-1">Scan Detail</p>
            <h1 className="text-3xl font-bold text-white font-mono">Scan #{scan.id}</h1>
            <p className="text-gray-500 text-sm mt-1">{new Date(scan.started_at).toLocaleString()}</p>
          </div>
          <button
            onClick={() => router.push("/scans")}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition border border-gray-700"
          >
            ← Back to Scans
          </button>
        </div>

        {/* Score + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Big Score */}
          <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Security Score</p>
            <p className="text-8xl font-bold" style={{ color: scoreColor }}>
              {scan.overall_score ?? "—"}
            </p>
            <p className="text-gray-500 text-sm mt-1">out of 100</p>
            <span className="mt-4 px-3 py-1 rounded-full text-xs font-semibold border" style={{
              color: scoreColor,
              borderColor: scoreColor,
              backgroundColor: `${scoreColor}20`
            }}>
              {scoreLabel}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="md:col-span-3 grid grid-cols-2 gap-4">
            {[
              { label: "Status", value: scan.status, pill: true },
              { label: "Total Findings", value: scan.total_findings, color: "#f1f5f9" },
              { label: "Critical", value: scan.critical_count, color: "#ef4444" },
              { label: "High", value: scan.high_count, color: "#f97316" },
              { label: "Medium", value: scan.medium_count, color: "#eab308" },
              { label: "Low", value: scan.low_count, color: "#60a5fa" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{item.label}</p>
                {item.pill ? (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    scan.status === "completed" ? "bg-green-900/50 text-green-400 border-green-800" :
                    scan.status === "running" ? "bg-yellow-900/50 text-yellow-400 border-yellow-800" :
                    "bg-red-900/50 text-red-400 border-red-800"
                  }`}>{scan.status}</span>
                ) : (
                  <p className="text-3xl font-bold" style={{ color: item.color }}>{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Findings */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Security Findings</h2>
            <div className="flex gap-2 flex-wrap">
              {["ALL", "AWS", "Azure", "GCP"].map(p => (
                <button key={p} onClick={() => setCloudFilter(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition border ${cloudFilter === p ? "bg-green-500 text-black border-green-500" : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"}`}>
                  {p}
                </button>
              ))}
              <div className="w-px bg-gray-700 mx-1" />
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(s => (
                <button key={s} onClick={() => setSeverityFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition border ${severityFilter === s ? "bg-green-500 text-black border-green-500" : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {filteredFindings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-green-400 font-semibold">No findings match your filters</p>
              <p className="text-gray-600 text-sm mt-1">Your infrastructure looks clean!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFindings.map((finding) => (
                <div key={finding.id} className="border border-gray-800 rounded-xl overflow-hidden">
                  <div
                    onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                    className="flex items-center gap-4 p-4 hover:bg-gray-800/40 cursor-pointer transition"
                  >
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${severityBg[finding.severity] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
                      {finding.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{finding.title}</p>
                      <p className="text-xs text-gray-500 truncate">{finding.resource}</p>
                    </div>
                    <span className="text-xs text-gray-600 shrink-0">{finding.cloud_provider}</span>
                    <span className="text-gray-500 text-xs shrink-0">{expandedFinding === finding.id ? "▲ Hide" : "▼ Fix"}</span>
                  </div>

                  {expandedFinding === finding.id && (
                    <div className="border-t border-gray-800 bg-gray-950 p-5">
                      <p className="text-xs text-gray-400 mb-2">{finding.description}</p>
                      <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">Remediation Steps</p>
                      <ol className="space-y-2">
                        {getRemediation(finding.title).map((step, i) => (
                          <li key={i} className="flex gap-3 text-xs text-gray-300">
                            <span className="w-5 h-5 rounded-full bg-green-900/50 border border-green-800 text-green-400 flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}