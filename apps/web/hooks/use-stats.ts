"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { getDailyStats, getUserStats } from "@/lib/api"

export function useUserStats() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["stats", "user"],
    queryFn: () => getUserStats(session?.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function useDailyStats(days = 365) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["stats", "daily", days],
    queryFn: () => getDailyStats(session?.accessToken, days),
    enabled: !!session?.accessToken,
  })
}
