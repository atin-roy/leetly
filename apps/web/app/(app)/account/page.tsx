"use client"

import { useState } from "react"
import { HeroPanel } from "@/components/demo/surfaces"
import { ThemeSwitcher } from "@/components/demo/theme-switcher"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getDemoSession, demoAccountSettings } from "@/lib/demo-data"

export default function AccountPage() {
  const session = getDemoSession()
  const [headline, setHeadline] = useState(demoAccountSettings.headline)
  const [bio, setBio] = useState(demoAccountSettings.bio)

  return (
    <div className="space-y-6">
      <HeroPanel
        eyebrow="Account"
        title="Profile and preferences in the same editorial system."
        description="The account route is no longer a generic settings form. It presents the mock identity, working habits, and theme controls as one cohesive review surface."
        kicker={`${session.name} · ${demoAccountSettings.preferredLanguage} · ${demoAccountSettings.timezone}`}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <Card className="p-6">
          <CardHeader className="gap-3">
            <Badge variant="secondary">Demo profile</Badge>
            <CardTitle className="text-4xl">{session.name}</CardTitle>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{session.email}</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <label className="eyebrow">Headline</label>
              <Input value={headline} onChange={(event) => setHeadline(event.target.value)} className="mt-2" />
            </div>
            <div>
              <label className="eyebrow">Bio</label>
              <Textarea value={bio} onChange={(event) => setBio(event.target.value)} className="mt-2" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.3rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-4">
                <p className="eyebrow">Location</p>
                <p className="mt-2 text-sm text-[var(--text-primary)]">{demoAccountSettings.location}</p>
              </div>
              <div className="rounded-[1.3rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-4">
                <p className="eyebrow">Daily goal</p>
                <p className="mt-2 text-sm text-[var(--text-primary)]">{demoAccountSettings.dailyGoal}</p>
              </div>
              <div className="rounded-[1.3rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-4">
                <p className="eyebrow">Review cadence</p>
                <p className="mt-2 text-sm text-[var(--text-primary)]">{demoAccountSettings.reviewCadence}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <ThemeSwitcher />
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Visibility policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoAccountSettings.publishing.map((item) => (
                <div key={item.label} className="rounded-[1.25rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-4">
                  <p className="eyebrow">{item.label}</p>
                  <p className="mt-2 text-sm text-[var(--text-primary)]">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
