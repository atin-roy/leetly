import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SignInPage({
    searchParams,
}: {
    searchParams: Promise<{ callbackUrl?: string }>
}) {
    // If already authenticated, go to dashboard
    const session = await auth()
    if (session) redirect("/dashboard")

    const { callbackUrl } = await searchParams
    redirect(`/auth/start?callbackUrl=${encodeURIComponent(callbackUrl ?? "/dashboard")}`)
}
