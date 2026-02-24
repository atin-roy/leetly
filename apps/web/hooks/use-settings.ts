"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  getThemes,
  getUserSettings,
  updateUserLanguage,
  updateUserDailyGoal,
  updateUserTimezone,
  updateUserTheme,
} from "@/lib/api"
import type { Language } from "@/lib/types"

export function useSettings() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => getUserSettings(session?.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function useUpdateLanguage() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (language: Language) =>
      updateUserLanguage(session?.accessToken, language),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  })
}

export function useUpdateDailyGoal() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dailyGoal: number) =>
      updateUserDailyGoal(session?.accessToken, dailyGoal),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  })
}

export function useUpdateTimezone() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (timezone: string) =>
      updateUserTimezone(session?.accessToken, timezone),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  })
}

export function useUpdateTheme() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (themeId: number | null) =>
      updateUserTheme(session?.accessToken, themeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  })
}

export function useThemes() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["themes"],
    queryFn: () => getThemes(session?.accessToken),
    enabled: !!session?.accessToken,
    staleTime: 10 * 60 * 1000,
  })
}
