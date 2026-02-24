"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Textarea } from "@/components/ui/textarea"
import { useProfile, useUpdateProfile } from "@/hooks/use-profile"

const schema = z.object({
  displayName: z.string().max(100),
  bio: z.string().max(500),
  progressPublic: z.boolean(),
  streakPublic: z.boolean(),
  listsPublic: z.boolean(),
  notesPublic: z.boolean(),
})

type FormValues = z.infer<typeof schema>





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

  async function onSubmit(values: FormValues) {
    try {
      await updateProfile({
        ...values,
        displayName: values.displayName || null,
        bio: values.bio || null,
      })
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
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your public profile settings.
      </p>

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
    </div>
  )
}
