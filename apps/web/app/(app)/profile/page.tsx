"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ExternalLink, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useProfile, useUpdateProfile } from "@/hooks/use-profile"

const schema = z.object({
  displayName: z.string().max(100).or(z.literal("")).transform((v) => v || null),
  bio: z.string().max(500).or(z.literal("")).transform((v) => v || null),
  progressPublic: z.boolean(),
  streakPublic: z.boolean(),
  listsPublic: z.boolean(),
  notesPublic: z.boolean(),
})

type FormValues = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

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

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function FindUsersTab() {
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
          <CardDescription>Search by username or name to view their profile</CardDescription>
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
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {user.solved} solved
                  </Badge>
                  <Button asChild variant="outline" size="sm" className="shrink-0">
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

const visibilityFields = [
  { name: "progressPublic" as const, label: "Problem progress" },
  { name: "streakPublic" as const, label: "Solve streak" },
  { name: "listsPublic" as const, label: "My Lists" },
  { name: "notesPublic" as const, label: "Notes" },
]

export default function ProfilePage() {
  const { data: session } = useSession()
  const { data: profile, isLoading } = useProfile()
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
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

  async function onSubmit(values: FormOutput) {
    try {
      await updateProfile(values)
      toast.success("Profile saved")
    } catch {
      toast.error("Failed to save profile")
    }
  }

  if (!session) return null

  const name = session.user?.name ?? ""
  const email = session.user?.email ?? ""
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your public profile and find other users.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="find">Find Users</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Identity card (read-only from Keycloak) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account</CardTitle>
                  <CardDescription>Managed by your identity provider.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="text-base font-medium">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{name || "—"}</p>
                      <p className="text-sm text-muted-foreground">{email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Editable profile info */}
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

              {/* Visibility */}
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
                  {isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="find">
          <FindUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
