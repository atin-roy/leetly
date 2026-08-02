import { NextResponse } from "next/server"
import { callAuthApi, setRefreshCookie, toClientSession } from "@/lib/session"

export async function POST(request: Request) {
  const body = await request.json()
  const result = await callAuthApi("register", body)

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status })
  }

  await setRefreshCookie(result.data.refreshToken)
  return NextResponse.json(toClientSession(result.data), { status: 201 })
}
