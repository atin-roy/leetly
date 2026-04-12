import Link from "next/link"
import { ArrowUpRight, BadgeCheck, LayoutDashboard, Palette } from "lucide-react"
import { PublicShell } from "@/components/demo/public-shell"
import { HeroPanel } from "@/components/demo/surfaces"
import { Button } from "@/components/ui/button"

export default function SignInPage() {
  return (
    <PublicShell currentPath="/sign-in">
      <HeroPanel
        eyebrow="Demo Entry"
        title="Sign-in is paused so the redesign can be reviewed directly."
        description="This page replaces the immediate auth bounce with a branded entry surface. In this branch, the intended CTA is straight into the mock dashboard."
        kicker="Frontend-only demo mode"
        action={
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Continue to Dashboard
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
        aside={
          <div className="grid gap-4">
            <div className="panel p-5">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-1 size-5 text-[var(--chart-3)]" />
                <div>
                  <p className="text-sm font-semibold">Auth bypassed</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    App routes render with a stable mock session so reviewers can open pages directly.
                  </p>
                </div>
              </div>
            </div>
            <div className="panel p-5">
              <div className="flex items-start gap-3">
                <Palette className="mt-1 size-5 text-[var(--chart-4)]" />
                <div>
                  <p className="text-sm font-semibold">Three live themes</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    Theme switching persists locally and never touches backend settings in this branch.
                  </p>
                </div>
              </div>
            </div>
            <div className="panel p-5">
              <div className="flex items-start gap-3">
                <LayoutDashboard className="mt-1 size-5 text-[var(--chart-1)]" />
                <div>
                  <p className="text-sm font-semibold">Best starting route</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    The flagship review surface is <code>/dashboard</code>, followed by <code>/problems</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </PublicShell>
  )
}
