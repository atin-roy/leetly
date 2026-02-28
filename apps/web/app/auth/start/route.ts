import { signIn } from "@/lib/auth"
import { type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const callbackUrl =
    request.nextUrl.searchParams.get("callbackUrl") ?? "/dashboard"

  return signIn("keycloak", { redirectTo: callbackUrl })
}
