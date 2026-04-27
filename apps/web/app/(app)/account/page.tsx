"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Globe2,
  LogOut,
  MoonStar,
  Palette,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Target,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import {
  useSettings,
  useUpdateDailyGoal,
  useUpdateLanguage,
  useUpdateTheme,
  useUpdateTimezone,
} from "@/hooks/use-settings"
import { useTheme } from "@/hooks/use-theme"
import { THEMES, type Theme, type ThemeId } from "@/lib/themes"
import type { Language, UpdateProfileRequest } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  {
    name: "progressPublic" as const,
    label: "Problem progress",
    description: "Show solved counts, attempts, and completion patterns.",
  },
  {
    name: "streakPublic" as const,
    label: "Solve streak",
    description: "Let other people see your current momentum.",
  },
  {
    name: "listsPublic" as const,
    label: "My lists",
    description: "Share your curated interview and study lists.",
  },
  {
    name: "notesPublic" as const,
    label: "Notes",
    description: "Expose written takeaways directly on your public profile.",
  },
]

const LIGHT_THEMES = THEMES.filter((theme) => theme.mode === "light")
const DARK_THEMES = THEMES.filter((theme) => theme.mode === "dark")

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
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function isMissingThemeSaveEndpoint(error: unknown) {
  return error instanceof Error && error.message.startsWith("404:")
}

function normalizeProfile(values?: {
  displayName?: string | null
  bio?: string | null
  progressPublic?: boolean | null
  streakPublic?: boolean | null
  listsPublic?: boolean | null
  notesPublic?: boolean | null
}): ProfileFormValues {
  return {
    displayName: values?.displayName ?? "",
    bio: values?.bio ?? "",
    progressPublic: values?.progressPublic ?? true,
    streakPublic: values?.streakPublic ?? true,
    listsPublic: values?.listsPublic ?? false,
    notesPublic: values?.notesPublic ?? false,
  }
}

function resolvePersistedThemeId(themeId?: number | null): ThemeId {
  return themeId && themeId > 0 && themeId <= THEMES.length ? THEMES[themeId - 1].id : "default"
}

