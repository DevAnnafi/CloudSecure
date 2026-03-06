"use client"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <nav style={{ background: "#0a0a0a" }} className="border-b border-gray-800/60 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-base font-bold tracking-tight text-white">CloudSecure</Link>
        <Link href="/login" className="text-sm bg-white hover:bg-gray-100 text-gray-900 font-semibold px-4 py-2.5 rounded-lg transition">Get started →</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-20">
        <p className="text-green-500 text-xs font-medium uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-600 text-sm mb-12">Last updated: March 6, 2026</p>

        <div className="space-y-10 text-gray-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using CloudSecure ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all users, including those who access the Service without creating an account.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Description of Service</h2>
            <p>CloudSecure is a cloud security scanning platform that allows users to connect cloud accounts (AWS, Azure, GCP) and scan for misconfigurations, vulnerabilities, and compliance violations. We provide security scores, findings reports, and remediation guidance.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. User Accounts</h2>
            <p>You must create an account to use certain features of the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to use the Service to:</p>
            <ul className="space-y-2 pl-4">
              {[
                "Scan cloud infrastructure you do not own or have explicit authorization to scan",
                "Attempt to gain unauthorized access to other users' data or accounts",
                "Upload or transmit malicious code or content",
                "Reverse engineer, decompile, or disassemble any part of the Service",
                "Use the Service for any unlawful purpose",
              ].map(item => (
                <li key={item} className="flex gap-2"><span className="text-green-500 shrink-0">—</span>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Cloud Credentials</h2>
            <p>CloudSecure requires read access to your cloud accounts to perform scans. We do not store your cloud credentials beyond what is necessary to complete a scan. You are solely responsible for the permissions you grant and ensuring those permissions follow the principle of least privilege.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Subscription and Billing</h2>
            <p>Certain features of the Service require a paid subscription. All fees are non-refundable unless otherwise stated. We reserve the right to change pricing at any time with 30 days notice to existing subscribers. Free plan users may be subject to usage limits.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Intellectual Property</h2>
            <p>All content, features, and functionality of the Service — including but not limited to the software, text, graphics, and design — are owned by CloudSecure and are protected by applicable intellectual property laws. You may not reproduce or distribute any part of the Service without written permission.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" and "as available" without warranties of any kind. CloudSecure does not warrant that the Service will be uninterrupted, error-free, or completely secure. Security scan results are informational and do not constitute a guarantee of security.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, CloudSecure shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to security breaches, data loss, or business interruption.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">10. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time for violations of these Terms. Upon termination, your right to use the Service will immediately cease. You may also terminate your account at any time from your account settings.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">11. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of significant changes via email or a notice on the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">12. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@cloudsecure.io" className="text-green-500 hover:underline">legal@cloudsecure.io</a>.</p>
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