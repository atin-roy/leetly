import type { Metadata } from "next"
import { MarketingShell } from "@/components/marketing/page-shell"

export const metadata: Metadata = {
  title: "Privacy Policy — Leetly",
  description:
    "What Leetly stores, why it stores it, and how to have it deleted.",
}

export default function PrivacyPage() {
  return (
    <MarketingShell
      eyebrow="Legal"
      title="Privacy Policy"
      lede="Leetly holds your practice history. This page says exactly what that means: what is stored, who can see it, and how to get rid of it."
      updated="3 August 2026"
    >
      <h2>1. Information we collect</h2>
      <p>
        You create a Leetly account with an email address and a password. We
        store:
      </p>
      <ul>
        <li>Your email address</li>
        <li>A display name, if you choose to set one</li>
        <li>
          A BCrypt hash of your password. The password itself is never stored
          and cannot be recovered from the hash
        </li>
      </ul>
      <p>
        We also store the data you create in the app: problems, attempts,
        mistakes, notes, lists, review schedules, and the analytics derived from
        them.
      </p>

      <h2>2. How we use it</h2>
      <p>Your information is used only to:</p>
      <ul>
        <li>Sign you in and keep your session valid</li>
        <li>Store and return your own tracking data</li>
        <li>Generate your personal analytics and review schedule</li>
      </ul>
      <p>
        We do not use your data for advertising or profiling, and we do not
        train anything on it.
      </p>

      <h2>3. Data sharing</h2>
      <p>
        We do <strong>not</strong> sell, rent, or share your personal
        information. Leetly does not send your data to any third party — there
        is no external identity provider, analytics service, or advertising
        network involved.
      </p>

      <h2>4. Storage and security</h2>
      <p>
        Data is stored in a PostgreSQL database on infrastructure we operate.
        All traffic runs over HTTPS. Passwords are hashed with BCrypt. Sessions
        use a short-lived access token held only in memory by your browser,
        paired with a rotating refresh token kept in an httpOnly cookie that
        JavaScript cannot read. Every database query is scoped to the signed-in
        account, so one account cannot reach another&apos;s data.
      </p>

      <h2>5. Retention and deletion</h2>
      <p>
        We keep your data for as long as your account exists. You can request
        deletion of your account and everything attached to it at any time; it
        will be removed within 30 days of the request.
      </p>

      <h2>6. Third-party services</h2>
      <p>
        Leetly does not integrate with any third-party service that receives
        your personal data. Problem metadata links out to leetcode.com, but
        following such a link is your action and sends nothing about your
        account.
      </p>

      <h2>7. Cookies</h2>
      <p>
        One cookie is used: the httpOnly session cookie holding your refresh
        token. It is strictly necessary to keep you signed in. There are no
        tracking, analytics, or advertising cookies.
      </p>

      <h2>8. Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Have inaccurate data corrected</li>
        <li>Have your data and account deleted</li>
        <li>Withdraw consent for processing at any time</li>
      </ul>

      <h2>9. Changes to this policy</h2>
      <p>
        This policy may be updated. Changes appear on this page with a new date
        above. Continuing to use Leetly after a change means you accept the
        updated policy.
      </p>

      <h2>10. Contact</h2>
      <p>
        For questions about this policy, or to exercise any of the rights above,
        open an issue on the{" "}
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
