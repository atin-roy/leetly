"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/auth-provider"
import {
  getUserSettings,
  updateUserLanguage,
  updateUserDailyGoal,
  updateUserTimezone,
} from "@/lib/api"
import type { Language } from "@/lib/types"

export function useSettings() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => getUserSettings(session?.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function useUpdateLanguage() {
  const { session } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (language: Language) =>
      updateUserLanguage(session?.accessToken, language),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  })
}

export function useUpdateDailyGoal() {
  const { session } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dailyGoal: number) =>
      updateUserDailyGoal(session?.accessToken, dailyGoal),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  })
}

export function useUpdateTimezone() {
  const { session } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (timezone: string) =>
      updateUserTimezone(session?.accessToken, timezone),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  })
}

