import styles from "./shell.module.css"
import { AppProviders } from "@/components/app-providers"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider } from "@/components/layout/sidebar-context"
import { resolveSession } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await resolveSession()
  if (!session) redirect("/sign-in")

  return (
    <AppProviders session={session}>
      <SidebarProvider>
        <div className={styles.shell}>
          <AppSidebar />
          <div className={styles.content}>
            <main className={`aesthetic-background ${styles.main}`}>{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AppProviders>
  )
}
