import Link from "next/link"
import { BookOpen, ArrowLeft, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Terms of Service — Leetly",
    description: "Terms and conditions for using the Leetly application.",
}

export default function TermsPage() {
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
                    Terms of Service
                </h1>
                <p className="mb-10 text-sm text-muted-foreground">
                    Last updated: February 25, 2026
                </p>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        By accessing or using Leetly (&quot;the Service&quot;), you agree to
                        be bound by these Terms of Service. If you do not agree to these
                        terms, please do not use the Service.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Leetly is a free, open-source web application that helps users track
                        their LeetCode problem-solving progress. The Service provides
                        features including attempt tracking, analytics dashboards, problem
                        notes, and custom problem lists.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        You may sign in using a third-party identity provider (e.g. Google)
                        through Keycloak. You are responsible for maintaining the security
                        of your account credentials. You agree to provide accurate
                        information and to notify us of any unauthorized use of your
                        account.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">4. User Responsibilities</h2>
                    <p className="mb-3 text-muted-foreground leading-relaxed">
                        When using the Service, you agree to:
                    </p>
                    <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
                        <li>Use the Service only for lawful purposes</li>
                        <li>
                            Not attempt to disrupt, overload, or interfere with the Service
                        </li>
                        <li>
                            Not attempt to gain unauthorized access to other users&apos; data
                        </li>
                        <li>
                            Not use automated tools to scrape or abuse the Service
                        </li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Leetly is released under the MIT License. The source code is
                        available on{" "}
                        <Link
                            href="https://github.com/atinr4/leetly"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-4 hover:text-primary/80"
                        >
                            GitHub
                        </Link>
                        . You retain ownership of all content and data you create within the
                        Service.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">6. Availability &amp; Modifications</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We strive to keep the Service available but do not guarantee
                        uninterrupted access. We reserve the right to modify, suspend, or
                        discontinue the Service at any time, with or without notice. We may
                        update features, interfaces, or functionality as needed.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">
                        7. Limitation of Liability
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The Service is provided &quot;as is&quot; and &quot;as
                        available&quot; without warranties of any kind, either express or
                        implied. To the fullest extent permitted by law, the creators and
                        contributors of Leetly shall not be liable for any indirect,
                        incidental, special, or consequential damages arising from your use
                        of the Service.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We may terminate or suspend your access to the Service at any time,
                        with or without cause. You may stop using the Service at any time.
                        Upon termination, your right to use the Service ceases immediately.
                        You may request deletion of your data by contacting us.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">9. Changes to These Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We may update these Terms of Service from time to time. Changes will
                        be posted on this page with an updated date. Continued use of the
                        Service after changes constitutes acceptance of the updated terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        If you have questions about these Terms, please open an issue on
                        our{" "}
                        <Link
                            href="https://github.com/atinr4/leetly"
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
                            href="/privacy"
                            className="transition-colors hover:text-foreground"
                        >
                            Privacy
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
