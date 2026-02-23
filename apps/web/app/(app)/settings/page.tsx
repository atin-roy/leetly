"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings, useThemes, useUpdateSettings } from "@/hooks/use-settings"
import type { Language } from "@/lib/types"

const LANGUAGES: Language[] = [
  "JAVA", "PYTHON", "JAVASCRIPT", "TYPESCRIPT",
  "CPP", "C", "GO", "RUST", "KOTLIN", "SWIFT",
]

const schema = z.object({
  preferredLanguage: z.enum(["JAVA","PYTHON","JAVASCRIPT","TYPESCRIPT","CPP","C","GO","RUST","KOTLIN","SWIFT"]),
  dailyGoal: z.number().int().min(1).max(50),
  timezone: z.string().min(1, "Timezone is required"),
  themeId: z.number().optional(),
})

type FormValues = z.infer<typeof schema>

export default function SettingsPage() {
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
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full max-w-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormLabel>Daily Goal (problems/day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={50}
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

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
