import styles from "./shell.module.css"
import { AppProviders } from "@/components/app-providers"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider } from "@/components/layout/sidebar-context"
import { readRefreshCookie } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Presence only. Redeeming the token here would rotate it without being able
  // to store the replacement — see resolveSession. AuthProvider redeems it via
  // the refresh route handler, which is allowed to write the cookie.
  if (!(await readRefreshCookie())) redirect("/sign-in")

  return (
    <AppProviders>
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
