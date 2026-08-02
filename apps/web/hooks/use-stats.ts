"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/components/auth-provider"
import { getDailyStats, getUserStats } from "@/lib/api"

export function useUserStats() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ["stats", "user"],
    queryFn: () => getUserStats(session?.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function useDailyStats(days?: number) {
  const { session } = useAuth()
  return useQuery({
    queryKey: ["stats", "daily", days ?? "all"],
    queryFn: () => getDailyStats(session?.accessToken, days),
    enabled: !!session?.accessToken,
  })
}
