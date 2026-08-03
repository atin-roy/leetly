"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import type { ClientSession } from "@/lib/session"

interface AuthContextValue {
  session: ClientSession | null
  accessToken: string | undefined
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  accessToken: undefined,
  signOut: async () => {},
})

/** Renew this far before expiry so a request never races the deadline. */
const RENEWAL_LEEWAY_SECONDS = 60

/**
 * Holds the access token in memory only. It is never written to localStorage or
 * a readable cookie, so a script injected into the page has nothing to steal
 * that outlives the tab.
 *
 * The token is obtained from the app's own refresh route rather than seeded by
 * the server layout: redeeming the refresh token rotates it, and only a route
 * handler can store the replacement.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ClientSession | null>(null)
  // Latches once the cookie is known to be spent, so a failed redemption is
  // never retried in a loop.
  const [signedOut, setSignedOut] = useState(false)
  const router = useRouter()

  const signOut = useCallback(async () => {
    await fetch("/api/session/logout", { method: "POST" })
    setSignedOut(true)
    setSession(null)
    router.push("/")
  }, [router])

  useEffect(() => {
    if (signedOut) return
    let cancelled = false

    /*
     * One timer serves both jobs: with no session yet it fires immediately to
     * redeem the cookie, and afterwards it fires shortly before the access
     * token expires. Renewals are therefore never concurrent, which matters
     * because each one rotates the refresh token.
     */
    const delay = session
      ? Math.max(session.expiresIn - RENEWAL_LEEWAY_SECONDS, 30) * 1000
      : 0

    const timer = setTimeout(async () => {
      const res = await fetch("/api/session/refresh", { method: "POST" })
      if (cancelled) return

      if (res.ok) {
        setSession(await res.json())
      } else {
        // The route handler has already cleared the cookie, so sign-in will
        // render instead of bouncing back here.
        setSignedOut(true)
        setSession(null)
        router.replace("/sign-in")
      }
    }, delay)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [session, signedOut, router])

  const value = useMemo(
    () => ({ session, accessToken: session?.accessToken, signOut }),
    [session, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
