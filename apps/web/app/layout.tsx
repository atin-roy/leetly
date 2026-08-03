import type { Metadata } from "next"
import { JetBrains_Mono, Space_Grotesk } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"
import "@/styles/tokens.css"

/*
 * next/font downloads these at build time and serves them from our own origin,
 * so there's no runtime request to Google and no layout shift from a late
 * swap. Body text deliberately stays on the system stack: it's the highest
 * volume text in the app, and a third webfont would cost more than a slightly
 * different grotesque is worth.
 */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-loaded",
  display: "swap",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-data-loaded",
  display: "swap",
})

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
    <html
      lang="en"
      className={`${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
