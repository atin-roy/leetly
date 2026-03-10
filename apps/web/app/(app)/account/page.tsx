"use client"

import { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { QueryObserverResult } from "@tanstack/react-query"
import { z } from "zod"
import { LogOut, User } from "lucide-react"
import { toast } from "sonner"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useProfile, useUpdateProfile } from "@/hooks/use-profile"
import { useSettings, useUpdateDailyGoal, useUpdateLanguage, useUpdateTimezone } from "@/hooks/use-settings"
import { useTheme } from "@/hooks/use-theme"
import { THEMES } from "@/lib/themes"
import type { Language, UpdateProfileRequest, UserSettingsDto } from "@/lib/types"

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

const profileSchema = z.object({
  displayName: z.string().max(100),
  bio: z.string().max(500),
  progressPublic: z.boolean(),
  streakPublic: z.boolean(),
  listsPublic: z.boolean(),
  notesPublic: z.boolean(),
})

const settingsSchema = z.object({
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

type ProfileFormValues = z.infer<typeof profileSchema>
type SettingsFormValues = z.infer<typeof settingsSchema>

const visibilityFields = [
  { name: "progressPublic" as const, label: "Problem progress" },
  { name: "streakPublic" as const, label: "Solve streak" },
  { name: "listsPublic" as const, label: "My Lists" },
  { name: "notesPublic" as const, label: "Notes" },
]

function normalizeSettings(values?: {
  preferredLanguage?: Language | null
  dailyGoal?: number | null
  timezone?: string | null
}): SettingsFormValues {
  const preferredLanguage =
    values?.preferredLanguage && LANGUAGES.includes(values.preferredLanguage)
      ? values.preferredLanguage
      : "JAVA"
  const timezone =
    values?.timezone && TIMEZONES.includes(values.timezone)
      ? values.timezone
      : "UTC"
  const dailyGoal =
    typeof values?.dailyGoal === "number" && Number.isFinite(values.dailyGoal)
      ? Math.min(50, Math.max(1, Math.trunc(values.dailyGoal)))
      : 1

  return { preferredLanguage, dailyGoal, timezone }
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function ProfileForm() {
  const { data: session } = useSession()
  const { data: profile, isLoading } = useProfile()
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      progressPublic: true,
      streakPublic: true,
      listsPublic: false,
      notesPublic: false,
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName ?? "",
        bio: profile.bio ?? "",
        progressPublic: profile.progressPublic,
        streakPublic: profile.streakPublic,
        listsPublic: profile.listsPublic,
        notesPublic: profile.notesPublic,
      })
    }
  }, [profile, form])

  async function onSubmit(values: ProfileFormValues) {
    const payload: UpdateProfileRequest = {
      ...values,
      displayName: values.displayName || null,
      bio: values.bio || null,
    }

    try {
      await updateProfile(payload)
      toast.success("Profile saved")
    } catch {
      toast.error("Failed to save profile")
    }
  }

  if (!session) return null

  const name = session.user?.name ?? ""
  const email = session.user?.email ?? ""
  const image = session.user?.image ?? undefined

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Managed by your identity provider.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 text-base">
                <AvatarImage src={image} alt={name || "User"} />
                <AvatarFallback>
                  {name ? getInitials(name) : <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="font-semibold">{name || "—"}</p>
                <p className="text-sm text-muted-foreground">{email || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Public Profile</CardTitle>
            <CardDescription>Visible to other users on your profile page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={name || "Your display name"}
                      disabled={isLoading}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short bio about yourself…"
                      className="resize-none"
                      rows={3}
                      disabled={isLoading}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visibility</CardTitle>
            <CardDescription>Control what others can see on your profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {visibilityFields.map(({ name: fieldName, label }, i) => (
              <div key={fieldName}>
                <FormField
                  control={form.control}
                  name={fieldName}
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between py-3">
                      <FormLabel className="cursor-pointer font-normal">{label}</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {i < visibilityFields.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || isLoading}>
            {isPending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

function PreferencesFormContent({
  settings,
  refetch,
}: {
  settings: UserSettingsDto | undefined
  refetch: () => Promise<QueryObserverResult<UserSettingsDto>>
}) {
  const languageMutation = useUpdateLanguage()
  const goalMutation = useUpdateDailyGoal()
  const timezoneMutation = useUpdateTimezone()
  const isSaving = languageMutation.isPending || goalMutation.isPending || timezoneMutation.isPending

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: normalizeSettings(settings),
  })

  useEffect(() => {
    if (settings) {
      form.reset(normalizeSettings(settings))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  async function onSubmit(values: SettingsFormValues) {
    try {
      let changed = false
      if (values.preferredLanguage !== settings?.preferredLanguage) {
        changed = true
        await languageMutation.mutateAsync(values.preferredLanguage)
      }
      if (values.dailyGoal !== settings?.dailyGoal) {
        changed = true
        await goalMutation.mutateAsync(values.dailyGoal)
      }
      if (values.timezone !== settings?.timezone) {
        changed = true
        await timezoneMutation.mutateAsync(values.timezone)
      }
      if (changed) {
        const latest = await refetch()
        if (latest.data) {
          form.reset(normalizeSettings(latest.data))
        }
        toast.success("Preferences saved")
      }
    } catch {
      toast.error("Failed to save preferences")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preferences</CardTitle>
        <CardDescription>Coding language, daily goal, and timezone</CardDescription>
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
                    <FormLabel>Preferred language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
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
                    <FormLabel>Daily goal</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        className="w-24"
                        placeholder="problems / day"
                        value={Number.isFinite(field.value) ? field.value : ""}
                        onChange={(e) => {
                          const raw = e.target.value
                          if (raw === "") {
                            field.onChange(undefined)
                            return
                          }
                          const next = Number(raw)
                          field.onChange(Number.isFinite(next) ? next : undefined)
                        }}
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
                      {TIMEZONES.map((timezone) => (
                        <SelectItem key={timezone} value={timezone}>
                          {timezone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save preferences"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function PreferencesForm() {
  const { data: settings, isPending, refetch } = useSettings()

  if (isPending) {
    return <Skeleton className="h-64 w-full" />
  }

  return <PreferencesFormContent settings={settings} refetch={refetch} />
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
        <div className="flex w-8 flex-shrink-0 flex-col gap-1 p-1.5" style={{ background: t.preview.sidebar }}>
          <div className="h-1.5 w-full rounded-sm" style={{ background: t.preview.primary }} />
          <div className="h-1 w-4 rounded-sm" style={{ background: t.preview.fg, opacity: 0.35 }} />
          <div className="h-1 w-4 rounded-sm" style={{ background: t.preview.fg, opacity: 0.35 }} />
          <div className="h-1 w-3 rounded-sm" style={{ background: t.preview.fg, opacity: 0.35 }} />
        </div>
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
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setTheme(theme.id)}
              className="flex flex-col items-center gap-2 rounded-xl p-1.5 transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ThemeSwatch t={theme} active={themeId === theme.id} />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-medium">{theme.name}</span>
                <span className="text-[10px] text-muted-foreground">{theme.description}</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, preferences, and appearance in one place.
        </p>
      </div>
      <ProfileForm />
      <AppearanceCard />
      <PreferencesForm />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
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
