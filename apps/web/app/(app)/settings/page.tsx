"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { LogOut, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings, useUpdateLanguage, useUpdateDailyGoal, useUpdateTimezone } from "@/hooks/use-settings"
import { useTheme } from "@/hooks/use-theme"
import { THEMES } from "@/lib/themes"
import { cn } from "@/lib/utils"
import type { Language } from "@/lib/types"

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES: Language[] = [
  "JAVA",
  "PYTHON",
  "JAVASCRIPT",
  "TYPESCRIPT",
  "CPP",
  "C",
  "GO",
  "RUST",
  "KOTLIN",
  "SWIFT",
]

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "America/Buenos_Aires",
  "America/Bogota",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Moscow",
  "Europe/Istanbul",
  "Africa/Cairo",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Perth",
  "Australia/Brisbane",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Pacific/Honolulu",
  "Pacific/Fiji",
]

const schema = z.object({
  preferredLanguage: z.enum([
    "JAVA",
    "PYTHON",
    "JAVASCRIPT",
    "TYPESCRIPT",
    "CPP",
    "C",
    "GO",
    "RUST",
    "KOTLIN",
    "SWIFT",
  ]),
  dailyGoal: z.number().int().min(1).max(50),
  timezone: z.string().min(1, "Timezone is required"),
})

type FormValues = z.infer<typeof schema>

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileSection() {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
        <CardDescription>Your account information from Keycloak</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 text-base">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
            <AvatarFallback>
              {user?.name ? (
                getInitials(user.name)
              ) : (
                <User className="h-6 w-6" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="font-semibold">{user?.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PreferencesForm() {
  const { data: settings, isLoading } = useSettings()
  const languageMutation = useUpdateLanguage()
  const goalMutation = useUpdateDailyGoal()
  const timezoneMutation = useUpdateTimezone()
  const isSaving = languageMutation.isPending || goalMutation.isPending || timezoneMutation.isPending

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      preferredLanguage: "PYTHON",
      dailyGoal: 1,
      timezone: "UTC",
    },
  })

  useEffect(() => {
    if (settings) {
      form.reset({
        preferredLanguage: settings.preferredLanguage,
        dailyGoal: settings.dailyGoal,
        timezone: settings.timezone,
      })
    }
  }, [settings, form])

  async function onSubmit(values: FormValues) {
    try {
      const promises: Promise<unknown>[] = []
      if (values.preferredLanguage !== settings?.preferredLanguage) {
        promises.push(languageMutation.mutateAsync(values.preferredLanguage))
      }
      if (values.dailyGoal !== settings?.dailyGoal) {
        promises.push(goalMutation.mutateAsync(values.dailyGoal))
      }
      if (values.timezone !== settings?.timezone) {
        promises.push(timezoneMutation.mutateAsync(values.timezone))
      }
      await Promise.all(promises)
      toast.success("Settings saved")
    } catch {
      toast.error("Failed to save settings")
    }
  }

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preferences</CardTitle>
        <CardDescription>Coding language, daily goal, and display options</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dailyGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Goal</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        placeholder="problems / day"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function ThemeSwatch({ t, active }: { t: (typeof THEMES)[number]; active: boolean }) {
  return (
    <div
      className="h-[68px] w-[112px] overflow-hidden rounded-lg"
      style={{
        outline: active ? `2px solid ${t.preview.primary}` : `1px solid ${t.preview.border}`,
        outlineOffset: active ? "2px" : "0px",
      }}
    >
      <div className="flex h-full">
        {/* Sidebar strip */}
        <div className="flex w-8 flex-shrink-0 flex-col gap-1 p-1.5" style={{ background: t.preview.sidebar }}>
          <div className="h-1.5 w-full rounded-sm" style={{ background: t.preview.primary }} />
          <div className="h-1 w-4 rounded-sm" style={{ background: t.preview.fg, opacity: 0.35 }} />
          <div className="h-1 w-4 rounded-sm" style={{ background: t.preview.fg, opacity: 0.35 }} />
          <div className="h-1 w-3 rounded-sm" style={{ background: t.preview.fg, opacity: 0.35 }} />
        </div>
        {/* Main area */}
        <div className="flex flex-1 flex-col gap-1 p-1.5" style={{ background: t.preview.bg }}>
          <div className="h-1.5 w-4/5 rounded-sm" style={{ background: t.preview.fg, opacity: 0.65 }} />
          <div className="h-1 w-full rounded-sm" style={{ background: t.preview.fg, opacity: 0.25 }} />
          <div className="h-1 w-5/6 rounded-sm" style={{ background: t.preview.fg, opacity: 0.25 }} />
          <div className="h-1 w-2/3 rounded-sm" style={{ background: t.preview.fg, opacity: 0.25 }} />
          <div className="mt-auto h-3.5 w-10 rounded-sm" style={{ background: t.preview.primary }} />
        </div>
      </div>
    </div>
  )
}

function AppearanceCard() {
  const { themeId, setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Appearance</CardTitle>
        <CardDescription>Choose a color theme for the interface</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className="flex flex-col items-center gap-2 rounded-xl p-1.5 transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ThemeSwatch t={t} active={themeId === t.id} />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-medium">{t.name}</span>
                <span className="text-[10px] text-muted-foreground">{t.description}</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <ProfileSection />
      <AppearanceCard />
      <PreferencesForm />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Sign out of your Leetly account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
