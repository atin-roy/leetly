import Link from "next/link"
import { redirect } from "next/navigation"
import styles from "@/app/auth.module.css"
import { AuthForm } from "@/components/auth/auth-form"
import { readRefreshCookie } from "@/lib/session"

export const metadata = {
  title: "Create your account · Leetly",
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  if (await readRefreshCookie()) redirect("/dashboard")

  const { callbackUrl } = await searchParams

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.head}>
          <Link href="/" className={styles.wordmark}>
            Leetly
          </Link>
          <p className={styles.tagline}>
            Start turning practice into a system you can measure.
          </p>
        </div>
        <AuthForm mode="register" callbackUrl={callbackUrl ?? "/dashboard"} />
      </div>
    </main>
  )
}
