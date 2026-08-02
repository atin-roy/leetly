import { NextResponse } from "next/server"
import { clearRefreshCookie, resolveSession } from "@/lib/session"

/** Renews the in-memory access token. The refresh token stays server-side. */
export async function POST() {
  const session = await resolveSession()

  if (!session) {
    await clearRefreshCookie()
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  return NextResponse.json(session)
}
