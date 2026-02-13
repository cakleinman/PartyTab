import Link from "next/link";

export const metadata = {
  title: "Terms of Service | PartyTab",
  description: "PartyTab Terms of Service",
  alternates: {
    canonical: "https://partytab.app/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">PartyTab Terms of Service</h1>
      <p className="text-sm text-ink-500 mb-8">
        Effective Date: January 16, 2025
        <br />
        Last Updated: January 16, 2025
      </p>

      <div className="prose prose-ink max-w-none space-y-6 text-ink-700">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern access to and use of PartyTab,
          including the PartyTab website and web app (the &quot;Service&quot;).
        </p>

        <p>
          <strong>Who we are (MVP status).</strong> PartyTab is currently an MVP operated
          from Utah, USA by an unincorporated project/individual (&quot;PartyTab,&quot;
          &quot;we,&quot; &quot;us,&quot; &quot;our&quot;). If/when we form a legal entity
          (e.g., an LLC), that entity may become the Service operator and assume these Terms.
        </p>

        <p>
          By accessing or using the Service, you agree to these Terms. If you do not agree,
          do not use the Service.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">1) The Service (What PartyTab Does)</h2>
        <p>
          PartyTab helps groups record shared expenses and calculate suggested settlements
          (who owes whom). PartyTab may also provide features such as receipt scanning and
          itemization using AI for Pro users.
        </p>
        <p>
          <strong>No financial advice.</strong> The Service is for convenience and informational
          purposes only and is not financial, legal, or tax advice.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">2) Eligibility</h2>
        <p>
          You must be at least 13 years old to use the Service. If you are under the age of
          majority in your jurisdiction, you may use the Service only with consent of a parent/guardian.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">3) Accounts, Guests, and Invites</h2>
        <p>
          PartyTab may allow usage as a Guest (no signup) and/or via an account sign-in
          (e.g., Google sign-in or email sign-up).
        </p>
        <p>
          <strong>Guest access.</strong> Guests may join tabs via invite link and access
          a tab using a PIN on supported devices.
        </p>
        <p>
          <strong>Invites and sharing.</strong> If you create or share a tab link, you are
          responsible for who you share it with and what they can see or do inside that tab.
        </p>
        <p>
          <strong>Merging activity.</strong> If the Service offers the ability to merge Guest
          activity into a new account, you acknowledge that Guest activity may be associated
          with your account after you sign up or log in.
        </p>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials
          and for all activity that occurs under your account.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">4) Plans: Free and Pro</h2>
        <h3 className="text-lg font-medium text-ink-800">4.1 Free Plans</h3>
        <p>
          PartyTab may offer free usage tiers (e.g., Guest and Basic) with certain limits
          (such as limits on creating tabs).
        </p>

        <h3 className="text-lg font-medium text-ink-800">4.2 Pro Subscription</h3>
        <p>
          PartyTab offers a paid Pro plan with additional features (for example: unlimited
          active tabs, AI receipt scanning, claim mode, receipt image storage, and priority support).
        </p>
        <p>
          Pro pricing displayed on the upgrade page includes $3.99/month and may include a
          monthly/annual option.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">5) Payments, Auto-Renewal, Cancellations, Refunds</h2>

        <h3 className="text-lg font-medium text-ink-800">5.1 Billing and Auto-Renewal</h3>
        <p>
          If you purchase Pro, you authorize PartyTab (and our payment processor) to charge
          your payment method on a recurring basis at the then-current rate, plus applicable
          taxes, until you cancel.
        </p>

        <h3 className="text-lg font-medium text-ink-800">5.2 Payment Processor</h3>
        <p>
          Payments are processed by a third-party payment processor. Your payment may be
          subject to that processor&apos;s terms and privacy practices.
        </p>

        <h3 className="text-lg font-medium text-ink-800">5.3 Cancellation</h3>
        <p>
          You can cancel Pro at any time through your account/subscription settings (where
          available). The upgrade page states: &quot;Cancel anytime. No questions asked.&quot;
        </p>
        <p>Unless otherwise stated at checkout or required by law:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>cancellation takes effect at the end of your current paid billing period, and</li>
          <li>you will retain Pro access until then.</li>
        </ul>

        <h3 className="text-lg font-medium text-ink-800">5.4 Refunds</h3>
        <p>
          Fees are non-refundable except where required by law or where explicitly stated at
          checkout. If you believe you were charged in error, contact us using the method in
          Section 17 within 30 days of the charge.
        </p>

        <h3 className="text-lg font-medium text-ink-800">5.5 Price Changes</h3>
        <p>
          We may change pricing at any time. If you have an active subscription, we&apos;ll
          provide reasonable notice before changes take effect. If you don&apos;t agree, you
          should cancel before the new price applies.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">6) User Content (Expenses, Notes, Receipts)</h2>
        <p>
          The Service allows you to submit content such as names, expense entries, notes,
          and receipt images (&quot;User Content&quot;).
        </p>
        <p>
          You retain ownership of your User Content. You grant PartyTab a limited, worldwide,
          non-exclusive, royalty-free license to host, store, process, display, and use your
          User Content only to operate, maintain, and improve the Service and to provide the
          features you choose to use (including sharing tabs with participants).
        </p>
        <p>
          You represent and warrant that you have the rights to upload and share any User
          Content you submit.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">7) AI Features (Receipt Scanning / Parsing)</h2>
        <p>If the Service provides AI-assisted receipt scanning or parsing, you understand:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>AI outputs can be incorrect or incomplete,</li>
          <li>you are responsible for reviewing and confirming results before relying on them, and</li>
          <li>PartyTab is not responsible for losses caused by errors in AI outputs.</li>
        </ul>
        <p>
          (If you enable receipt image storage, you acknowledge images may be stored to
          provide that feature.)
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">8) Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>use the Service for unlawful purposes,</li>
          <li>attempt to gain unauthorized access to tabs, accounts, or systems,</li>
          <li>upload malware or disrupt the Service,</li>
          <li>scrape or reverse engineer the Service (except where prohibited by law),</li>
          <li>harass, impersonate, or spam others using invites or tab features.</li>
        </ul>
        <p>We may suspend or terminate access for violations.</p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">9) Privacy</h2>
        <p>
          Our collection and use of personal information is described in our{" "}
          <Link href="/privacy" className="text-teal-600 underline hover:text-teal-700">
            Privacy Policy
          </Link>
          .
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">10) Intellectual Property</h2>
        <p>
          PartyTab and all associated software, design, branding, and content (excluding User
          Content) are owned by PartyTab or its licensors and protected by intellectual property
          laws. You receive a limited, revocable, non-transferable license to use the Service as intended.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">11) Feedback</h2>
        <p>
          If you provide suggestions or feedback, you grant PartyTab the right to use it
          without restriction or compensation.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">12) Disclaimers</h2>
        <p className="uppercase text-sm">
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; TO THE MAXIMUM
          EXTENT PERMITTED BY LAW, PARTYTAB DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED,
          INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>
          We do not guarantee uninterrupted operation, error-free calculations, or that
          participants will pay amounts shown.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">13) Limitation of Liability</h2>
        <p className="uppercase text-sm">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, PARTYTAB WILL NOT BE LIABLE FOR INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, LOST
          DATA, OR LOSS OF GOODWILL.
        </p>
        <p className="uppercase text-sm">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, PARTYTAB&apos;S TOTAL LIABILITY FOR ANY CLAIM
          WILL NOT EXCEED THE GREATER OF:
        </p>
        <ul className="list-disc pl-6 space-y-1 uppercase text-sm">
          <li>AMOUNTS YOU PAID TO PARTYTAB IN THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR</li>
          <li>$10 IF YOU HAVE NOT PAID PARTYTAB.</li>
        </ul>
        <p>
          Some jurisdictions do not allow certain limitations; in that case, these limits
          apply to the maximum extent permitted.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">14) Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless PartyTab from claims, damages, liabilities,
          and expenses (including reasonable attorneys&apos; fees) arising out of your use of
          the Service, your User Content, or your violation of these Terms.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">15) Termination</h2>
        <p>
          You may stop using the Service at any time. We may suspend or terminate your access
          if you violate these Terms or if we discontinue the Service.
        </p>
        <p>
          We may also modify or discontinue parts of the Service at any time (including plan
          features and limits), especially given MVP status.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">16) Governing Law and Venue (Utah)</h2>
        <p>
          These Terms are governed by the laws of the State of Utah, without regard to conflict
          of laws rules.
        </p>
        <p>
          Any dispute arising from these Terms or the Service will be brought in the state or
          federal courts located in Utah County, Utah, and you consent to jurisdiction and venue there.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">17) Contact</h2>
        <p>
          For questions about these Terms, please contact us via our{" "}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSf9nHa0_edABA2ZO-Ixz72hfI_G6L4v7OC9c6PjyhmQP1VQcA/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 underline hover:text-teal-700"
          >
            contact form
          </a>
          .
        </p>

        <div className="mt-12 pt-6 border-t border-sand-200">
          <Link href="/" className="text-teal-600 hover:text-teal-700 text-sm">
            &larr; Back to PartyTab
          </Link>
        </div>
      </div>
    </div>
  );
}
