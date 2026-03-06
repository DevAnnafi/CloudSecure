"use client";

import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";

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

  if (t.includes("public access") && t.includes("s3")) return [
    "Go to AWS Console → S3 → select the bucket",
    "Click 'Permissions' tab",
    "Under 'Block public access', click Edit",
    "Enable all four Block Public Access settings",
    "Click Save changes"
  ]
  if (t.includes("acl") && t.includes("s3")) return [
    "Go to AWS Console → S3 → select the bucket",
    "Click 'Permissions' tab → Access Control List",
    "Remove any 'Everyone' or 'Authenticated Users' grants",
    "Save changes"
  ]
  if (t.includes("encryption") && t.includes("s3")) return [
    "Go to AWS Console → S3 → select the bucket",
    "Click 'Properties' tab",
    "Under 'Default encryption', click Edit",
    "Select SSE-S3 or SSE-KMS",
    "Click Save changes"
  ]
  if (t.includes("imdsv1") || t.includes("metadata")) return [
    "Go to AWS Console → EC2 → select the instance",
    "Click Actions → Instance Settings → Modify instance metadata options",
    "Set 'IMDSv2' to Required",
    "Click Save"
  ]
  if (t.includes("iam") || t.includes("privilege") || t.includes("wildcard")) return [
    "Go to AWS Console → IAM → Policies",
    "Find and edit the policy with wildcard (*) permissions",
    "Replace '*' actions with only the specific actions needed",
    "Apply least-privilege principle",
    "Click Save changes"
  ]
  if (t.includes("public") && t.includes("bucket") && t.includes("gcs")) return [
    "Go to GCP Console → Cloud Storage → select the bucket",
    "Click 'Permissions' tab",
    "Remove 'allUsers' and 'allAuthenticatedUsers' members",
    "Click Save"
  ]
  if (t.includes("azure") || t.includes("container")) return [
    "Go to Azure Portal → Storage Accounts → select account",
    "Click 'Containers' → select the container",
    "Change 'Public access level' to Private",
    "Click OK"
  ]

  return [
    "Review the affected resource in your cloud console",
    "Apply the principle of least privilege",
    "Consult your cloud provider's security best practices documentation"
  ]
}

export default function Scan() {
  const params = useParams();
  const scanId = params.id;

  const [scan, getScan] = useState<Scan | null>(null);
  const [loading, getLoading] = useState<boolean>(true);
  const [findings, setFindings] = useState<Finding[]>([]);

  const [expandedFinding, setExpandedFinding] = useState<number | null>(null)
  const [cloudFilter, setCloudFilter] = useState<string>("ALL")

  useEffect(() => {
    fetch(`http://localhost:8000/scans/${scanId}`)
      .then((response) => response.json())
      .then((data) => {
        getScan(data);
        getLoading(false);
      })

      .catch((error) => console.error(error));
  }, [scanId]);

  useEffect(() => {
    if (!scan) return;

    fetch(`http://localhost:8000/findings/${scanId}`)
      .then((response) => response.json())
      .then((data) => {
        setFindings(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [scan, scanId]);

  return (
    <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto py-6 px-4">
      {loading && <p>Loading...</p>}

      {!loading && !scan && <p> Scan not found</p>}

      {!loading && scan && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Scan #{scan.id}
          </h1>

          <div className="bg-white shadow-lg rounded-lg p-8 mb-6 text-center">
            <p className="text-gray-500 text-sm mb-2">Security Score</p>

            {scan.overall_score !== null ? (
              <p
                className={`text-8xl font-bold ${
                  scan.overall_score >= 80
                    ? "text-green-600"
                    : scan.overall_score >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
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
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  scan.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : scan.status === "running"
                      ? "bg-yellow-100 text-yellow-800"
                      : scan.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
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
                {scan.completed_at
                  ? new Date(scan.completed_at).toLocaleString()
                  : "In progress"}
              </p>
            </div>

            {/* Total Findings Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-500 text-sm">Total Findings</p>
              <p className="text-gray-900 font-bold text-2xl">
                {scan.total_findings}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Findings by Severity
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-red-600 font-bold text-3xl">
                  {scan.critical_count}
                </p>
                <p className="text-gray-500 text-sm">Critical</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-orange-600 font-bold text-3xl">
                  {scan.high_count}
                </p>
                <p className="text-gray-500 text-sm">High</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-yellow-600 font-bold text-3xl">
                  {scan.medium_count}
                </p>
                <p className="text-gray-500 text-sm">Medium</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-blue-600 font-bold text-3xl">
                  {scan.low_count}
                </p>
                <p className="text-gray-500 text-sm">Low</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Security Findings
            </h2>

            <div className="flex gap-2 mb-4">
              {["ALL", "AWS", "Azure", "GCP"].map((provider) => (
                <button
                  key={provider}
                  onClick={() => setCloudFilter(provider)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    cloudFilter === provider
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>

            {findings.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <p className="text-green-800 text-xl font-semibold">
                  No security issues found!
                </p>
                <p className="text-green-600 mt-2">
                  Your infrastructure is secure.
                </p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fix
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(cloudFilter === "ALL" ? findings : findings.filter(f => f.cloud_provider === cloudFilter)).map((finding) => (
                        <React.Fragment key={finding.id}>
                        <tr
                          onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                          className="hover:bg-gray-50 cursor-pointer transition"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              finding.severity === "CRITICAL" ? "bg-red-100 text-red-800" :
                              finding.severity === "HIGH" ? "bg-orange-100 text-orange-800" :
                              finding.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {finding.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{finding.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{finding.resource}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{finding.description}</td>
                          <td className="px-6 py-4 text-sm text-blue-500">
                            {expandedFinding === finding.id ? " Hide fix" : " How to fix"}
                          </td>
                        </tr>

                        {expandedFinding === finding.id && (
                          <tr key={`${finding.id}-remediation`} className="bg-blue-50">
                            <td colSpan={5} className="px-6 py-4">
                              <p className="text-sm font-semibold text-blue-800 mb-2">Remediation Steps</p>
                              <ol className="list-decimal list-inside space-y-1">
                                {getRemediation(finding.title).map((step, i) => (
                                  <li key={i} className="text-sm text-blue-900">{step}</li>
                                ))}
                              </ol>
                            </td>
                          </tr>                          
                        )}
                        </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
