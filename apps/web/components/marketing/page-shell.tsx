import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import styles from "@/app/marketing.module.css"

/** Shared chrome for the public pages: back bar, document header, footer. */
export function MarketingShell({
  eyebrow,
  title,
  lede,
  updated,
  children,
}: {
  eyebrow: string
  title: string
  lede?: string
  updated?: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <Link href="/" className={styles.back}>
            <ArrowLeft size={14} aria-hidden="true" />
            Back
          </Link>
          <Link href="/" className={styles.wordmark}>
            Leetly
          </Link>
        </div>
      </div>

      <main className={styles.doc}>
        <header className={styles.docHeader}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          {lede && <p className={styles.lede}>{lede}</p>}
          {updated && <p className={styles.updated}>Last updated {updated}</p>}
        </header>

        <div className={styles.prose}>{children}</div>
      </main>

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
          </div>
        </div>
      </footer>
    </div>
  )
}
