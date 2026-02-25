"use server"

import { signIn } from "@/lib/auth"

export async function signInWithKeycloak(callbackUrl?: string) {
    await signIn("keycloak", { redirectTo: callbackUrl ?? "/dashboard" })
}
