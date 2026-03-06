"use client"

import Link from "next/link"

const features = [
  { title: "Multi-Cloud Scanning", desc: "Scan AWS, Azure, and GCP simultaneously. Get a unified view of your entire cloud security posture in minutes." },
  { title: "Real-Time Detection", desc: "Instant detection of misconfigurations, exposed resources, and policy violations across all your cloud accounts." },
  { title: "Security Score", desc: "A live security score that tracks your posture over time. Know exactly where you stand and how you're trending." },
  { title: "Step-by-Step Remediation", desc: "Every finding comes with detailed, actionable remediation steps tailored to your cloud provider." },
  { title: "Zero Trust Architecture", desc: "Built with security-first principles. Your credentials never leave your environment." },
  { title: "Drift Detection", desc: "Automatically detect configuration drift between scans. Stay ahead of changes before they become incidents." },
]

const steps = [
  { number: "01", title: "Connect Your Cloud", desc: "Add your AWS, Azure, or GCP account in seconds. No agents, no complex setup." },
  { number: "02", title: "Run a Scan", desc: "Kick off a scan with one click. CloudSecure checks hundreds of security rules instantly." },
  { number: "03", title: "Review Findings", desc: "Get a prioritized list of issues ranked by severity with a live security score." },
  { number: "04", title: "Fix & Monitor", desc: "Follow step-by-step guides and watch your score improve in real time." },
]

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "For individuals getting started",
    features: ["1 cloud account", "5 scans per month", "Basic findings report", "Email support"],
    cta: "Get Started",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    desc: "For teams that need more",
    features: ["10 cloud accounts", "Unlimited scans", "Advanced analytics", "Drift detection", "Priority support", "API access"],
    cta: "Start Free Trial",
    href: "/register",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large organizations",
    features: ["Unlimited accounts", "Unlimited scans", "SSO & SAML", "Custom integrations", "SLA guarantee", "Dedicated support"],
    cta: "Contact Sales",
    href: "mailto:sales@cloudsecure.io",
    highlight: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>

      {/* Navbar */}
      <nav style={{ background: "#0a0a0a" }} className="border-b border-gray-800/60 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex-1">
          <span className="text-base font-bold tracking-tight text-white">CloudSecure</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it works</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
        </div>
        <div className="flex-1 flex items-center justify-end gap-3">
          <Link href="/login" className="text-sm text-gray-500 hover:text-white transition px-4 py-2">
            Sign in
          </Link>
          <Link href="/register" className="text-sm bg-white hover:bg-gray-100 text-gray-900 font-semibold px-4 py-2.5 rounded-lg transition">
            Get started →
          </Link>
        </div>
      </nav>

      {/* Hero — #0a0a0a */}
      <section style={{ background: "#0a0a0a" }} className="px-8 pt-28 pb-24 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-900 bg-green-950/40 text-green-500 text-xs font-medium mb-10 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Now scanning AWS, Azure & GCP
        </div>

        <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6 max-w-3xl">
          Cloud security that actually makes sense.
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mb-10 leading-relaxed">
          CloudSecure scans your infrastructure for misconfigurations and vulnerabilities — and tells you exactly how to fix them.
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-3 mb-4">
          <Link href="/register" className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg text-sm transition">
            Start for free →
          </Link>
          <Link href="/login" className="px-6 py-3 text-gray-400 hover:text-white font-medium rounded-lg text-sm transition border border-gray-800 hover:border-gray-600">
            Sign in
          </Link>
        </div>
        <p className="text-gray-600 text-xs mt-2">No credit card required · Free forever plan</p>

        {/* Dashboard mockup */}
        <div className="mt-16 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          <div style={{ background: "#111" }} className="border-b border-gray-800 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <div className="flex-1 mx-4 bg-gray-800 rounded h-5 max-w-xs" />
          </div>
          <div style={{ background: "#111" }} className="p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Security Score", value: "87", color: "text-green-400" },
                { label: "Total Findings", value: "24", color: "text-white" },
                { label: "Critical", value: "2", color: "text-red-400" },
                { label: "High", value: "7", color: "text-orange-400" },
              ].map(card => (
                <div key={card.label} className="rounded-xl border border-gray-800 p-4" style={{ background: "#1a1a1a" }}>
                  <p className="text-xs text-gray-600 mb-1">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 rounded-xl border border-gray-800 p-4 h-28 flex items-center" style={{ background: "#1a1a1a" }}>
                <div className="w-full space-y-2">
                  {[{ label: "Jan", w: 80 }, { label: "Feb", w: 60 }, { label: "Mar", w: 87 }].map(b => (
                    <div key={b.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-6">{b.label}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${b.w}%` }} />
                      </div>
                      <span className="text-xs text-green-500 w-6">{b.w}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-gray-800 h-28 flex flex-col items-center justify-center gap-3" style={{ background: "#1a1a1a" }}>
                <p className="text-xs text-gray-600">By Severity</p>
                <div className="flex items-end gap-2">
                  {[
                    { color: "bg-red-500", h: 28, label: "C" },
                    { color: "bg-orange-500", h: 45, label: "H" },
                    { color: "bg-yellow-500", h: 36, label: "M" },
                    { color: "bg-blue-500", h: 22, label: "L" },
                  ].map(s => (
                    <div key={s.label} className="flex flex-col items-center gap-1">
                      <div className={`w-5 rounded-sm ${s.color} opacity-80`} style={{ height: `${s.h}px` }} />
                      <p className="text-xs text-gray-600">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof — #111 */}
      <section style={{ background: "#111" }} className="border-y border-gray-800/60 py-12 px-8">
        <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-8">Trusted by engineers at</p>
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {["Stripe", "Vercel", "Linear", "Notion", "Figma"].map(co => (
            <span key={co} className="text-gray-700 font-semibold text-lg tracking-tight">{co}</span>
          ))}
        </div>
      </section>

      {/* Features — #0f0f0f */}
      <section id="features" style={{ background: "#0f0f0f" }} className="px-8 py-24 border-b border-gray-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-green-500 text-xs font-medium uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl font-bold text-white">Everything you need to stay secure</h2>
            <p className="text-gray-500 mt-3 max-w-lg text-sm leading-relaxed">Built for engineers who need real-time visibility across their entire cloud footprint — without the noise.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "#222" }}>
            {features.map((f, i) => (
              <div key={f.title} style={{ background: "#0f0f0f" }} className="p-6 hover:bg-gray-900 transition border border-gray-800/40">
                <p className="text-xs text-gray-600 font-mono mb-3">0{i + 1}</p>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — #111 */}
      <section id="how-it-works" style={{ background: "#111" }} className="px-8 py-24 border-b border-gray-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-green-500 text-xs font-medium uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl font-bold text-white">Up and running in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-3 left-8 w-full h-px bg-gray-800" />
                )}
                <p className="text-xs font-bold text-gray-700 mb-4 font-mono tracking-widest">{step.number}</p>
                <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — #0a0a0a */}
      <section id="pricing" style={{ background: "#0a0a0a" }} className="px-8 py-24 border-b border-gray-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-green-500 text-xs font-medium uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl font-bold text-white">Simple, transparent pricing</h2>
            <p className="text-gray-500 mt-3 text-sm">Start free. Scale as you grow. No surprises.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-6 flex flex-col border ${
                plan.highlight
                  ? "border-green-800 bg-green-950/20"
                  : "border-gray-800"
              }`} style={plan.highlight ? {} : { background: "#111" }}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-green-500 text-black text-xs font-bold rounded-full">
                    Most popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-base font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && <span className="text-sm text-gray-500 mb-1">{plan.period}</span>}
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="text-green-500 font-bold text-xs">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold text-center transition ${
                    plan.highlight
                      ? "bg-green-500 hover:bg-green-400 text-black"
                      : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — #111 */}
      <section style={{ background: "#111" }} className="px-8 py-28 border-b border-gray-800/60">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Start securing your cloud today.</h2>
          <p className="text-gray-500 mb-8 text-sm">No agents. No complexity. Just clear, actionable security insights.</p>
          <Link href="/register" className="inline-block px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg text-sm transition">
            Get started for free →
          </Link>
        </div>
      </section>

      {/* Footer — #0a0a0a */}
      <footer style={{ background: "#0a0a0a" }} className="px-8 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-sm">CloudSecure</span>
            <span className="text-gray-700 text-sm">© 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="/terms" className="hover:text-white transition">Terms of Service</a>
            <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
            <Link href="/cookies" className="hover:text-white transition">Cookie Policy</Link>
            <Link href="/docs" className="hover:text-white transition">Documentation</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}