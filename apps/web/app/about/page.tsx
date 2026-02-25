import Link from "next/link"
import {
    BookOpen,
    ArrowLeft,
    Github,
    TrendingUp,
    BarChart3,
    Brain,
    FileText,
    List,
    Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "About — Leetly",
    description:
        "Leetly is a free, open-source LeetCode progress tracker for competitive programmers.",
}

const highlights = [
    {
        icon: TrendingUp,
        title: "Attempt Tracking",
        description:
            "Log every attempt with outcome, language, time, and mistake categories.",
    },
    {
        icon: BarChart3,
        title: "Analytics",
        description:
            "Visualize streaks, solve rates by difficulty, and progress over time.",
    },
    {
        icon: Brain,
        title: "Pattern Recognition",
        description:
            "Tag problems by algorithmic pattern and identify your weak spots.",
    },
    {
        icon: FileText,
        title: "Notes",
        description:
            "Write structured notes per problem to capture learnings and strategies.",
    },
    {
        icon: List,
        title: "Custom Lists",
        description:
            "Curate problem sets for interviews, companies, or topic drilling.",
    },
    {
        icon: Target,
        title: "Mastery Tracking",
        description:
            "Problems progress from Unseen → Attempted → Solved → Mastered.",
    },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
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

            <div className="mx-auto max-w-4xl px-6 py-16">
                {/* Intro */}
                <section className="mb-16 text-center">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="mb-4 text-4xl font-bold tracking-tight">
                        About Leetly
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        Leetly is a <strong>free, open-source</strong> web application built
                        for competitive programmers who want to track their LeetCode journey
                        with intention. Log attempts, spot patterns, and level up with
                        analytics — no subscriptions, no ads, no tracking.
                    </p>
                </section>

                {/* Features */}
                <section className="mb-16">
                    <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
                        What You Can Do
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {highlights.map((item) => {
                            const Icon = item.icon
                            return (
                                <Card
                                    key={item.title}
                                    className="border-border/60 bg-background/60"
                                >
                                    <CardHeader className="pb-2">
                                        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-base">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-sm leading-relaxed">
                                            {item.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </section>

                {/* Open-source */}
                <section className="mb-16 text-center">
                    <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                        <Github className="h-7 w-7" />
                    </div>
                    <h2 className="mb-3 text-2xl font-bold tracking-tight">
                        Open Source, Forever Free
                    </h2>
                    <p className="mx-auto mb-6 max-w-xl leading-relaxed text-muted-foreground">
                        Leetly is MIT licensed. Self-host it, extend it, or contribute back
                        to the community. No vendor lock-in, no paywalls.
                    </p>
                    <Button variant="outline" asChild>
                        <Link
                            href="https://github.com/atinr4/leetly"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Github className="mr-2 h-4 w-4" />
                            View on GitHub
                        </Link>
                    </Button>
                </section>

                {/* Legal links */}
                <section className="rounded-lg border border-border/60 bg-muted/40 p-6 text-center">
                    <h2 className="mb-3 text-lg font-semibold">Legal</h2>
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <Link
                            href="/privacy"
                            className="text-primary underline underline-offset-4 hover:text-primary/80"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-primary underline underline-offset-4 hover:text-primary/80"
                        >
                            Terms of Service
                        </Link>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="border-t border-border/50 py-8">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 text-sm text-muted-foreground">
                    <span>© {new Date().getFullYear()} Leetly</span>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/privacy"
                            className="transition-colors hover:text-foreground"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="transition-colors hover:text-foreground"
                        >
                            Terms
                        </Link>
                        <Link
                            href="https://github.com/atinr4/leetly"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-foreground"
                        >
                            GitHub
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
