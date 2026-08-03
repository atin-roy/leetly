"use client"

import { AuthProvider } from "@/components/auth-provider"
import { ThemeInitializer } from "@/components/theme-initializer"

/** Wraps the authenticated tree. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeInitializer />
      {children}
    </AuthProvider>
  )
}
