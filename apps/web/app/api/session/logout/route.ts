import { NextResponse } from "next/server"
import { callAuthApi, clearRefreshCookie, readRefreshCookie } from "@/lib/session"

export async function POST() {
  const refreshToken = await readRefreshCookie()

  // Revoke server-side so the token cannot be replayed even if it leaked.
  if (refreshToken) {
    await callAuthApi("logout", { refreshToken }).catch(() => undefined)
  }

  await clearRefreshCookie()
  return new NextResponse(null, { status: 204 })
}
