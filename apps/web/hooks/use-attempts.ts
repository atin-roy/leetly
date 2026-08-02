"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/auth-provider"
import {
  deleteAttempt,
  getAttempts,
  getMistakes,
  logAttempt,
  updateAttempt,
} from "@/lib/api"
import type { LogAttemptRequest, UpdateAttemptRequest } from "@/lib/types"

export function useAttempts(problemId: number) {
  const { session } = useAuth()
  return useQuery({
    queryKey: ["attempts", problemId],
    queryFn: () => getAttempts(session?.accessToken, problemId),
    enabled: !!session?.accessToken && !!problemId,
  })
}

export function useMistakeOptions() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ["mistakes"],
    queryFn: () => getMistakes(session?.accessToken),
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogAttempt(problemId: number) {
  const { session } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: LogAttemptRequest) =>
      logAttempt(session?.accessToken, problemId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attempts", problemId] })
      qc.invalidateQueries({ queryKey: ["problems", problemId] })
      qc.invalidateQueries({ queryKey: ["problems"] })
      qc.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}

export function useUpdateAttempt(problemId: number) {
  const { session } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      attemptId,
      body,
    }: {
      attemptId: number
      body: UpdateAttemptRequest
    }) => updateAttempt(session?.accessToken, problemId, attemptId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attempts", problemId] })
      qc.invalidateQueries({ queryKey: ["problems", problemId] })
      qc.invalidateQueries({ queryKey: ["problems"] })
      qc.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}

export function useDeleteAttempt(problemId: number) {
  const { session } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attemptId: number) =>
      deleteAttempt(session?.accessToken, problemId, attemptId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attempts", problemId] })
      qc.invalidateQueries({ queryKey: ["problems", problemId] })
      qc.invalidateQueries({ queryKey: ["problems"] })
      qc.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}
