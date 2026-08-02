import Link from "next/link"
import { redirect } from "next/navigation"
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
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1.5 text-center">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Leetly
          </Link>
          <p className="text-sm text-muted-foreground">
            Welcome back. Pick up where you left off.
          </p>
        </div>
        <AuthForm mode="login" callbackUrl={callbackUrl ?? "/dashboard"} />
      </div>
    </main>
  )
}
