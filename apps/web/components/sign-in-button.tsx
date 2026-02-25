"use client"

import { signInWithKeycloak } from "@/lib/sign-in-action"
import { Button } from "@/components/ui/button"

interface SignInButtonProps {
    variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
    children: React.ReactNode
}

export function SignInButton({
    variant = "default",
    size = "default",
    className,
    children,
}: SignInButtonProps) {
    return (
        <form action={() => signInWithKeycloak()}>
            <Button type="submit" variant={variant} size={size} className={className}>
                {children}
            </Button>
        </form>
    )
}
