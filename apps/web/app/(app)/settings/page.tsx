"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ExternalLink, Search, User } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSettings, useThemes, useUpdateSettings } from "@/hooks/use-settings"
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
  themeId: z.number().optional(),
})

type FormValues = z.infer<typeof schema>

// TODO: replace with real API once friends/users backend is ready
const DUMMY_USERS = [
  { username: "algo_master", name: "Alex Chen", solved: 342 },
  { username: "byte_wizard", name: "Sam Rivera", solved: 215 },
  { username: "code_ninja99", name: "Jordan Kim", solved: 189 },
  { username: "leetking", name: "Morgan Lee", solved: 501 },
  { username: "recursion_fan", name: "Taylor Patel", solved: 127 },
  { username: "dp_guru", name: "Casey Wang", solved: 298 },
  { username: "graph_theory", name: "Riley Johnson", solved: 164 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
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
  const { data: themes } = useThemes()
  const updateMutation = useUpdateSettings()

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
        themeId: settings.themeId ?? undefined,
      })
    }
  }, [settings, form])

  async function onSubmit(values: FormValues) {
    try {
      await updateMutation.mutateAsync({
        preferredLanguage: values.preferredLanguage,
        dailyGoal: values.dailyGoal,
        timezone: values.timezone,
        themeId: values.themeId,
      })
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
                  <FormControl>
                    <Input {...field} placeholder="America/New_York" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {themes && themes.length > 0 && (
              <FormField
                control={form.control}
                name="themeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(v === "none" ? undefined : Number(v))
                      }
                      value={field.value ? String(field.value) : "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Default</SelectItem>
                        {themes.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function FriendsTab() {
  const [query, setQuery] = useState("")

  const results =
    query.trim().length > 0
      ? DUMMY_USERS.filter(
          (u) =>
            u.username.toLowerCase().includes(query.toLowerCase()) ||
            u.name.toLowerCase().includes(query.toLowerCase()),
        )
      : []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Find Users</CardTitle>
          <CardDescription>
            Search by username or name to view their profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search username…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {query.trim().length > 0 && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No users found for &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((user) => (
              <Card key={user.username}>
                <CardContent className="flex items-center gap-3 py-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {user.solved} solved
                  </Badge>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    <Link href={`/profile/${user.username}`}>
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <ProfileSection />
          <PreferencesForm />
        </TabsContent>

        <TabsContent value="friends">
          <FriendsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
