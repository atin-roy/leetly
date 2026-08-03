import type { Metadata } from "next"
import { MarketingShell } from "@/components/marketing/page-shell"

export const metadata: Metadata = {
  title: "Terms of Service — Leetly",
  description: "The terms you agree to by using Leetly.",
}

export default function TermsPage() {
  return (
    <MarketingShell
      eyebrow="Legal"
      title="Terms of Service"
      lede="Leetly is free and open source, offered as is. These are the terms you accept by using it."
      updated="3 August 2026"
    >
      <h2>1. Acceptance of terms</h2>
      <p>
        By accessing or using Leetly (&quot;the Service&quot;), you agree to be
        bound by these Terms of Service. If you do not agree, do not use the
        Service.
      </p>

      <h2>2. Description of the Service</h2>
      <p>
        Leetly is a free, open-source web application for tracking interview
        problem practice. It provides attempt tracking, analytics, spaced
        repetition scheduling, notes, and custom problem lists.
      </p>

      <h2>3. Accounts</h2>
      <p>
        You register with an email address and a password that you choose. You
        are responsible for keeping that password secure and for all activity
        under your account. Provide accurate information, and tell us if you
        believe your account has been used without your permission.
      </p>

      <h2>4. Your responsibilities</h2>
      <p>When using the Service, you agree to:</p>
      <ul>
        <li>Use it only for lawful purposes</li>
        <li>Not disrupt, overload, or interfere with it</li>
        <li>Not attempt to reach other users&apos; data</li>
        <li>Not scrape or abuse it with automated tools</li>
      </ul>

      <h2>5. Intellectual property</h2>
      <p>
        Leetly is released under the MIT License and the source is available on{" "}
        <a
          href="https://github.com/atin-roy/leetly"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        . You keep ownership of everything you create inside the Service.
      </p>

      <h2>6. Availability and changes</h2>
      <p>
        We aim to keep the Service running but do not guarantee uninterrupted
        access. We may modify, suspend, or discontinue it at any time, with or
        without notice, and may change features or interfaces as needed.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available&quot;,
        without warranties of any kind, express or implied. To the fullest
        extent permitted by law, the creators and contributors of Leetly are not
        liable for any indirect, incidental, special, or consequential damages
        arising from your use of it.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may suspend or end your access at any time, with or without cause.
        You may stop using the Service whenever you like. On termination your
        right to use it ends immediately; you can request deletion of your data
        at that point or any other.
      </p>

      <h2>9. Changes to these terms</h2>
      <p>
        These terms may be updated. Changes appear on this page with a new date
        above. Continuing to use the Service after a change means you accept the
        updated terms.
      </p>

      <h2>10. Contact</h2>
      <p>
        For questions about these terms, open an issue on the{" "}
        <a
          href="https://github.com/atin-roy/leetly"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub repository
        </a>
        .
      </p>
    </MarketingShell>
  )
}
