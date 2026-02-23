"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { getPatterns, getProblem, getProblems, getTopics } from "@/lib/api"
import type { ProblemFilters } from "@/lib/types"

export function useProblems(filters?: ProblemFilters) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["problems", filters],
    queryFn: () => getProblems(session?.accessToken, filters),
    enabled: !!session?.accessToken,
  })
}

export function useProblem(id: number) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["problems", id],
    queryFn: () => getProblem(session?.accessToken, id),
    enabled: !!session?.accessToken && !!id,
  })
}

export function useTopics() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["topics"],
    queryFn: () => getTopics(session?.accessToken),
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePatterns() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["patterns"],
    queryFn: () => getPatterns(session?.accessToken),
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  })
}

export function useInvalidateProblem() {
  const qc = useQueryClient()
  return (id: number) => {
    qc.invalidateQueries({ queryKey: ["problems", id] })
    qc.invalidateQueries({ queryKey: ["problems"] })
  }
}
