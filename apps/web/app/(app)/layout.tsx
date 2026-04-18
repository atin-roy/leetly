import { auth } from "@/lib/auth"
import { AppSidebar } from "@/components/layout/app-sidebar"
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
      <div className="flex h-svh overflow-hidden">
        <AppSidebar />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <main className="aesthetic-background min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
