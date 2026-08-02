import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import "./globals.css"
import "@/styles/tokens.css"

export const metadata: Metadata = {
  title: "Leetly",
  description: "Track your LeetCode progress",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before first paint to avoid a flash of the
            default palette. ThemeInitializer takes over inside the app tree. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("leetly-theme");document.documentElement.setAttribute("data-theme",t||"default")}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-svh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
