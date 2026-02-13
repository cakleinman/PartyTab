import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | PartyTab",
  description:
    "Learn how PartyTab collects, uses, and protects your data. Covers account info, receipt scanning, cookies, and your privacy choices.",
  alternates: {
    canonical: "https://partytab.app/privacy",
  },
  openGraph: {
    title: "Privacy Policy | PartyTab",
    description:
      "Learn how PartyTab collects, uses, and protects your data when splitting group expenses.",
    url: "https://partytab.app/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">PartyTab Privacy Policy</h1>
      <p className="text-sm text-ink-500 mb-8">
        Effective Date: January 16, 2025
        <br />
        Last Updated: January 16, 2025
      </p>

      <div className="prose prose-ink max-w-none space-y-6 text-ink-700">
        <p>
          This Privacy Policy explains how PartyTab (&quot;PartyTab,&quot; &quot;we,&quot;
          &quot;us,&quot; &quot;our&quot;) collects, uses, and shares information when you
          use partytab.app and the PartyTab web application (the &quot;Service&quot;).
        </p>

        <p>
          <strong>MVP note:</strong> PartyTab is currently an MVP operated from Utah, USA
          by an unincorporated project/individual. If we later form a legal entity (like
          an LLC), that entity may become the operator of the Service and this policy may
          be updated.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">1) Information We Collect</h2>

        <h3 className="text-lg font-medium text-ink-800">A. Information you provide</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account information</strong> (if you create an account): such as email
            address, name, and sign-in provider details (e.g., Google sign-in), depending
            on how you authenticate.
          </li>
          <li>
            <strong>Tab and expense data:</strong> such as tab names, participant names or
            nicknames, expense descriptions, amounts, dates, notes, and how expenses are split.
          </li>
          <li>
            <strong>Receipts and images</strong> (Pro features): if you upload receipt images
            or use receipt storage features, we collect and store those images and any
            extracted text data.
          </li>
          <li>
            <strong>Communications:</strong> if you contact us, we may collect the contents
            of your message and any contact info you provide.
          </li>
        </ul>

        <h3 className="text-lg font-medium text-ink-800">B. Payment information (Pro subscriptions)</h3>
        <p>
          When you buy Pro, payments are processed by a third-party payment processor (e.g.,
          Stripe). We generally do not receive your full payment card number. We may receive
          limited billing-related information such as:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>subscription status,</li>
          <li>billing period dates,</li>
          <li>payment success/failure,</li>
          <li>and a partial identifier (like last 4 digits) depending on the processor.</li>
        </ul>

        <h3 className="text-lg font-medium text-ink-800">C. Information collected automatically</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Usage and device data:</strong> IP address, browser type, device identifiers,
            pages/screens viewed, actions taken, approximate location (derived from IP), and timestamps.
          </li>
          <li>
            <strong>Cookies / local storage:</strong> we may use cookies or browser storage
            to keep you signed in, remember settings, and support core functionality and analytics.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">2) How We Use Information</h2>
        <p>We use information to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>provide, operate, and maintain the Service (including creating tabs, calculating balances, and showing settlements),</li>
          <li>enable collaboration (sharing tabs with participants you invite),</li>
          <li>process subscriptions and manage Pro access,</li>
          <li>power and improve features, including AI-assisted receipt scanning/parsing,</li>
          <li>prevent fraud, abuse, and security incidents,</li>
          <li>troubleshoot, debug, and improve reliability,</li>
          <li>comply with legal obligations and enforce our terms.</li>
        </ul>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">3) AI Receipt Scanning / Parsing</h2>
        <p>
          If you use AI receipt scanning or parsing features, PartyTab may process receipt
          images and extracted text to provide those features. This may involve sending
          receipt data to trusted service providers that help us run AI or document parsing.
        </p>
        <p>Because this is an MVP, our AI implementation may evolve. We aim to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>use AI inputs/outputs only to provide and improve the feature,</li>
          <li>limit access to receipt data to people and vendors who need it to operate the Service,</li>
          <li>and choose vendors with reasonable security practices.</li>
        </ul>
        <p>
          <strong>Important:</strong> AI outputs can be inaccurate. You are responsible for
          reviewing parsed results before relying on them.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">4) How We Share Information</h2>
        <p>We may share information in these ways:</p>

        <h3 className="text-lg font-medium text-ink-800">A. With people you share tabs with</h3>
        <p>
          If you invite someone to a tab (or share a tab link), tab participants may be able
          to view and add information inside that tab, depending on your settings and how
          the Service works at the time.
        </p>

        <h3 className="text-lg font-medium text-ink-800">B. With service providers</h3>
        <p>
          We use third-party vendors to help us operate the Service (for example: hosting,
          databases, analytics, error monitoring, AI/document processing, email delivery, and
          payments). They may process information on our behalf under contractual obligations.
        </p>

        <h3 className="text-lg font-medium text-ink-800">C. For legal and safety reasons</h3>
        <p>We may disclose information if we believe it&apos;s necessary to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>comply with law or legal process,</li>
          <li>protect the rights, safety, or property of PartyTab, users, or the public,</li>
          <li>investigate fraud or security issues.</li>
        </ul>

        <h3 className="text-lg font-medium text-ink-800">D. Business changes</h3>
        <p>
          If PartyTab is involved in a merger, acquisition, reorganization, or asset sale,
          information may be transferred as part of that transaction.
        </p>
        <p>
          We do not sell your personal information in the ordinary sense of &quot;selling&quot;
          data for money.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">5) Data Retention</h2>
        <p>
          We keep information as long as needed to provide the Service and for legitimate
          business purposes (such as security, dispute resolution, and legal compliance).
        </p>
        <p>Because we&apos;re an MVP, retention rules may be simpler at first. Typical examples:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Tab data may remain until deleted by the tab owner or until accounts are deleted.</li>
          <li>
            Receipt images (if stored) may remain until deleted by the uploader/tab owner, or
            until your Pro plan ends and the Service applies Free-tier limits (if applicable).
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">6) Security</h2>
        <p>
          We take reasonable steps to protect information, but no system is 100% secure.
          Please use strong passwords where applicable, keep tab links private, and be
          mindful of what you share.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">7) Your Choices and Controls</h2>
        <p>Depending on current features, you may be able to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>edit or delete tab entries,</li>
          <li>delete receipt images you uploaded,</li>
          <li>cancel Pro subscriptions (so your plan does not renew),</li>
          <li>request deletion of your account/data (see &quot;Contact&quot; below).</li>
        </ul>
        <p>
          You can also control cookies through your browser settings, though disabling some
          cookies may impact functionality.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">8) Children&apos;s Privacy</h2>
        <p>
          The Service is not intended for children under 13, and we do not knowingly collect
          personal information from children under 13. If you believe a child has provided
          personal information, contact us and we will take steps to delete it.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">9) International Users</h2>
        <p>
          We operate from the United States. If you use the Service from outside the U.S.,
          your information may be processed and stored in the U.S. (and potentially other
          countries where our vendors operate).
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">10) Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If changes are material,
          we&apos;ll provide notice (for example, by updating the date at the top and/or
          posting a notice in the app). Continued use of the Service after updates means
          you accept the revised policy.
        </p>

        <h2 className="text-xl font-semibold text-ink-900 mt-8">11) Contact Us</h2>
        <p>
          For questions about this Privacy Policy, please contact us via our{" "}
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
