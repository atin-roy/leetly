"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { getUserProfile, updateUserProfile } from "@/lib/api"
import type { UpdateProfileRequest } from "@/lib/types"

export function useProfile() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => getUserProfile(session?.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function useUpdateProfile() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) =>
      updateUserProfile(session?.accessToken, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  })
}
