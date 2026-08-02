import Link from "next/link"
import { Button } from "@/components/ui/button"

interface SignInButtonProps {
    href?: string
    variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
    children: React.ReactNode
}

export function SignInButton({
    href = "/sign-in",
    variant = "default",
    size = "default",
    className,
    children,
}: SignInButtonProps) {
    return (
        <Button asChild variant={variant} size={size} className={className}>
            <Link href={href}>{children}</Link>
        </Button>
    )
}
