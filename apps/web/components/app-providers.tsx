"use client"

import { AuthProvider } from "@/components/auth-provider"

/** Wraps the authenticated tree. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
