import { auth, signIn } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SignInPage({
    searchParams,
}: {
    searchParams: Promise<{ callbackUrl?: string }>
}) {
    // If already authenticated, go to dashboard
    const session = await auth()
    if (session) redirect("/dashboard")

    // Otherwise, send directly to Keycloak — no middleman UI
    const { callbackUrl } = await searchParams
    await signIn("keycloak", { redirectTo: callbackUrl ?? "/dashboard" })
}
