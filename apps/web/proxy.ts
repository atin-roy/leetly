import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes accessible without authentication
const PUBLIC_ROUTES = ["/", "/privacy", "/about", "/terms", "/sign-in", "/sign-up"]

export default function proxy(request: NextRequest) {
    const { nextUrl } = request
    const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname)

    if (!isPublicRoute) {
        // Optimistic check only: presence of the refresh cookie. Whether it is
        // still valid is decided by the API when the layout redeems it.
        if (!request.cookies.has("leetly_refresh")) {
            const signInUrl = new URL("/sign-in", nextUrl.origin)
            signInUrl.searchParams.set("callbackUrl", nextUrl.pathname)
            return NextResponse.redirect(signInUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|.*\\..*).*)",],
}
