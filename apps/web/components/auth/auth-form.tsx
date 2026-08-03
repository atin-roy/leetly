"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import styles from "@/app/auth.module.css"

type Mode = "login" | "register"

export function AuthForm({ mode, callbackUrl }: { mode: Mode; callbackUrl: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const isRegister = mode === "register"

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      const res = await fetch(`/api/session/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister ? { email, username, password } : { email, password },
        ),
      })

      if (!res.ok) {
        const problem = await res.json().catch(() => ({}))
        setError(problem.message ?? "Something went wrong. Please try again.")
        return
      }

      // A full navigation so the server layout re-reads the new cookie.
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError("Could not reach the server. Check your connection.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input
          className={styles.input}
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </div>

      {isRegister && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="username">Display name</label>
          <input
            className={styles.input}
            id="username"
            autoComplete="nickname"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="How you appear to friends"
          />
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">Password</label>
        <input
          className={styles.input}
          id="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          minLength={isRegister ? 8 : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={isRegister ? "At least 8 characters" : "••••••••"}
        />
      </div>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={pending}>
        {pending && <Loader2 size={16} className={styles.spinner} aria-hidden="true" />}
        {isRegister ? "Create account" : "Sign in"}
      </button>

      <p className={styles.switch}>
        {isRegister ? "Already have an account? " : "New to Leetly? "}
        <Link
          href={isRegister ? "/sign-in" : "/sign-up"}
          className={styles.switchLink}
        >
          {isRegister ? "Sign in" : "Create one"}
        </Link>
      </p>
    </form>
  )
}
