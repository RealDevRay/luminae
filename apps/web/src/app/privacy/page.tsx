import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy - Luminae',
  description: 'Luminae Privacy Policy — how we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Effective Date: April 18, 2026</p>

        <p className="text-muted-foreground leading-relaxed mb-8">
          Aletheia Labs (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates Luminae (the &quot;Service&quot;), accessible at{' '}
          <a href="https://luminae.qzz.io" className="text-primary hover:underline">luminae.qzz.io</a>.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
          By using Luminae, you consent to the practices described in this policy.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>

          <h3 className="font-medium mb-2">Account Information</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you sign in with Google, we receive the following from your Google account:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>Your name</li>
            <li>Email address</li>
            <li>Profile picture</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We do not receive or store your Google password. Authentication is handled securely by Google OAuth 2.0 through Supabase.
          </p>

          <h3 className="font-medium mb-2">Uploaded Content</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you upload academic papers or provide URLs for analysis, we process the document content to generate AI-powered analysis. Uploaded documents are processed in memory and are not permanently stored on our servers in their original form.
          </p>

          <h3 className="font-medium mb-2">Analysis Data</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The results of your analyses (critiques, experiment proposals, grant outlines) are stored in association with your account so you can access your analysis history.
          </p>

          <h3 className="font-medium mb-2">Usage Data</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We automatically collect certain information when you use the Service, including API usage metrics, token consumption, and processing costs. This data is used for budget management and service optimization.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>Provide, operate, and maintain the Service</li>
            <li>Process and analyze your uploaded documents using AI</li>
            <li>Store and display your analysis history</li>
            <li>Manage usage budgets and rate limits</li>
            <li>Monitor and improve the performance and reliability of the Service</li>
            <li>Communicate with you about service-related matters</li>
            <li>Detect, prevent, and address technical issues or abuse</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We do not sell, rent, or trade your personal information to third parties for marketing purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Data Storage and Security</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your data is stored across the following infrastructure:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li><strong>Supabase</strong> — Account information and analysis history are stored in a PostgreSQL database managed by Supabase with row-level security.</li>
            <li><strong>Redis</strong> — Temporary job state and processing data are stored in Redis with automatic expiration (7-day TTL).</li>
            <li><strong>Render</strong> — Our API backend runs on Render&apos;s infrastructure with encrypted connections (HTTPS/TLS).</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We implement industry-standard security measures including encrypted data transmission (TLS), secure authentication flows, and access controls. However, no method of electronic storage or transmission is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Luminae integrates with the following third-party services, each with their own privacy policies:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li><strong>Google OAuth</strong> — Used for user authentication. Subject to{' '}
              <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.
            </li>
            <li><strong>Supabase</strong> — Used for authentication and database storage. Subject to{' '}
              <a href="https://supabase.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Supabase&apos;s Privacy Policy</a>.
            </li>
            <li><strong>Mistral AI</strong> — Used for document analysis and AI processing. Document content is sent to Mistral AI&apos;s API for analysis. Subject to{' '}
              <a href="https://mistral.ai/terms/#privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Mistral AI&apos;s Privacy Policy</a>.
            </li>
            <li><strong>Render</strong> — Used for hosting the backend API. Subject to{' '}
              <a href="https://render.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Render&apos;s Privacy Policy</a>.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Cookies and Local Storage</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Luminae uses the following browser storage mechanisms:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li><strong>Authentication tokens</strong> — Stored in local storage to maintain your signed-in session.</li>
            <li><strong>Analysis cache</strong> — Recent analysis results may be cached locally for faster access.</li>
            <li><strong>Preferences</strong> — Your display preferences are stored locally.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We do not use third-party tracking cookies or advertising cookies. You can clear local storage at any time through your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li><strong>Account data</strong> — Retained for as long as your account is active, or until you request deletion.</li>
            <li><strong>Analysis history</strong> — Stored indefinitely in your account unless you delete individual analyses or your account.</li>
            <li><strong>Temporary job data</strong> — Automatically deleted from Redis after 7 days.</li>
            <li><strong>Usage logs</strong> — Retained for up to 7 days for operational monitoring.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Depending on your jurisdiction, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li><strong>Access</strong> — Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction</strong> — Request correction of inaccurate personal data.</li>
            <li><strong>Deletion</strong> — Request deletion of your account and associated data.</li>
            <li><strong>Portability</strong> — Request your data in a portable, machine-readable format.</li>
            <li><strong>Opt-out</strong> — You may stop using the Service at any time. You can revoke Google OAuth access from your{' '}
              <a href="https://myaccount.google.com/permissions" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Account settings</a>.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:contact@qzz.io" className="text-primary hover:underline">contact@qzz.io</a>.
            We will respond to your request within 30 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Luminae is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal data from a child under 13, we will take steps to delete that information promptly. If you believe a child under 13 has provided us with personal information, please contact us at{' '}
            <a href="mailto:contact@qzz.io" className="text-primary hover:underline">contact@qzz.io</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">9. International Data Transfers</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your information may be transferred to and processed in countries other than your country of residence. Our infrastructure providers (Supabase, Render, Mistral AI) may store and process data in the United States and the European Union. By using the Service, you consent to the transfer of your data to these jurisdictions, which may have different data protection laws than your jurisdiction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. When we make changes, we will update the &quot;Effective Date&quot; at the top of this page. Your continued use of the Service after any changes constitutes acceptance of the updated policy. We encourage you to review this page periodically.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul className="list-none text-muted-foreground space-y-2 mb-4">
            <li><strong>Organization:</strong> Aletheia Labs</li>
            <li><strong>Email:</strong>{' '}
              <a href="mailto:contact@qzz.io" className="text-primary hover:underline">contact@qzz.io</a>
            </li>
            <li><strong>Website:</strong>{' '}
              <a href="https://luminae.qzz.io" className="text-primary hover:underline">luminae.qzz.io</a>
            </li>
          </ul>
        </section>

        <div className="border-t pt-8 mt-12">
          <p className="text-sm text-muted-foreground text-center">
            &copy; 2026 Aletheia Labs. All rights reserved. |{' '}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
