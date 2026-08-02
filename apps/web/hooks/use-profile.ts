"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/auth-provider"
import { getUserProfile, updateUserProfile } from "@/lib/api"
import type { UpdateProfileRequest } from "@/lib/types"

export function useProfile() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => getUserProfile(session?.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function useUpdateProfile() {
  const { session } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) =>
      updateUserProfile(session?.accessToken, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  })
}
