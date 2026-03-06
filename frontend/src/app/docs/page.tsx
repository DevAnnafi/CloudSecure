"use client"
import Link from "next/link"
import { useState } from "react"

const sections = [
  {
    id: "quickstart",
    title: "Quickstart",
    content: (
      <div className="space-y-4">
        <p>Get up and running with CloudSecure in under 5 minutes.</p>
        <div className="border border-gray-800 rounded-xl overflow-hidden" style={{ background: "#111" }}>
          <div className="border-b border-gray-800 px-4 py-2 flex items-center gap-2">
            <span className="text-xs text-gray-600">Steps</span>
          </div>
          <div className="p-4 space-y-3">
            {[
              "Create a CloudSecure account at cloudsecure.io/register",
              "Navigate to Settings and add your cloud account",
              "Enter your cloud provider, account ID, and account name",
              "Click New Scan from the dashboard",
              "View your security score and findings",
            ].map((step, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-400">
                <span className="text-green-500 font-mono font-bold shrink-0">{i + 1}.</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "authentication",
    title: "Authentication",
    content: (
      <div className="space-y-4">
        <p>CloudSecure uses JWT-based authentication. After logging in, your token is stored in localStorage and sent as a Bearer token with every API request.</p>
        <div className="rounded-xl border border-gray-800 p-4 font-mono text-xs text-green-400" style={{ background: "#111" }}>
          <p className="text-gray-600 mb-2"># Login and get token</p>
          <p>POST /auth/login</p>
          <p className="text-gray-500 mt-2">{"{ \"email\": \"you@example.com\", \"password\": \"...\" }"}</p>
          <p className="text-gray-600 mt-4"># Use token in requests</p>
          <p>Authorization: Bearer {"<token>"}</p>
        </div>
        <p>Tokens expire after 7 days. Re-authenticate by logging in again.</p>
      </div>
    ),
  },
  {
    id: "scans",
    title: "Running Scans",
    content: (
      <div className="space-y-4">
        <p>Scans analyze your cloud account for security misconfigurations. Each scan runs asynchronously and returns a security score from 0–100.</p>
        <div className="rounded-xl border border-gray-800 p-4 font-mono text-xs text-green-400" style={{ background: "#111" }}>
          <p className="text-gray-600 mb-2"># Create a new scan</p>
          <p>POST /scans</p>
          <p className="text-gray-500 mt-2">{"{"}</p>
          <p className="text-gray-500 pl-4">"cloud_provider": "AWS",</p>
          <p className="text-gray-500 pl-4">"account_id": "123456789012",</p>
          <p className="text-gray-500 pl-4">"account_name": "Production",</p>
          <p className="text-gray-500 pl-4">"profile": "default"</p>
          <p className="text-gray-500">{"}"}</p>
        </div>
        <p>Once created, the scan runs in the background. Poll <code className="text-green-500">GET /scans/{"{id}"}</code> to check the status. Possible statuses: <code className="text-green-500">pending</code>, <code className="text-green-500">running</code>, <code className="text-green-500">completed</code>, <code className="text-green-500">failed</code>.</p>
      </div>
    ),
  },
  {
    id: "findings",
    title: "Findings",
    content: (
      <div className="space-y-4">
        <p>Findings are security issues detected during a scan. Each finding has a severity level: <span className="text-red-400">CRITICAL</span>, <span className="text-orange-400">HIGH</span>, <span className="text-yellow-400">MEDIUM</span>, or <span className="text-blue-400">LOW</span>.</p>
        <div className="rounded-xl border border-gray-800 p-4 font-mono text-xs text-green-400" style={{ background: "#111" }}>
          <p className="text-gray-600 mb-2"># Get findings for a scan</p>
          <p>GET /findings/{"{scan_id}"}</p>
          <p className="text-gray-600 mt-4"># Response</p>
          <p className="text-gray-500">{"["}</p>
          <p className="text-gray-500 pl-4">{"{"}</p>
          <p className="text-gray-500 pl-8">"severity": "CRITICAL",</p>
          <p className="text-gray-500 pl-8">"title": "S3 Bucket Public Access Enabled",</p>
          <p className="text-gray-500 pl-8">"resource": "my-bucket",</p>
          <p className="text-gray-500 pl-8">"description": "..."</p>
          <p className="text-gray-500 pl-4">{"}"}</p>
          <p className="text-gray-500">{"]"}</p>
        </div>
      </div>
    ),
  },
  {
    id: "api",
    title: "API Reference",
    content: (
      <div className="space-y-4">
        <p>The CloudSecure REST API is available at <code className="text-green-500">http://localhost:8000</code>. All endpoints require a valid Bearer token except <code className="text-green-500">/auth/register</code> and <code className="text-green-500">/auth/login</code>.</p>
        <div className="space-y-2">
          {[
            { method: "POST", path: "/auth/register", desc: "Create a new account" },
            { method: "POST", path: "/auth/login", desc: "Login and get token" },
            { method: "GET", path: "/auth/me", desc: "Get current user" },
            { method: "PUT", path: "/auth/me", desc: "Update profile" },
            { method: "PUT", path: "/auth/me/password", desc: "Change password" },
            { method: "GET", path: "/scans/", desc: "List all scans" },
            { method: "POST", path: "/scans", desc: "Create a new scan" },
            { method: "GET", path: "/scans/{id}", desc: "Get scan details" },
            { method: "DELETE", path: "/scans/{id}", desc: "Delete a scan" },
            { method: "GET", path: "/findings/{scan_id}", desc: "Get findings for a scan" },
            { method: "GET", path: "/dashboard", desc: "Get dashboard summary" },
            { method: "GET", path: "/accounts", desc: "List cloud accounts" },
            { method: "POST", path: "/accounts", desc: "Add a cloud account" },
            { method: "DELETE", path: "/accounts/{id}", desc: "Remove a cloud account" },
          ].map(ep => (
            <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-4 p-3 rounded-lg border border-gray-800 text-sm" style={{ background: "#111" }}>
              <span className={`font-mono text-xs font-bold w-12 shrink-0 ${ep.method === "GET" ? "text-blue-400" : ep.method === "POST" ? "text-green-400" : ep.method === "PUT" ? "text-yellow-400" : "text-red-400"}`}>
                {ep.method}
              </span>
              <code className="text-gray-300 font-mono text-xs flex-1">{ep.path}</code>
              <span className="text-gray-600 text-xs">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export default function DocsPage() {
  const [active, setActive] = useState("quickstart")

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <nav style={{ background: "#0a0a0a" }} className="border-b border-gray-800/60 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-base font-bold tracking-tight text-white">CloudSecure</Link>
        <Link href="/login" className="text-sm bg-white hover:bg-gray-100 text-gray-900 font-semibold px-4 py-2.5 rounded-lg transition">Get started →</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-16 flex gap-12">

        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">Documentation</p>
          <nav className="space-y-1 sticky top-24">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${active === s.id ? "bg-gray-800 text-white" : "text-gray-500 hover:text-white"}`}
              >
                {s.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {sections.filter(s => s.id === active).map(s => (
            <div key={s.id}>
              <p className="text-green-500 text-xs font-medium uppercase tracking-widest mb-3">Docs</p>
              <h1 className="text-3xl font-bold text-white mb-8">{s.title}</h1>
              <div className="text-gray-400 text-sm leading-relaxed">{s.content}</div>
            </div>
          ))}
        </div>

      </div>

      <footer style={{ background: "#0a0a0a" }} className="border-t border-gray-800/60 px-8 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-white text-sm">CloudSecure © 2026</span>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/cookies" className="hover:text-white transition">Cookies</Link>
            <Link href="/docs" className="hover:text-white transition">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}