function ThemeSwatch({
  theme,
  active,
  className,
}: {
  theme: Theme
  active: boolean
  className?: string
}) {
  return (
    <div
      className={cn("overflow-hidden rounded-[1.35rem] border bg-transparent p-2", className)}
      style={{
        borderColor: active ? theme.preview.primary : theme.preview.border,
        boxShadow: active
          ? `0 0 0 1px ${theme.preview.primary}, 0 18px 42px color-mix(in oklab, ${theme.preview.primary} 22%, transparent)`
          : `0 10px 24px color-mix(in oklab, ${theme.preview.border} 35%, transparent)`,
      }}
    >
      <div
        className="grid h-full min-h-[120px] grid-cols-[54px_1fr] overflow-hidden rounded-[1rem]"
        style={{ background: theme.preview.bg }}
      >
        <div className="flex flex-col gap-2 p-3" style={{ background: theme.preview.sidebar }}>
          <div className="h-2.5 w-full rounded-full" style={{ background: theme.preview.primary }} />
          <div className="h-1.5 w-4/5 rounded-full" style={{ background: theme.preview.fg, opacity: 0.42 }} />
          <div className="h-1.5 w-3/5 rounded-full" style={{ background: theme.preview.fg, opacity: 0.28 }} />
          <div className="mt-auto h-6 rounded-[0.8rem]" style={{ background: theme.preview.card }}>
            <div
              className="m-1 h-1.5 rounded-full"
              style={{ background: theme.preview.primary, opacity: 0.75 }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="h-2.5 w-16 rounded-full" style={{ background: theme.preview.fg, opacity: 0.7 }} />
              <div className="h-1.5 w-24 rounded-full" style={{ background: theme.preview.fg, opacity: 0.22 }} />
            </div>
            <div className="h-6 w-6 rounded-full" style={{ background: theme.preview.primary, opacity: 0.9 }} />
          </div>
          <div
            className="rounded-[0.9rem] border p-2"
            style={{ background: theme.preview.card, borderColor: theme.preview.border }}
          >
            <div className="flex gap-1.5">
              <div className="h-7 flex-1 rounded-[0.7rem]" style={{ background: theme.preview.primary, opacity: 0.22 }} />
              <div className="h-7 w-12 rounded-[0.7rem]" style={{ background: theme.preview.border, opacity: 0.65 }} />
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="h-1.5 w-full rounded-full" style={{ background: theme.preview.fg, opacity: 0.16 }} />
              <div className="h-1.5 w-4/5 rounded-full" style={{ background: theme.preview.fg, opacity: 0.16 }} />
            </div>
          </div>
          <div className="mt-auto flex gap-1.5">
            <div className="h-6 flex-1 rounded-full" style={{ background: theme.preview.primary }} />
            <div className="h-6 w-14 rounded-full" style={{ background: theme.preview.border, opacity: 0.8 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeOption({
  theme,
  active,
  onSelect,
}: {
  theme: Theme
  active: boolean
  onSelect: (themeId: ThemeId) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      className={cn(
        "group rounded-[1.6rem] border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-primary/60 bg-primary/[0.08] shadow-[0_20px_50px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
          : "border-border/70 bg-card/72 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card",
      )}
    >
      <ThemeSwatch theme={theme} active={active} className="w-full" />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold tracking-tight">{theme.name}</p>
            <Badge variant={active ? "default" : "secondary"} className="capitalize">
              {theme.mode}
            </Badge>
          </div>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{theme.description}</p>
        </div>
        <div
          className={cn(
            "mt-1 h-3 w-3 rounded-full border transition-colors",
            active ? "border-primary bg-primary" : "border-border bg-background group-hover:border-primary/50",
          )}
        />
      </div>
    </button>
  )
}

function ThemeGroup({
  title,
  description,
  themes,
  selectedThemeId,
  onSelect,
  icon,
}: {
  title: string
  description: string
  themes: Theme[]
  selectedThemeId: ThemeId
  onSelect: (themeId: ThemeId) => void
  icon: ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{icon}</span>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline">{themes.length} themes</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {themes.map((theme) => (
          <ThemeOption
            key={theme.id}
            theme={theme}
            active={selectedThemeId === theme.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

function ProfileSection({
  form,
  isLoading,
}: {
  form: ReturnType<typeof useForm<ProfileFormValues>>
  isLoading: boolean
}) {
  const { data: session } = useSession()
  if (!session) return null

  const name = session.user?.name ?? ""
  const email = session.user?.email ?? ""
  const image = session.user?.image ?? undefined
  const visibleCount = visibilityFields.filter(({ name: fieldName }) => form.watch(fieldName)).length

  return (
    <Form {...form}>
      <Card className="overflow-hidden border-border/70 py-0">
        <div className="relative overflow-hidden border-b border-border/60 px-5 py-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_42%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.14),transparent_34%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-[4.5rem] w-[4.5rem] border border-white/20 text-lg shadow-lg">
                <AvatarImage src={image} alt={name || "User"} />
                <AvatarFallback>
                  {name ? getInitials(name) : <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Identity provider</Badge>
                  <Badge variant="secondary">{visibleCount}/4 public modules</Badge>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{name || "Your account"}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{email || "No email available"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
              <div className="rounded-2xl border border-border/60 bg-background/72 p-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Profile Surface</p>
                <p className="mt-2 text-sm font-medium">Display name, bio, and privacy controls in one place.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/72 p-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Public Signal</p>
                <p className="mt-2 text-sm font-medium">Decide what other users can inspect when they visit your profile.</p>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="space-y-8 py-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight">Public profile</h3>
                <p className="text-sm text-muted-foreground">
                  Shape how your name and study identity appear across Leetly.
                </p>
              </div>
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
                        className="min-h-[132px] resize-none"
                        disabled={isLoading}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Short, specific bios read better than status-line filler.</span>
                      <span>{field.value?.length ?? 0}/500</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-[1.6rem] border border-border/70 bg-muted/[0.28] p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-semibold tracking-tight">Visibility controls</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep your public profile useful without exposing everything.
              </p>
              <div className="mt-4 space-y-1">
                {visibilityFields.map(({ name: fieldName, label, description }, index) => (
                  <div key={fieldName}>
                    <FormField
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-4 rounded-2xl px-1 py-3">
                          <div className="min-w-0">
                            <FormLabel className="cursor-pointer text-sm font-medium">{label}</FormLabel>
                            <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
                          </div>
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
                    {index < visibilityFields.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Form>
  )
}

function PreferencesSection({
  form,
  isLoading,
}: {
  form: ReturnType<typeof useForm<SettingsFormValues>>
  isLoading: boolean
}) {
  return (
    <Card className="border-border/70 py-0">
      <CardHeader className="border-b border-border/60 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Preferences</CardTitle>
            <CardDescription>
              Set the defaults that shape how you practice every day.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <Target className="h-3 w-3" />
              Daily rhythm
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Globe2 className="h-3 w-3" />
              Regional time
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-6">
        <Form {...form}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="preferredLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred language</FormLabel>
                      <Select disabled={isLoading} onValueChange={field.onChange} value={field.value}>
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
                          placeholder="Problems / day"
                          disabled={isLoading}
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
                    <Select disabled={isLoading} onValueChange={field.onChange} value={field.value}>
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
            </div>

            <div className="rounded-[1.6rem] border border-border/70 bg-muted/[0.28] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Setup Notes</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
                <p>Your language default is used as the starting point when you create new attempts.</p>
                <p>Daily goal should be realistic enough to keep your streak intact on ordinary days.</p>
                <p>Timezone controls when goals and streak boundaries reset.</p>
              </div>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}

function AppearanceSection({
  themeId,
  onSelect,
}: {
  themeId: ThemeId
  onSelect: (themeId: ThemeId) => void
}) {
  const selectedTheme = THEMES.find((theme) => theme.id === themeId) ?? THEMES[0]

  return (
    <Card className="overflow-hidden border-border/70 py-0">
      <div className="relative border-b border-border/60 px-5 py-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_34%),radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.16),transparent_30%)]" />
        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Palette className="h-3 w-3" />
                Theme Lab
              </Badge>
              <Badge variant="secondary">{LIGHT_THEMES.length} light / {DARK_THEMES.length} dark</Badge>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Appearance with actual range</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              The theme catalog now splits evenly between bright and dark palettes, with more distinct moods than minor shade swaps.
            </p>
          </div>
          <div className="rounded-[1.8rem] border border-border/60 bg-background/72 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current pick</p>
                <p className="mt-2 text-xl font-semibold tracking-tight">{selectedTheme.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedTheme.description}</p>
              </div>
              <Badge className="capitalize">{selectedTheme.mode}</Badge>
            </div>
            <ThemeSwatch theme={selectedTheme} active className="mt-4" />
          </div>
        </div>
      </div>
      <CardContent className="space-y-8 py-6">
        <ThemeGroup
          title="Light Themes"
          description="Bright palettes with different temperatures, materials, and accent personalities."
          themes={LIGHT_THEMES}
          selectedThemeId={themeId}
          onSelect={onSelect}
          icon={<SunMedium className="h-4 w-4" />}
        />
        <ThemeGroup
          title="Dark Themes"
          description="Dark workspaces ranging from quiet graphite to louder neon and cinematic color."
          themes={DARK_THEMES}
          selectedThemeId={themeId}
          onSelect={onSelect}
          icon={<MoonStar className="h-4 w-4" />}
        />
      </CardContent>
    </Card>
  )
}

export default function AccountPage() {
  const { data: session } = useSession()
  const { data: profile, isLoading: isProfileLoading } = useProfile()
  const { data: settings, isPending: isSettingsLoading, refetch } = useSettings()
  const { mutateAsync: updateProfile, isPending: isProfileSaving } = useUpdateProfile()
  const languageMutation = useUpdateLanguage()
  const goalMutation = useUpdateDailyGoal()
  const timezoneMutation = useUpdateTimezone()
  const themeMutation = useUpdateTheme()
  const { themeId: appliedThemeId, setTheme } = useTheme()
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(appliedThemeId)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: normalizeProfile(),
  })
  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: normalizeSettings(),
  })

  useEffect(() => {
    if (profile) {
      profileForm.reset(normalizeProfile(profile))
    }
  }, [profile, profileForm])

  useEffect(() => {
    if (settings) {
      settingsForm.reset(normalizeSettings(settings))
    }
  }, [settings, settingsForm])

  useEffect(() => {
    setSelectedThemeId(appliedThemeId)
  }, [appliedThemeId])

  const isSaving =
    isProfileSaving ||
    languageMutation.isPending ||
    goalMutation.isPending ||
    timezoneMutation.isPending ||
    themeMutation.isPending

  const persistedThemeId = resolvePersistedThemeId(settings?.themeId)
  const watchedVisibility = useWatch({
    control: profileForm.control,
    name: ["progressPublic", "streakPublic", "listsPublic", "notesPublic"],
  })
  const publicCount = watchedVisibility.filter(Boolean).length

  function handleThemeSelect(themeId: ThemeId) {
    setSelectedThemeId(themeId)
    setTheme(themeId, { persist: false })
  }

  async function handleSave() {
    const [isProfileValid, isSettingsValid] = await Promise.all([
      profileForm.trigger(),
      settingsForm.trigger(),
    ])

    if (!isProfileValid || !isSettingsValid) return

    const profileValues = profileForm.getValues()
    const settingsValues = settingsForm.getValues()
    const normalizedProfile = normalizeProfile(profile)
    const normalizedSettings = normalizeSettings(settings)

    const profileChanged =
      profileValues.displayName !== normalizedProfile.displayName ||
      profileValues.bio !== normalizedProfile.bio ||
      profileValues.progressPublic !== normalizedProfile.progressPublic ||
      profileValues.streakPublic !== normalizedProfile.streakPublic ||
      profileValues.listsPublic !== normalizedProfile.listsPublic ||
      profileValues.notesPublic !== normalizedProfile.notesPublic

    const settingsChanged =
      settingsValues.preferredLanguage !== normalizedSettings.preferredLanguage ||
      settingsValues.dailyGoal !== normalizedSettings.dailyGoal ||
      settingsValues.timezone !== normalizedSettings.timezone

    const themeChanged = selectedThemeId !== persistedThemeId

    if (!profileChanged && !settingsChanged && !themeChanged) {
      toast.message("No changes to save")
      return
    }

    try {
      const operations: Promise<unknown>[] = []
      let themeSaveError: unknown = null

      if (profileChanged) {
        const payload: UpdateProfileRequest = {
          ...profileValues,
          displayName: profileValues.displayName || null,
          bio: profileValues.bio || null,
        }
        operations.push(
          updateProfile(payload).then((updatedProfile) => {
            profileForm.reset(normalizeProfile(updatedProfile))
          }),
        )
      }

      if (settingsValues.preferredLanguage !== normalizedSettings.preferredLanguage) {
        operations.push(languageMutation.mutateAsync(settingsValues.preferredLanguage))
      }

      if (settingsValues.dailyGoal !== normalizedSettings.dailyGoal) {
        operations.push(goalMutation.mutateAsync(settingsValues.dailyGoal))
      }

      if (settingsValues.timezone !== normalizedSettings.timezone) {
        operations.push(timezoneMutation.mutateAsync(settingsValues.timezone))
      }

      if (themeChanged) {
        const nextThemeIndex = THEMES.findIndex((theme) => theme.id === selectedThemeId)
        operations.push(
          themeMutation.mutateAsync(nextThemeIndex >= 0 ? nextThemeIndex + 1 : null).catch((error) => {
            if (isMissingThemeSaveEndpoint(error)) {
              themeSaveError = error
              return null
            }
            throw error
          }),
        )
      }

      await Promise.all(operations)

      if (settingsChanged || themeChanged) {
        const latest = await refetch()
        if (latest.data) {
          settingsForm.reset(normalizeSettings(latest.data))
        }
      }

      if (themeSaveError) {
        toast.warning("Profile saved, but theme sync is not available yet")
        return
      }

      toast.success("Account saved")
    } catch (error) {
      if (isMissingThemeSaveEndpoint(error)) {
        toast.warning("Theme saved locally, but server sync is not available yet")
        return
      }

      toast.error("Failed to save changes")
    }
  }

  if (isSettingsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[170px] w-full rounded-[2rem]" />
        <Skeleton className="h-[460px] w-full rounded-[2rem]" />
        <Skeleton className="h-[760px] w-full rounded-[2rem]" />
        <Skeleton className="h-[280px] w-full rounded-[2rem]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--background)_90%,var(--primary)_10%),color-mix(in_oklab,var(--background)_84%,var(--accent)_16%))] px-6 py-6 shadow-[0_28px_80px_rgba(0,0,0,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.22),transparent_34%),radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.16),transparent_30%),radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.1),transparent_34%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1 border-white/20 bg-background/60">
                <Sparkles className="h-3 w-3" />
                Account Studio
              </Badge>
              <Badge variant="secondary" className="bg-background/70">
                {LIGHT_THEMES.length + DARK_THEMES.length} curated themes
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Make the workspace feel intentional.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
              Tune your public profile, daily defaults, and theme system from one page without the flat settings-screen feel.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[560px]">
            <div className="rounded-[1.5rem] border border-border/60 bg-background/76 p-4 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Selected Theme</p>
              <p className="mt-2 text-lg font-semibold">{THEMES.find((theme) => theme.id === selectedThemeId)?.name ?? "Default"}</p>
              <p className="mt-1 text-sm text-muted-foreground capitalize">
                {THEMES.find((theme) => theme.id === selectedThemeId)?.mode ?? "light"} palette
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/60 bg-background/76 p-4 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Public Modules</p>
              <p className="mt-2 text-lg font-semibold">{publicCount}/4 enabled</p>
              <p className="mt-1 text-sm text-muted-foreground">Progress, streak, lists, and notes visibility.</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/60 bg-background/76 p-4 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Session</p>
              <p className="mt-2 truncate text-lg font-semibold">{session?.user?.email ?? "Signed in"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Changes persist locally first, then sync when available.</p>
            </div>
          </div>
        </div>
        <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Save whenever you are done shaping the profile and previewing themes.
          </div>
          <Button onClick={handleSave} disabled={isSaving || isProfileLoading || isSettingsLoading} size="lg">
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </section>

      <ProfileSection form={profileForm} isLoading={isProfileLoading} />
      <AppearanceSection themeId={selectedThemeId} onSelect={handleThemeSelect} />
      <PreferencesSection form={settingsForm} isLoading={isSettingsLoading} />

      <Card className="border-border/70 py-0">
        <CardHeader className="border-b border-border/60 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Session</CardTitle>
              <CardDescription>Sign out of your Leetly account on this device.</CardDescription>
            </div>
            <Badge variant="outline">Secure exit</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Signing out returns you to the home page. Saved profile and settings changes remain attached to your account.
          </p>
          <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
