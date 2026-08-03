import Link from "next/link"
import { redirect } from "next/navigation"
import styles from "@/app/auth.module.css"
import { AuthForm } from "@/components/auth/auth-form"
import { readRefreshCookie } from "@/lib/session"

export const metadata = {
  title: "Sign in · Leetly",
}

export default async function SignInPage({
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
            Welcome back. Pick up where you left off.
          </p>
        </div>
        <AuthForm mode="login" callbackUrl={callbackUrl ?? "/dashboard"} />
      </div>
    </main>
  )
}
