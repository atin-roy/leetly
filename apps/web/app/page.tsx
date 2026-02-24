import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BookOpen,
  BarChart3,
  Brain,
  FileText,
  List,
  Github,
  ArrowRight,
  TrendingUp,
  Target,
  UserPlus,
} from "lucide-react"

// Update this when the repo is public
const GITHUB_URL = "https://github.com/atinr4/leetly"

const features = [
  {
    icon: TrendingUp,
    title: "Attempt Tracking",
    description:
      "Log every attempt with outcome, language, time taken, and mistake categories. Never lose context on a problem again.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Visualize your daily streaks, solve rates by difficulty, and progress over time with an activity heatmap.",
  },
  {
    icon: Brain,
    title: "Pattern Recognition",
    description:
      "Tag problems by algorithmic patterns — dynamic programming, graphs, sliding window — and pinpoint exactly where you struggle.",
  },
  {
    icon: FileText,
    title: "Problem Notes",
    description:
      "Write structured notes per problem. Organize them by tag: learning, review, interview prep, or strategy.",
  },
  {
    icon: List,
    title: "Custom Lists",
    description:
      "Curate your own problem sets for interviews, company-specific prep, or focused topic drilling.",
  },
  {
    icon: Target,
    title: "Progress Mastery",
    description:
      "Problems move from Unseen → Attempted → Solved → Mastered. Always know where you actually stand.",
  },
]

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <BookOpen className="h-6 w-6" />
            Leetly
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Github className="mr-1.5 h-4 w-4" />
                GitHub
              </Link>
            </Button>
            {session ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/api/auth/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/api/auth/signin">
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <Badge variant="secondary" className="mb-6 text-xs">
          Free &amp; Open Source
        </Badge>
        <h1 className="mb-5 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Track your LeetCode
          <br className="hidden sm:block" /> journey
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Log attempts, spot patterns, and level up with analytics built for
          serious competitive programmers. No subscriptions, no ads, no
          tracking.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/api/auth/signin">
              Get started free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              View on GitHub
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border/50 bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">
              Everything you need to improve
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Built from the ground up to help you understand your weaknesses
              and turn them into strengths.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="border-border/60 bg-background/60"
                >
                  <CardHeader className="pb-3">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Open source */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
          <Github className="h-7 w-7" />
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight">
          Fully open source, forever free
        </h2>
        <p className="mx-auto mb-8 max-w-xl leading-relaxed text-muted-foreground">
          Leetly is MIT licensed. Self-host it on your own infrastructure,
          extend it with custom features, or contribute back to the community.
          No vendor lock-in, no paywalls.
        </p>
        <Button variant="outline" asChild>
          <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Github className="mr-2 h-4 w-4" />
            Star on GitHub
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Leetly — free &amp; open source</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </Link>
            <Link
              href="/api/auth/signin"
              className="transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
