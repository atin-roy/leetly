import "server-only"
import { cookies } from "next/headers"

export const REFRESH_COOKIE = "leetly_refresh"

const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export interface UserIdentity {
  id: number
  email: string | null
  username: string | null
}

export interface AuthPayload {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: UserIdentity
}

/** The shape handed to the browser — deliberately without the refresh token. */
export type ClientSession = Omit<AuthPayload, "refreshToken">

export function toClientSession(payload: AuthPayload): ClientSession {
  return {
    accessToken: payload.accessToken,
    expiresIn: payload.expiresIn,
    user: payload.user,
  }
}

export async function callAuthApi(
  path: string,
  body: unknown,
): Promise<{ ok: true; data: AuthPayload } | { ok: false; status: number; message: string }> {
  const res = await fetch(`${API_URL}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!res.ok) {
    return { ok: false, status: res.status, message: await readError(res) }
  }
  return { ok: true, data: (await res.json()) as AuthPayload }
}

async function readError(res: Response) {
  try {
    const problem = await res.json()
    return problem.detail ?? problem.message ?? "Authentication failed"
  } catch {
    return "Authentication failed"
  }
}

export async function setRefreshCookie(refreshToken: string) {
  const store = await cookies()
  store.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    // First-party to the web app's own origin, so it is unaffected by
    // third-party cookie blocking.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function clearRefreshCookie() {
  const store = await cookies()
  store.delete(REFRESH_COOKIE)
}

export async function readRefreshCookie() {
  const store = await cookies()
  return store.get(REFRESH_COOKIE)?.value ?? null
}

/**
 * Two tabs (or a fresh full-page load racing the renewal timer) can both call
 * this for the same still-valid cookie value. Since each redemption rotates
 * the token, the second caller would replay one the API already retired,
 * tripping reuse detection and revoking the whole family. Sharing the
 * in-flight promise per token value means only the first caller redeems it;
 * the rest await that same result instead of firing their own.
 */
const pendingRefreshes = new Map<string, Promise<ClientSession | null>>()

/**
 * Exchanges the stored refresh token for a fresh access token, rotating it.
 *
 * Route handlers only. It writes a cookie, which a Server Component render is
 * not allowed to do, and calling it from a render is worse than a no-op: the
 * API rotates the token server-side, the replacement is then dropped on the
 * floor, and the next request replays a token the API has already retired.
 * That trips reuse detection and revokes the whole family, locking the account
 * out until the cookie is cleared.
 */
export async function resolveSession(): Promise<ClientSession | null> {
  const refreshToken = await readRefreshCookie()
  if (!refreshToken) return null

  const pending = pendingRefreshes.get(refreshToken)
  if (pending) return pending

  const promise = (async () => {
    const result = await callAuthApi("refresh", { refreshToken })
    if (!result.ok) return null

    await setRefreshCookie(result.data.refreshToken)
    return toClientSession(result.data)
  })()

  pendingRefreshes.set(refreshToken, promise)
  try {
    return await promise
  } finally {
    pendingRefreshes.delete(refreshToken)
  }
}
