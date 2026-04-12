import Link from "next/link"
import { BookOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Privacy Policy — Leetly",
    description:
        "How Leetly collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 font-bold text-xl tracking-tight"
                    >
                        <BookOpen className="h-6 w-6" />
                        Leetly
                    </Link>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>
            </nav>

            <article className="mx-auto max-w-3xl px-6 py-16 prose prose-neutral dark:prose-invert">
                <h1 className="mb-2 text-4xl font-bold tracking-tight">
                    Privacy Policy
                </h1>
                <p className="mb-10 text-sm text-muted-foreground">
                    Last updated: February 25, 2026
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                    <p className="mb-3 text-muted-foreground leading-relaxed">
                        When you sign in to Leetly using Google or another identity provider
                        through Keycloak, we receive and store the following information:
                    </p>
                    <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                        <li>Your name and email address</li>
                        <li>Profile picture (if provided by the identity provider)</li>
                        <li>
                            Authentication tokens (used to keep you signed in securely)
                        </li>
                    </ul>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                        We also store data you create within the app, including problem
                        attempts, notes, custom lists, and analytics derived from your
                        activity.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                    <p className="mb-3 text-muted-foreground leading-relaxed">
                        Your information is used exclusively to:
                    </p>
                    <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                        <li>Authenticate you and maintain your session</li>
                        <li>Display your profile within the application</li>
                        <li>Store and retrieve your LeetCode tracking data</li>
                        <li>Generate personal analytics and progress reports</li>
                    </ul>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                        We do not use your data for advertising, profiling, or any purpose
                        beyond providing the Leetly service.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We do <strong>not</strong> sell, rent, or share your personal
                        information with any third parties. Your data is only transmitted to
                        the identity provider (e.g. Google via Keycloak) for authentication
                        purposes.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">4. Data Storage &amp; Security</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Your data is stored securely in our database hosted on
                        infrastructure we operate. We use HTTPS for all data in transit and
                        employ industry-standard security practices, including encrypted
                        tokens and secure session management through Keycloak.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">5. Data Retention &amp; Deletion</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We retain your data for as long as your account is active. You may
                        request deletion of your account and all associated data at any time
                        by contacting us. Upon request, your data will be permanently
                        deleted within 30 days.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">6. Third-Party Services</h2>
                    <p className="mb-3 text-muted-foreground leading-relaxed">
                        Leetly integrates with the following third-party services:
                    </p>
                    <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                        <li>
                            <strong>Google OAuth</strong> — for sign-in authentication
                        </li>
                        <li>
                            <strong>Keycloak</strong> — as our identity and access management
                            provider
                        </li>
                    </ul>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                        These services have their own privacy policies. We encourage you to
                        review them.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We use essential cookies only — specifically session cookies
                        required for authentication. We do not use tracking cookies,
                        analytics cookies, or advertising cookies.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
                    <p className="mb-3 text-muted-foreground leading-relaxed">
                        You have the right to:
                    </p>
                    <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                        <li>Access the personal data we hold about you</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Request deletion of your data and account</li>
                        <li>Withdraw consent for data processing at any time</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We may update this Privacy Policy from time to time. Changes will be
                        posted on this page with an updated date. Continued use of Leetly
                        after changes constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        If you have questions about this Privacy Policy or wish to exercise
                        your data rights, please open an issue on our{" "}
                        <Link
                            href="https://github.com/atin-roy/leetly"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-4 hover:text-primary/80"
                        >
                            GitHub repository
                        </Link>
                        .
                    </p>
                </section>
            </article>

            {/* Footer */}
            <footer className="border-t border-border/50 py-8">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-6 text-sm text-muted-foreground">
                    <span>© {new Date().getFullYear()} Leetly</span>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/about"
                            className="transition-colors hover:text-foreground"
                        >
                            About
                        </Link>
                        <Link
                            href="/terms"
                            className="transition-colors hover:text-foreground"
                        >
                            Terms
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
