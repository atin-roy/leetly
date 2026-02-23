"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { getThemes, getUserSettings, updateUserSettings } from "@/lib/api"
import type { UpdateSettingsRequest } from "@/lib/types"

export function useSettings() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => getUserSettings(session?.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function useUpdateSettings() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateSettingsRequest) =>
      updateUserSettings(session?.accessToken, body),
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
