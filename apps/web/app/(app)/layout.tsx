import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="editorial-shell min-h-svh">
      <div className="mx-auto grid min-h-svh max-w-[1600px] gap-4 px-3 py-3 md:grid-cols-[18rem_minmax(0,1fr)] md:px-4">
        <AppSidebar />
        <div className="flex min-h-[calc(100svh-1.5rem)] flex-col gap-4">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
