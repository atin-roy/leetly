"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  discoverUsers,
  getFriendOverview,
  getPublicUserProfile,
  sendFriendRequest,
  unfriend,
} from "@/lib/api"

export function usePeople(search?: string, page = 0, size = 24) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["people", search?.trim() || null, page, size],
    queryFn: () => discoverUsers(session?.accessToken, { search, page, size }),
    enabled: !!session?.accessToken,
  })
}

export function useFriendOverview() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["friend-overview"],
    queryFn: () => getFriendOverview(session?.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function usePublicProfile(id: number) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["public-profile", id],
    queryFn: () => getPublicUserProfile(session?.accessToken, id),
    enabled: !!session?.accessToken && !!id,
  })
}

function invalidateSocial(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["people"] })
  qc.invalidateQueries({ queryKey: ["friend-overview"] })
  qc.invalidateQueries({ queryKey: ["public-profile"] })
}

export function useSendFriendRequest() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => sendFriendRequest(session?.accessToken, userId),
    onSuccess: () => invalidateSocial(qc),
  })
}

export function useAcceptFriendRequest() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: number) => acceptFriendRequest(session?.accessToken, requestId),
    onSuccess: () => invalidateSocial(qc),
  })
}

export function useDeclineFriendRequest() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: number) => declineFriendRequest(session?.accessToken, requestId),
    onSuccess: () => invalidateSocial(qc),
  })
}

export function useCancelFriendRequest() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: number) => cancelFriendRequest(session?.accessToken, requestId),
    onSuccess: () => invalidateSocial(qc),
  })
}

export function useUnfriend() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => unfriend(session?.accessToken, userId),
    onSuccess: () => invalidateSocial(qc),
  })
}
