import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service - Luminae',
  description: 'Luminae Terms of Service',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Effective Date: April 18, 2026</p>

        {/* 1. Acceptance of Terms */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Welcome to Luminae, a product of Aletheia Labs. By accessing or using
            the Luminae platform at{' '}
            <a
              href="https://luminae.qzz.io"
              className="underline hover:text-foreground"
            >
              luminae.qzz.io
            </a>{' '}
            (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of
            Service (the &ldquo;Terms&rdquo;). If you do not agree to all of these
            Terms, you may not access or use the Service.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These Terms constitute a legally binding agreement between you
            (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and
            Aletheia Labs (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;). We reserve the right to update or modify these
            Terms at any time, and your continued use of the Service following any
            changes constitutes acceptance of the revised Terms.
          </p>
        </section>

        {/* 2. Description of Service */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Luminae is an AI-powered research paper analysis tool. Users may upload
            academic papers in PDF format, and the Service uses artificial
            intelligence models (powered by Mistral AI) to generate analyses
            including, but not limited to, paper critiques, experiment proposals,
            and grant application outlines.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The Service is provided as-is and is intended for informational and
            research-assistance purposes only. Luminae is not a substitute for
            professional academic peer review, legal counsel, or any other form of
            expert advice.
          </p>
        </section>

        {/* 3. User Accounts */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            To access certain features of the Service, you must sign in using
            Google OAuth authentication, which is facilitated through Supabase. By
            signing in, you authorize us to access basic profile information from
            your Google account (such as your name and email address) as needed to
            provide the Service.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You are responsible for maintaining the security of your account and for
            all activities that occur under your account. You agree to notify us
            immediately of any unauthorized access to or use of your account. We are
            not liable for any loss or damage arising from your failure to protect
            your account credentials.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You may not create multiple accounts to circumvent usage limits, and you
            may not share your account access with third parties.
          </p>
        </section>

        {/* 4. Acceptable Use */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You agree to use the Service only for lawful purposes and in accordance
            with these Terms. Specifically, you agree not to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground leading-relaxed mb-4 space-y-2">
            <li>
              Upload, submit, or transmit any content that is illegal, harmful,
              threatening, abusive, defamatory, or otherwise objectionable.
            </li>
            <li>
              Upload documents that you do not have the legal right to distribute or
              that infringe upon the intellectual property rights of any third party.
            </li>
            <li>
              Abuse, overload, or exploit the AI analysis API through automated
              scripts, bots, or any means designed to circumvent rate limits or
              budget restrictions.
            </li>
            <li>
              Scrape, crawl, or use any automated means to extract data or content
              from the Service without prior written consent from Aletheia Labs.
            </li>
            <li>
              Attempt to gain unauthorized access to the Service, other user
              accounts, or any systems or networks connected to the Service.
            </li>
            <li>
              Reverse-engineer, decompile, or disassemble any part of the Service or
              its underlying technology.
            </li>
            <li>
              Use the Service to generate content for purposes of academic fraud,
              plagiarism, or misrepresentation.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We reserve the right to suspend or terminate your access to the Service
            at any time if we reasonably believe you are in violation of these Terms.
          </p>
        </section>

        {/* 5. Intellectual Property */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong className="text-foreground">Your Content.</strong> You retain
            all ownership rights to the academic papers and documents you upload to
            the Service. By uploading content, you grant Aletheia Labs a limited,
            non-exclusive, non-transferable license to process your documents solely
            for the purpose of providing the Service to you.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong className="text-foreground">AI-Generated Outputs.</strong> The
            analyses, critiques, experiment proposals, grant outlines, and other
            outputs generated by the Service are provided to you on an
            &ldquo;as-is&rdquo; basis. You are free to use these outputs for your
            personal and professional purposes. However, Aletheia Labs makes no
            claim of ownership over AI-generated outputs and provides no warranty
            regarding their accuracy, completeness, or fitness for any particular
            purpose.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong className="text-foreground">Our Property.</strong> The Service,
            including its design, code, branding, logos, and all associated
            intellectual property, is owned by Aletheia Labs and is protected by
            applicable intellectual property laws. Nothing in these Terms grants you
            any right to use our trademarks, trade names, or other proprietary
            assets.
          </p>
        </section>

        {/* 6. AI-Generated Content Disclaimer */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            6. AI-Generated Content Disclaimer
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Luminae uses artificial intelligence models provided by Mistral AI to
            analyze uploaded documents and generate outputs. You acknowledge and
            agree that:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground leading-relaxed mb-4 space-y-2">
            <li>
              AI-generated content is produced by machine learning models and may
              contain errors, inaccuracies, omissions, or biases.
            </li>
            <li>
              AI-generated analyses, critiques, and proposals do not constitute
              professional advice of any kind, including academic, scientific,
              legal, financial, or medical advice.
            </li>
            <li>
              You should independently verify all AI-generated outputs before
              relying on them for any decision-making, publication, or submission.
            </li>
            <li>
              Aletheia Labs does not guarantee the quality, reliability, or
              suitability of any AI-generated content for your specific needs.
            </li>
            <li>
              The AI models may produce different results for the same input at
              different times, and we do not guarantee consistency of outputs.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aletheia Labs expressly disclaims all liability for any actions taken or
            decisions made based on AI-generated content provided through the
            Service.
          </p>
        </section>

        {/* 7. Usage Limits and Budget */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            7. Usage Limits and Budget
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Luminae operates on a budget-based system with defined usage tiers. The
            Service offers a free tier and/or demo mode that is subject to budget
            limits and rate limiting. These limits are in place to ensure fair access
            for all users and to manage operational costs.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You acknowledge that:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground leading-relaxed mb-4 space-y-2">
            <li>
              Usage limits, including the number of analyses, uploads, and API calls,
              may be imposed and may change at any time without prior notice.
            </li>
            <li>
              Rate limiting may be applied to prevent abuse and ensure service
              stability.
            </li>
            <li>
              Once your allocated budget is exhausted, access to certain features may
              be restricted until the budget resets or is replenished.
            </li>
            <li>
              Attempting to bypass, circumvent, or manipulate the budget or rate
              limiting systems constitutes a violation of these Terms.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We reserve the right to modify the budget system, usage tiers, and
            associated limits at our sole discretion.
          </p>
        </section>

        {/* 8. Data and Privacy */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Data and Privacy</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your privacy is important to us. Our collection, use, and handling of
            your personal information and uploaded content are governed by our{' '}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            , which is incorporated into these Terms by reference.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            By using the Service, you consent to the collection and processing of
            data as described in our Privacy Policy. This includes information
            collected through Google OAuth authentication, uploaded documents
            processed for AI analysis, and usage data necessary to operate and
            improve the Service.
          </p>
        </section>

        {/* 9. Service Availability */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">9. Service Availability</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The Service is hosted on Render and relies on third-party
            infrastructure and AI model providers (Mistral AI). While we strive to
            maintain high availability, we do not guarantee uninterrupted,
            error-free, or secure access to the Service at all times.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The Service may be temporarily unavailable due to scheduled maintenance,
            updates, infrastructure outages, third-party service disruptions, or
            circumstances beyond our control. We will make reasonable efforts to
            notify users of planned downtime but are not obligated to do so.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aletheia Labs provides no service-level agreement (SLA) and makes no
            uptime guarantees. We are not liable for any loss or damage resulting
            from service interruptions or unavailability.
          </p>
        </section>

        {/* 10. Limitation of Liability */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            10. Limitation of Liability
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            To the fullest extent permitted by applicable law, Aletheia Labs, its
            officers, directors, employees, agents, and affiliates shall not be
            liable for any indirect, incidental, special, consequential, or punitive
            damages, including but not limited to loss of data, loss of profits,
            loss of research, or damage to reputation, arising out of or in
            connection with your use of or inability to use the Service.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            In no event shall Aletheia Labs&apos; total aggregate liability to you
            for all claims arising out of or relating to the Service exceed the
            amount you have paid to Aletheia Labs, if any, for access to the
            Service during the twelve (12) months immediately preceding the event
            giving rise to the claim.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, whether express or
            implied, including but not limited to implied warranties of
            merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>
        </section>

        {/* 11. Termination */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">11. Termination</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You may stop using the Service at any time. You may request deletion of
            your account and associated data by contacting us at the email address
            provided below.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We reserve the right to suspend or terminate your access to the Service
            at any time, with or without cause and with or without notice, including
            but not limited to cases where we reasonably believe you have violated
            these Terms. Upon termination, your right to use the Service ceases
            immediately.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Provisions of these Terms that by their nature should survive
            termination shall survive, including but not limited to Sections 5, 6,
            10, and 13.
          </p>
        </section>

        {/* 12. Changes to Terms */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Aletheia Labs reserves the right to modify or replace these Terms at any
            time at our sole discretion. When we make material changes, we will
            update the &ldquo;Effective Date&rdquo; at the top of this page and, where
            practicable, provide notice through the Service or via email.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your continued use of the Service after any changes to these Terms
            constitutes acceptance of the revised Terms. If you do not agree with
            the updated Terms, you must stop using the Service.
          </p>
        </section>

        {/* 13. Governing Law */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">13. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These Terms shall be governed by and construed in accordance with the
            laws of the United States, without regard to conflict of law principles.
            Any disputes arising out of or relating to these Terms or the Service
            shall be resolved through binding arbitration or in the courts of
            competent jurisdiction, as determined by applicable law.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You agree that any claim or cause of action arising out of or related to
            the Service must be filed within one (1) year after such claim or cause
            of action arose, or be forever barred.
          </p>
        </section>

        {/* 14. Contact Information */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">14. Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have any questions, concerns, or feedback regarding these Terms
            of Service, please contact us at:
          </p>
          <div className="text-muted-foreground leading-relaxed mb-4">
            <p className="font-semibold text-foreground">Aletheia Labs</p>
            <p>
              Email:{' '}
              <a
                href="mailto:contact@qzz.io"
                className="underline hover:text-foreground"
              >
                contact@qzz.io
              </a>
            </p>
            <p>
              Website:{' '}
              <a
                href="https://luminae.qzz.io"
                className="underline hover:text-foreground"
              >
                luminae.qzz.io
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
