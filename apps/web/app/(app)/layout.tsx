import { auth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session || session.error === "RefreshTokenError") redirect("/sign-in")

  return (
    <div className="app-shell flex min-h-svh flex-col overflow-hidden">
      <Header />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-2 sm:px-6 lg:px-8">
        <main className="mx-auto w-full max-w-[1500px]">{children}</main>
      </div>
    </div>
  )
}
