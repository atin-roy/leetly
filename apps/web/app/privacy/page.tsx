import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/demo/public-shell"
import { HeroPanel } from "@/components/demo/surfaces"

export const metadata: Metadata = {
  title: "Privacy — Leetly Demo",
  description: "Privacy language for the Leetly demo branch.",
}

export default function PrivacyPage() {
  return (
    <PublicShell currentPath="/privacy">
      <HeroPanel
        eyebrow="Privacy"
        title="Readable legal copy for a calmer surface."
        description="The legal pages intentionally step back from the app’s higher-energy dashboard treatment. They stay typographic, structured, and easy to scan."
        kicker="Last updated: April 3, 2026"
      />

      <article className="panel p-8 md:p-10">
        <div className="legal-copy max-w-3xl">
          <section>
            <h2>1. Demo Branch Context</h2>
            <p>
              This frontend branch is a mock-driven redesign. The app routes shown in the demo read from local mock data instead of the production backend, and theme persistence is stored only in local browser storage for review purposes.
            </p>
          </section>
          <section>
            <h2>2. Information in the Demo</h2>
            <p>
              The visible user profile, problem history, notes, review queue, and settings on this branch are curated sample content. They exist to demonstrate interface behavior and visual hierarchy, not to represent live user data.
            </p>
          </section>
          <section>
            <h2>3. Local Persistence</h2>
            <p>
              The theme switcher stores the selected preset in your browser using local storage so refreshes preserve the chosen look. The demo branch does not call backend theme persistence while this mode is active.
            </p>
          </section>
          <section>
            <h2>4. Third-Party Infrastructure</h2>
            <p>
              The underlying project may still include authentication and API integrations in the repository, but this branch bypasses those flows for the redesigned frontend experience.
            </p>
          </section>
          <section>
            <h2>5. Questions</h2>
            <p>
              For repository or privacy questions, use the project&apos;s{" "}
              <Link href="https://github.com/atin-roy/leetly" target="_blank" rel="noreferrer" className="text-[var(--accent-solid)]">
                GitHub repository
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </PublicShell>
  )
}
