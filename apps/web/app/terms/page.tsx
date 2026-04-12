import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/demo/public-shell"
import { HeroPanel } from "@/components/demo/surfaces"

export const metadata: Metadata = {
  title: "Terms — Leetly Demo",
  description: "Terms language for the Leetly demo branch.",
}

export default function TermsPage() {
  return (
    <PublicShell currentPath="/terms">
      <HeroPanel
        eyebrow="Terms"
        title="A demo branch still needs clear boundaries."
        description="These terms reflect how the redesign branch is meant to be viewed: as a mock-first frontend experience that preserves route semantics while intentionally diverging from production data flow."
        kicker="Last updated: April 3, 2026"
      />

      <article className="panel p-8 md:p-10">
        <div className="legal-copy max-w-3xl">
          <section>
            <h2>1. Use of the Demo</h2>
            <p>
              The redesigned frontend is provided for review, critique, and iteration. The branch is intentionally mock-driven, and visual accuracy matters more here than live backend parity.
            </p>
          </section>
          <section>
            <h2>2. Route Semantics</h2>
            <p>
              Public and app URLs remain aligned with the current product structure. Redirect-only routes such as <code>/settings</code> and <code>/profile</code> continue to forward to <code>/account</code>.
            </p>
          </section>
          <section>
            <h2>3. Demo Data</h2>
            <p>
              Problem details, review items, notes, lists, and account settings shown in the branch are sample content. They should not be interpreted as persisted user information or live API responses.
            </p>
          </section>
          <section>
            <h2>4. Availability</h2>
            <p>
              The branch may change rapidly as part of the design process. Interfaces, copy, and mock values can be updated without notice while the redesign is being evaluated.
            </p>
          </section>
          <section>
            <h2>5. Repository</h2>
            <p>
              The broader project remains available through the{" "}
              <Link href="https://github.com/atin-roy/leetly" target="_blank" rel="noreferrer" className="text-[var(--accent-solid)]">
                GitHub repository
              </Link>
              , subject to its existing licensing terms.
            </p>
          </section>
        </div>
      </article>
    </PublicShell>
  )
}
