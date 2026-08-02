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
 * that outlives the tab. Renewal goes through the app's own server, which holds
 * the refresh token in an httpOnly cookie.
 */
export function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: ClientSession | null
  children: React.ReactNode
}) {
  const [session, setSession] = useState(initialSession)
  const router = useRouter()

  const signOut = useCallback(async () => {
    await fetch("/api/session/logout", { method: "POST" })
    setSession(null)
    router.push("/")
  }, [router])

  useEffect(() => {
    if (!session) return

    const renewIn = Math.max(session.expiresIn - RENEWAL_LEEWAY_SECONDS, 30) * 1000
    const timer = setTimeout(async () => {
      const res = await fetch("/api/session/refresh", { method: "POST" })
      if (res.ok) {
        setSession(await res.json())
      } else {
        setSession(null)
        router.push("/sign-in")
      }
    }, renewIn)

    return () => clearTimeout(timer)
  }, [session, router])

  const value = useMemo(
    () => ({ session, accessToken: session?.accessToken, signOut }),
    [session, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
