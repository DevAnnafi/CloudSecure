"use client"
import Link from "next/link"

export default function CookiesPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <nav style={{ background: "#0a0a0a" }} className="border-b border-gray-800/60 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-base font-bold tracking-tight text-white">CloudSecure</Link>
        <Link href="/login" className="text-sm bg-white hover:bg-gray-100 text-gray-900 font-semibold px-4 py-2.5 rounded-lg transition">Get started →</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-20">
        <p className="text-green-500 text-xs font-medium uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-4xl font-bold text-white mb-2">Cookie Policy</h1>
        <p className="text-gray-600 text-sm mb-12">Last updated: March 6, 2026</p>

        <div className="space-y-10 text-gray-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, keep you signed in, and understand how you use CloudSecure.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Cookies We Use</h2>
            <div className="space-y-4">
              {[
                { name: "Essential Cookies", desc: "Required for the Service to function. These include session tokens and authentication cookies. You cannot opt out of these." },
                { name: "Analytics Cookies", desc: "Help us understand how users interact with the Service. We use this data to improve performance and user experience. These are anonymized." },
                { name: "Preference Cookies", desc: "Remember your settings and preferences, such as your chosen language or display options." },
              ].map(c => (
                <div key={c.name} className="border border-gray-800 rounded-xl p-4" style={{ background: "#111" }}>
                  <p className="text-white font-medium text-sm mb-1">{c.name}</p>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Third-Party Cookies</h2>
            <p>We may use third-party services such as analytics providers that set their own cookies. These are governed by those providers' privacy policies. We do not control these cookies.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Managing Cookies</h2>
            <p>You can control and delete cookies through your browser settings. Note that disabling essential cookies may affect the functionality of the Service. Most browsers allow you to block or delete cookies under their privacy or security settings.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Contact</h2>
            <p>For questions about our cookie practices, contact us at <a href="mailto:privacy@cloudsecure.io" className="text-green-500 hover:underline">privacy@cloudsecure.io</a>.</p>
          </section>

        </div>
      </div>

      <footer style={{ background: "#0a0a0a" }} className="border-t border-gray-800/60 px-8 py-8">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
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