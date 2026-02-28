import NextAuth, { type DefaultSession } from "next-auth"
import Keycloak from "next-auth/providers/keycloak"

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string
    error?: "RefreshTokenError"
  }
}

async function refreshAccessToken(refreshToken: string) {
  const issuer = process.env.KEYCLOAK_ISSUER!
  const tokenUrl = `${issuer}/protocol/openid-connect/token`
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET?.trim()
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.KEYCLOAK_CLIENT_ID!,
    refresh_token: refreshToken,
  })

  if (clientSecret) body.set("client_secret", clientSecret)

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  const tokens = await response.json()
  if (!response.ok) throw tokens

  return {
    accessToken: tokens.access_token as string,
    refreshToken: (tokens.refresh_token ?? refreshToken) as string,
    expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in as number),
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      ...(process.env.KEYCLOAK_CLIENT_SECRET?.trim()
        ? { clientSecret: process.env.KEYCLOAK_CLIENT_SECRET.trim() }
        : {}),
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: persist tokens
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        }
      }

      // Access token still valid
      const expiresAt = token["expiresAt"] as number | undefined
      if (expiresAt && Date.now() / 1000 < expiresAt - 30) {
        return token
      }

      // Access token expired — try to refresh
      const refreshToken = token["refreshToken"] as string | undefined
      if (!refreshToken) {
        return { ...token, error: "RefreshTokenError" }
      }

      try {
        const refreshed = await refreshAccessToken(refreshToken)
        return {
          ...token,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          expiresAt: refreshed.expiresAt,
          error: undefined,
        }
      } catch {
        return { ...token, error: "RefreshTokenError" }
      }
    },
    session({ session, token }) {
      session.accessToken = token["accessToken"] as string
      if (token["error"]) {
        session.error = token["error"] as "RefreshTokenError"
      }
      return session
    },
  },
  events: {
    async signOut(message) {
      // End the Keycloak session so the user isn't auto-re-authenticated
      if ("token" in message) {
        const refreshToken = message.token?.["refreshToken"] as
          | string
          | undefined
        if (refreshToken) {
          const issuer = process.env.KEYCLOAK_ISSUER!
          const logoutUrl = `${issuer}/protocol/openid-connect/logout`
          const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET?.trim()
          const body = new URLSearchParams({
            client_id: process.env.KEYCLOAK_CLIENT_ID!,
            refresh_token: refreshToken,
          })

          if (clientSecret) body.set("client_secret", clientSecret)

          try {
            await fetch(logoutUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body,
            })
          } catch (error) {
            console.error("Error ending Keycloak session:", error)
          }
        }
      }
    },
  },
})
