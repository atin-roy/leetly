import { auth } from "@/lib/auth"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { SidebarProvider } from "@/components/layout/sidebar-context"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session || session.error === "RefreshTokenError") redirect("/sign-in")

  return (
    <SidebarProvider>
      <div className="app-shell flex min-h-svh overflow-hidden">
        <AppSidebar />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-2 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1500px]">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
