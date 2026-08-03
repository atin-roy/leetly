"use client"

import { type ChangeEvent, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Clock3,
  Code2,
  Camera,
  Github,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
  Target,
  Trash2,
  User,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
  useUpdateTimezone,
} from "@/hooks/use-settings"
import type { Language, UpdateProfileRequest } from "@/lib/types"
import { cn } from "@/lib/utils"
import styles from "./account.module.css"

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

const MAX_AVATAR_FILE_BYTES = 8 * 1024 * 1024
const MAX_AVATAR_DATA_URL_LENGTH = 500_000

function isAllowedProfileUrl(value: string, domain: "github.com" | "leetcode.com") {
  if (!value) return true

  try {
    const url = new URL(value)
    return url.protocol === "https:" && (url.hostname === domain || url.hostname === `www.${domain}`)
  } catch {
    return false
  }
}

const profileSchema = z.object({
  displayName: z.string().max(100),
  bio: z.string().max(500),
  avatarDataUrl: z.string().max(MAX_AVATAR_DATA_URL_LENGTH),
  leetcodeUrl: z
    .string()
    .max(255)
    .refine((value) => isAllowedProfileUrl(value.trim(), "leetcode.com"), "Use a valid https://leetcode.com profile URL"),
  githubUrl: z
    .string()
    .max(255)
    .refine((value) => isAllowedProfileUrl(value.trim(), "github.com"), "Use a valid https://github.com profile URL"),
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

function getLanguageLabel(language: Language) {
  switch (language) {
    case "JAVA":
      return "Java"
    case "PYTHON":
      return "Python"
    case "JAVASCRIPT":
      return "JavaScript"
    case "TYPESCRIPT":
      return "TypeScript"
    case "CPP":
      return "C++"
    case "C":
      return "C"
    case "GO":
      return "Go"
    case "RUST":
      return "Rust"
    case "KOTLIN":
      return "Kotlin"
    case "SWIFT":
      return "Swift"
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function normalizeProfile(values?: {
  displayName?: string | null
  bio?: string | null
  avatarDataUrl?: string | null
  leetcodeUrl?: string | null
  githubUrl?: string | null
  progressPublic?: boolean | null
  streakPublic?: boolean | null
  listsPublic?: boolean | null
  notesPublic?: boolean | null
}): ProfileFormValues {
  return {
    displayName: values?.displayName ?? "",
    bio: values?.bio ?? "",
    avatarDataUrl: values?.avatarDataUrl ?? "",
    leetcodeUrl: values?.leetcodeUrl ?? "",
    githubUrl: values?.githubUrl ?? "",
    progressPublic: values?.progressPublic ?? true,
    streakPublic: values?.streakPublic ?? true,
    listsPublic: values?.listsPublic ?? false,
    notesPublic: values?.notesPublic ?? false,
  }
}

async function compressAvatarFile(file: File) {
  if (file.size > MAX_AVATAR_FILE_BYTES) {
    throw new Error("Choose an image smaller than 8 MB")
  }

  const imageUrl = URL.createObjectURL(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("Could not read that image"))
      img.src = imageUrl
    })

    const maxDimension = 512
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
    const width = Math.max(1, Math.round(image.width * scale))
    const height = Math.max(1, Math.round(image.height * scale))

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Your browser could not process that image")
    }

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = "high"
    context.drawImage(image, 0, 0, width, height)

    const dataUrl = canvas.toDataURL("image/jpeg", 0.84)
    if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
      throw new Error("That image is still too large after compression")
    }

    return dataUrl
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

function ProfileSection({
  form,
  isLoading,
}: {
  form: ReturnType<typeof useForm<ProfileFormValues>>
  isLoading: boolean
}) {
  const { session } = useAuth()
  if (!session) return null

  const name = session.user?.username ?? ""
  const image = form.watch("avatarDataUrl") || undefined

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const dataUrl = await compressAvatarFile(file)
      form.setValue("avatarDataUrl", dataUrl, { shouldDirty: true, shouldValidate: true })
      toast.success("Profile picture ready to save")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process image")
    } finally {
      event.target.value = ""
    }
  }

  return (
    <Form {...form}>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <p className={styles.panelTitle}>Public profile</p>
          <p className={styles.panelNote}>Shape how your name and study identity appear across Leetly.</p>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.profileGrid}>
            <div className={styles.profileMain}>
              <div className={styles.avatarRow}>
                <div className={styles.avatarIdentity}>
                  <Avatar className={styles.avatar}>
                    <AvatarImage src={image} alt={name || "User"} />
                    <AvatarFallback>{name ? getInitials(name) : <User />}</AvatarFallback>
                  </Avatar>
                  <p className={styles.avatarNote}>
                    Upload a square-friendly headshot or logo. Images are compressed before saving.
                  </p>
                </div>
                <div className={styles.avatarActions}>
                  <Button type="button" variant="secondary" asChild>
                    <label>
                      <Camera size={16} />
                      Upload photo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className={styles.hiddenInput}
                        disabled={isLoading}
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </Button>
                  {form.watch("avatarDataUrl") ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading}
                      onClick={() => form.setValue("avatarDataUrl", "", { shouldDirty: true, shouldValidate: true })}
                    >
                      <Trash2 size={16} />
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input placeholder={name || "Your display name"} disabled={isLoading} {...field} value={field.value ?? ""} />
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
                        disabled={isLoading}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <div className={styles.bioMeta}>
                      <span>Short, specific bios read better than status-line filler.</span>
                      <span>{field.value?.length ?? 0}/500</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className={styles.linkFields}>
                <FormField
                  control={form.control}
                  name="leetcodeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LeetCode profile</FormLabel>
                      <FormControl>
                        <div className={styles.inputIconWrap}>
                          <MonitorSmartphone size={16} className={styles.inputIcon} aria-hidden="true" />
                          <Input
                            placeholder="https://leetcode.com/u/your-handle/"
                            className={styles.inputWithIcon}
                            disabled={isLoading}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub profile</FormLabel>
                      <FormControl>
                        <div className={styles.inputIconWrap}>
                          <Github size={16} className={styles.inputIcon} aria-hidden="true" />
                          <Input
                            placeholder="https://github.com/your-handle"
                            className={styles.inputWithIcon}
                            disabled={isLoading}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className={styles.profileAside}>
              <div className={styles.asideBlock}>
                <div className={styles.asideHead}>
                  <ShieldCheck size={16} />
                  <h3 className={styles.asideTitle}>Visibility</h3>
                </div>
                <p className={styles.asideNote}>Keep your public profile useful without exposing everything.</p>
                <div className={styles.visibilityList}>
                  {visibilityFields.map(({ name: fieldName, label, description }, index) => (
                    <div key={fieldName}>
                      <FormField
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <FormItem className={styles.visibilityRow}>
                            <div>
                              <FormLabel className={styles.visibilityLabel}>{label}</FormLabel>
                              <p className={styles.visibilityDescription}>{description}</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {index < visibilityFields.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/people" className={styles.peopleLink}>
                <Users size={16} />
                Friends and people you follow
              </Link>
            </div>
          </div>
        </div>
      </section>
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
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <p className={styles.panelTitle}>Preferences</p>
        <p className={styles.panelNote}>Set the defaults that shape how you practice every day.</p>
      </div>
      <div className={styles.panelBody}>
        <Form {...form}>
          <div className={styles.prefGrid}>
            <FormField
              control={form.control}
              name="preferredLanguage"
              render={({ field }) => (
                <FormItem className={styles.prefField}>
                  <FormLabel>
                    <Code2 size={16} />
                    Preferred language
                  </FormLabel>
                  <Select disabled={isLoading} onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language} value={language}>
                          {getLanguageLabel(language)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className={styles.prefFieldNote}>Default starter for new attempts.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailyGoal"
              render={({ field }) => (
                <FormItem className={styles.prefField}>
                  <FormLabel>
                    <Target size={16} />
                    Daily goal
                  </FormLabel>
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
                  <p className={styles.prefFieldNote}>Recommended range is 3 to 8 for consistency without padding the stat.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem className={cn(styles.prefField, styles.prefFieldWide)}>
                  <FormLabel>
                    <Clock3 size={16} />
                    Timezone
                  </FormLabel>
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
                  <p className={styles.prefFieldNote}>
                    Controls when your streak, daily goal, and session boundaries roll over.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </div>
    </section>
  )
}

export default function AccountPage() {
  const { session, signOut } = useAuth()
  const { data: profile, isLoading: isProfileLoading } = useProfile()
  const { data: settings, isPending: isSettingsLoading, refetch } = useSettings()
  const { mutateAsync: updateProfile, isPending: isProfileSaving } = useUpdateProfile()
  const languageMutation = useUpdateLanguage()
  const goalMutation = useUpdateDailyGoal()
  const timezoneMutation = useUpdateTimezone()

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

  const isSaving =
    isProfileSaving ||
    languageMutation.isPending ||
    goalMutation.isPending ||
    timezoneMutation.isPending

  const watchedVisibility = useWatch({
    control: profileForm.control,
    name: ["progressPublic", "streakPublic", "listsPublic", "notesPublic"],
  })
  const publicCount = watchedVisibility.filter(Boolean).length

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
      profileValues.avatarDataUrl !== normalizedProfile.avatarDataUrl ||
      profileValues.leetcodeUrl.trim() !== normalizedProfile.leetcodeUrl.trim() ||
      profileValues.githubUrl.trim() !== normalizedProfile.githubUrl.trim() ||
      profileValues.progressPublic !== normalizedProfile.progressPublic ||
      profileValues.streakPublic !== normalizedProfile.streakPublic ||
      profileValues.listsPublic !== normalizedProfile.listsPublic ||
      profileValues.notesPublic !== normalizedProfile.notesPublic

    const settingsChanged =
      settingsValues.preferredLanguage !== normalizedSettings.preferredLanguage ||
      settingsValues.dailyGoal !== normalizedSettings.dailyGoal ||
      settingsValues.timezone !== normalizedSettings.timezone

    if (!profileChanged && !settingsChanged) {
      toast.message("No changes to save")
      return
    }

    try {
      const operations: Promise<unknown>[] = []

      if (profileChanged) {
        const payload: UpdateProfileRequest = {
          ...profileValues,
          displayName: profileValues.displayName || null,
          bio: profileValues.bio || null,
          avatarDataUrl: profileValues.avatarDataUrl || null,
          leetcodeUrl: profileValues.leetcodeUrl.trim() || null,
          githubUrl: profileValues.githubUrl.trim() || null,
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

      await Promise.all(operations)

      if (settingsChanged) {
        const latest = await refetch()
        if (latest.data) {
          settingsForm.reset(normalizeSettings(latest.data))
        }
      }

      toast.success("Account saved")
    } catch {
      toast.error("Failed to save changes")
    }
  }

  if (isSettingsLoading) {
    return (
      <div className={styles.skeletonPage}>
        <Skeleton className={styles.skeletonHeader} />
        <Skeleton className={styles.skeletonPanel} />
        <Skeleton className={styles.skeletonPanel} />
        <Skeleton className={styles.skeletonPanel} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Account</p>
          <h1 className={styles.title}>Tune your profile and defaults.</h1>
          <p className={styles.lede}>Save whenever you are done shaping the profile.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isProfileLoading || isSettingsLoading} size="lg">
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </header>

      <div className={styles.facts}>
        <div className={styles.fact}>
          <span className={styles.factLabel}>Public modules</span>
          <span className={styles.factValue}>{publicCount}/4</span>
        </div>
        <div className={styles.fact}>
          <span className={styles.factLabel}>Signed in as</span>
          <span className={styles.factValue}>{session?.user?.email ?? "—"}</span>
        </div>
      </div>

      <ProfileSection form={profileForm} isLoading={isProfileLoading} />
      <PreferencesSection form={settingsForm} isLoading={isSettingsLoading} />

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <p className={styles.panelTitle}>Session</p>
          <p className={styles.panelNote}>Sign out of your Leetly account on this device.</p>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.sessionRow}>
            <p className={styles.sessionNote}>
              Signing out returns you to the home page. Saved profile and settings changes remain attached to your account.
            </p>
            <Button variant="destructive" onClick={() => void signOut()}>
              <LogOut size={16} />
              Sign out
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
