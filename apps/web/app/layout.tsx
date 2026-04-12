import type { Metadata } from "next"
import { Fraunces, IBM_Plex_Mono, Manrope } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Leetly Demo",
  description: "Editorial-tech redesign branch for the Leetly frontend.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="index">
      <body
        className={`${fraunces.variable} ${manrope.variable} ${ibmPlexMono.variable} min-h-svh antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
