import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes accessible without authentication
const PUBLIC_ROUTES = ["/", "/privacy", "/about", "/terms", "/sign-in", "/auth/start"]

export default function proxy(request: NextRequest) {
    const { nextUrl } = request
    const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname)

    if (!isPublicRoute) {
        // Optimistic check: look for a NextAuth session cookie
        const hasSession =
            request.cookies.has("authjs.session-token") ||
            request.cookies.has("__Secure-authjs.session-token")

        if (!hasSession) {
            const signInUrl = new URL("/sign-in", nextUrl.origin)
            signInUrl.searchParams.set("callbackUrl", nextUrl.pathname)
            return NextResponse.redirect(signInUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",],
}
