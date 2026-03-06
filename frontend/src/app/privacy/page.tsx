"use client"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <nav style={{ background: "#0a0a0a" }} className="border-b border-gray-800/60 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-base font-bold tracking-tight text-white">CloudSecure</Link>
        <Link href="/login" className="text-sm bg-white hover:bg-gray-100 text-gray-900 font-semibold px-4 py-2.5 rounded-lg transition">Get started →</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-20">
        <p className="text-green-500 text-xs font-medium uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-600 text-sm mb-12">Last updated: March 6, 2026</p>

        <div className="space-y-10 text-gray-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="space-y-2 pl-4">
              {[
                "Account information: name, email address, and password when you register",
                "Cloud account metadata: account IDs, account names, and cloud provider information you connect",
                "Scan data: security findings, scores, and results generated from your scans",
                "Usage data: how you interact with the Service, including pages visited and features used",
                "Device information: IP address, browser type, and operating system",
              ].map(item => (
                <li key={item} className="flex gap-2"><span className="text-green-500 shrink-0">—</span>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. How We Use Your Information</h2>
            <ul className="space-y-2 pl-4">
              {[
                "To provide, operate, and improve the Service",
                "To authenticate your identity and manage your account",
                "To send important service notifications and security alerts",
                "To analyze usage patterns and improve our product",
                "To respond to support requests and communicate with you",
              ].map(item => (
                <li key={item} className="flex gap-2"><span className="text-green-500 shrink-0">—</span>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Cloud Credentials</h2>
            <p>CloudSecure does not store your cloud provider credentials (AWS access keys, Azure credentials, GCP service account keys) beyond the scope of performing a scan. Credentials are used only to execute the scan and are not persisted in our database.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal information. We may share your information with trusted third-party service providers who assist in operating the Service (such as cloud hosting and analytics), subject to confidentiality agreements. We may also disclose information when required by law.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. Scan results are retained for up to 12 months. You may request deletion of your data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS), hashed passwords, and access controls. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may also object to processing or request data portability. To exercise these rights, contact us at <a href="mailto:privacy@cloudsecure.io" className="text-green-500 hover:underline">privacy@cloudsecure.io</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Contact</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:privacy@cloudsecure.io" className="text-green-500 hover:underline">privacy@cloudsecure.io</a>.</p>
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