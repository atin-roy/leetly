"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  enrollReview,
  getReviewCardsDue,
  getReviewHistory,
  getReviewStats,
  quickReview,
  removeReview,
} from "@/lib/api"
import type { Rating } from "@/lib/types"

export function useReviewCardsDue(page = 0, size = 20) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["review-cards", "due", page, size],
    queryFn: () => getReviewCardsDue(session?.accessToken, page, size),
    enabled: !!session?.accessToken,
  })
}

export function useReviewStats() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["review-cards", "stats"],
    queryFn: () => getReviewStats(session?.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function useReviewHistory(cardId: number) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["review-cards", cardId, "history"],
    queryFn: () => getReviewHistory(session?.accessToken, cardId),
    enabled: !!session?.accessToken && !!cardId,
  })
}

export function useEnrollReview() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (problemId: number) =>
      enrollReview(session?.accessToken, { problemId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-cards"] })
      qc.invalidateQueries({ queryKey: ["problems"] })
    },
  })
}

export function useRemoveReview() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cardId: number) =>
      removeReview(session?.accessToken, cardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-cards"] })
      qc.invalidateQueries({ queryKey: ["problems"] })
    },
  })
}

export function useQuickReview() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, rating }: { cardId: number; rating: Rating }) =>
      quickReview(session?.accessToken, cardId, { rating }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-cards"] })
      qc.invalidateQueries({ queryKey: ["problems"] })
    },
  })
}
