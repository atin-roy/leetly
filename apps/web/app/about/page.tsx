import type { Metadata } from "next"
import {
  BarChart3,
  Brain,
  FileText,
  List,
  Target,
  TrendingUp,
} from "lucide-react"
import { MarketingShell } from "@/components/marketing/page-shell"
import styles from "@/app/marketing.module.css"

export const metadata: Metadata = {
  title: "About — Leetly",
  description:
    "Leetly is a free, open-source tracker for turning interview-problem practice into a repeatable learning system.",
}

const highlights = [
  {
    icon: TrendingUp,
    title: "Attempt tracking",
    description:
      "Outcome, language, time taken, and what went wrong — recorded for every attempt, not just the one that passed.",
  },
  {
    icon: Brain,
    title: "Spaced repetition",
    description:
      "Solved problems get a review schedule based on the FSRS algorithm, so revision is timed rather than guessed.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Streaks, solve rates by difficulty, and an activity heatmap covering the last year of practice.",
  },
  {
    icon: Target,
    title: "Mistake patterns",
    description:
      "Categorised failures — off-by-one, wrong pattern, missed edge case — aggregated so the recurring ones surface.",
  },
  {
    icon: List,
    title: "Problem lists",
    description:
      "Group problems by topic, company, or study goal, and see how much of each list is genuinely finished.",
  },
  {
    icon: FileText,
    title: "Notes",
    description:
      "Markdown notes with syntax highlighting, attached to the problem they belong to.",
  },
]

export default function AboutPage() {
  return (
    <MarketingShell
      eyebrow="About"
      title="A record of how you learned it, not just that you did"
      lede="Leetly is a study tracker for interview preparation. It exists because a solved-problem count says almost nothing about whether you could solve it again next week."
    >
      <h2>Why it exists</h2>
      <p>
        Most trackers answer one question: how many problems have you done. That
        number goes up whether or not you understood anything, and it keeps
        going up long after the understanding has faded.
      </p>
      <p>
        The useful questions are harder. Which problems did you struggle with?
        What kind of mistake do you keep making? Which of the things you solved
        two months ago could you still solve today? Leetly records enough detail
        to answer those.
      </p>

      <h2>What it does</h2>
      <div className={styles.grid}>
        {highlights.map((item) => (
          <article key={item.title} className={styles.card}>
            <span className={styles.cardIcon}>
              <item.icon size={16} aria-hidden="true" />
            </span>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardBody}>{item.description}</p>
          </article>
        ))}
      </div>

      <h2>How it is built</h2>
      <p>
        A Spring Boot API backed by PostgreSQL with schema managed by Flyway,
        and a Next.js frontend using the App Router. Authentication is
        token-based: short-lived access tokens held in memory, with rotating
        refresh tokens. Both applications are containerised and deployed to a
        VPS behind Caddy.
      </p>
      <p>
        Every resource is scoped to its owner at the query level rather than
        checked after loading, so there is no unscoped query available to call
        by mistake.
      </p>

      <h2>Who made it</h2>
      <p>
        Built by Atin Roy. The source is on{" "}
        <a
          href="https://github.com/atin-roy/leetly"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </p>
    </MarketingShell>
  )
}
