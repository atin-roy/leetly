import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function proxy(_request: NextRequest) {
  // Demo branch: bypass all auth gating so reviewers can open app routes directly.
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
