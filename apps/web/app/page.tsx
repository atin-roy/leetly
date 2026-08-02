import Link from "next/link"
import { redirect } from "next/navigation"
import {
  BarChart3,
  Brain,
  FileText,
  Github,
  List,
  Target,
  TrendingUp,
} from "lucide-react"
import { readRefreshCookie } from "@/lib/session"
import { Button } from "@/components/ui/button"
import styles from "./page.module.css"

const GITHUB_URL = "https://github.com/atin-roy/leetly"

const features = [
  {
    icon: TrendingUp,
    title: "Every attempt, recorded",
    description:
      "Log the outcome, the language, the time it took, and what went wrong. Come back in three weeks and the context is still there.",
  },
  {
    icon: Brain,
    title: "Reviews that arrive on time",
    description:
      "Solved problems enter a spaced-repetition schedule. Leetly decides what is worth revisiting today so you do not have to guess.",
  },
  {
    icon: BarChart3,
    title: "Progress you can read",
    description:
      "Daily streaks, solve rates by difficulty, and an activity heatmap — enough to see whether the last month actually moved.",
  },
  {
    icon: Target,
    title: "Mistakes, categorised",
    description:
      "Tag why an attempt failed: off-by-one, wrong pattern, missed edge case. The pattern in your errors becomes visible.",
  },
  {
    icon: List,
    title: "Lists for real prep",
    description:
      "Group problems by topic, by company, or by whatever you are drilling this week. Track how much of each list is genuinely done.",
  },
  {
    icon: FileText,
    title: "Notes beside the work",
    description:
      "Markdown notes with syntax highlighting, attached to the problem they belong to instead of scattered across other apps.",
  },
]

const attempts = [
  { index: "01", note: "Brute force, two nested loops", outcome: "Time limit" },
  { index: "02", note: "Sorted first — lost the original indices", outcome: "Wrong answer" },
  { index: "03", note: "Hash map of complements", outcome: "Accepted" },
]

export default async function Home() {
  if (await readRefreshCookie()) redirect("/dashboard")

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.wordmark}>
            Leetly
            <span className={styles.wordmarkMark} aria-hidden="true" />
          </Link>
          <div className={styles.navActions}>
            <Link href="/about" className={styles.navLink}>
              About
            </Link>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
            >
              <Github size={14} aria-hidden="true" style={{ marginRight: "0.35rem" }} />
              GitHub
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            Deliberate practice
          </p>
          <h1 className={styles.title}>
            Solving it once is not
            <br />
            <span className={styles.titleAccent}>learning it.</span>
          </h1>
          <p className={styles.lede}>
            Leetly keeps the record of how you actually solved a problem — every
            attempt, every wrong turn, and when to come back to it.
          </p>
          <div className={styles.ctaRow}>
            <Button asChild size="lg">
              <Link href="/sign-up">Start tracking</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">See how it works</Link>
            </Button>
          </div>
          <p className={styles.note}>Free, and your data stays yours.</p>
        </div>

        {/* Signature element: one problem, shown the way the app records it. */}
        <figure className={styles.ledger}>
          <figcaption className={styles.ledgerHead}>
            <div>
              <span className={styles.callNumber}>#0001</span>
              <div className={styles.ledgerTitle}>Two Sum</div>
            </div>
            <span className={styles.difficulty}>Easy</span>
          </figcaption>

          {attempts.map((attempt) => (
            <div key={attempt.index} className={styles.attemptRow}>
              <span className={styles.attemptIndex}>{attempt.index}</span>
              <span className={styles.attemptNote}>{attempt.note}</span>
              <span
                className={`${styles.outcome} ${
                  attempt.outcome === "Accepted" ? styles.outcomePass : styles.outcomeFail
                }`}
              >
                {attempt.outcome}
              </span>
            </div>
          ))}

          <div className={styles.ledgerFoot}>
            <div className={styles.stat}>
              <span className={styles.statValue}>3</span>
              <span className={styles.statLabel}>Attempts</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>47m</span>
              <span className={styles.statLabel}>Time spent</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>6d</span>
              <span className={styles.statLabel}>Next review</span>
            </div>
          </div>
        </figure>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What it keeps track of</h2>
        <p className={styles.sectionLede}>
          Six things a problem list cannot tell you, and the reason a solved
          count is a poor measure of readiness.
        </p>

        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.feature}>
              <span className={styles.featureIcon}>
                <feature.icon size={18} aria-hidden="true" />
              </span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureBody}>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.closing}>
        <h2 className={styles.sectionTitle}>Start with the next problem you solve</h2>
        <p className={styles.sectionLede} style={{ marginInline: "auto" }}>
          Log one attempt and the record builds itself from there.
        </p>
        <Button asChild size="lg">
          <Link href="/sign-up">Create your account</Link>
        </Button>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© {new Date().getFullYear()} Leetly</span>
          <div className={styles.footerLinks}>
            <Link href="/about" className={styles.footerLink}>
              About
            </Link>
            <Link href="/privacy" className={styles.footerLink}>
              Privacy
            </Link>
            <Link href="/terms" className={styles.footerLink}>
              Terms
            </Link>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              Source
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
