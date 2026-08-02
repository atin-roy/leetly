"use client"

import { AuthProvider } from "@/components/auth-provider"
import { ThemeInitializer } from "@/components/theme-initializer"
import type { ClientSession } from "@/lib/session"

/**
 * Wraps the authenticated tree. The session is resolved on the server and
 * handed down here, so the data hooks gated on an access token can fetch on
 * first render instead of waiting for a round-trip.
 */
export function AppProviders({
  session,
  children,
}: {
  session: ClientSession | null
  children: React.ReactNode
}) {
  return (
    <AuthProvider initialSession={session}>
      <ThemeInitializer />
      {children}
    </AuthProvider>
  )
}
