"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import styles from "./route-state.module.css"

/*
 * One boundary for the whole authenticated shell. Per-route boundaries would
 * be worth it if the routes failed for different reasons, but they all fail the
 * same way — the API call didn't come back — so the recovery is the same too.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className={styles.state}>
      <p className={styles.eyebrow}>Error</p>
      <h1 className={styles.title}>That didn&apos;t load.</h1>
      <p className={styles.body}>
        The request failed before this page could render. Trying again is
        usually enough; if it isn&apos;t, the API may be down.
      </p>
      {error.digest && <p className={styles.digest}>Reference {error.digest}</p>}
      <div className={styles.actions}>
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
