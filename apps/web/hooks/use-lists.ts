"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  addProblemToList,
  createProblemList,
  deleteProblemList,
  getProblemList,
  getProblemListProblems,
  getProblemLists,
  removeProblemFromList,
} from "@/lib/api"
import type { CreateListRequest, PagedResponse, ProblemFilters, ProblemSummaryDto } from "@/lib/types"

export function useProblemLists() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["lists"],
    queryFn: () => getProblemLists(session?.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function useProblemList(id: number) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["lists", id],
    queryFn: () => getProblemList(session?.accessToken, id),
    enabled: !!session?.accessToken && !!id,
  })
}

function normalizeFilters(filters?: ProblemFilters): ProblemFilters {
  return {
    difficulty: filters?.difficulty,
    status: filters?.status,
    topicId: filters?.topicId,
    patternId: filters?.patternId,
    search: filters?.search?.trim() || undefined,
    page: filters?.page ?? 0,
    size: filters?.size ?? 20,
    sort: filters?.sort,
  }
}

export function useProblemListProblems(id: number, filters?: ProblemFilters) {
  const { data: session } = useSession()
  const normalized = normalizeFilters(filters)

  return useQuery({
    queryKey: [
      "lists",
      id,
      "problems",
      normalized.difficulty ?? null,
      normalized.status ?? null,
      normalized.topicId ?? null,
      normalized.patternId ?? null,
      normalized.search ?? null,
      normalized.page,
      normalized.size,
      normalized.sort ?? null,
    ],
    queryFn: () => getProblemListProblems(session?.accessToken, id, normalized),
    enabled: !!session?.accessToken && !!id,
    placeholderData: (previousData: PagedResponse<ProblemSummaryDto> | undefined) => previousData,
  })
}

export function useCreateList() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateListRequest) =>
      createProblemList(session?.accessToken, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  })
}

export function useDeleteList() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProblemList(session?.accessToken, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  })
}

export function useAddProblemToList() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      listId,
      problemId,
    }: {
      listId: number
      problemId: number
    }) => addProblemToList(session?.accessToken, listId, problemId),
    onSuccess: (_data, { listId }) => {
      qc.invalidateQueries({ queryKey: ["lists"] })
      qc.invalidateQueries({ queryKey: ["lists", listId] })
    },
  })
}

export function useRemoveProblemFromList() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      listId,
      problemId,
    }: {
      listId: number
      problemId: number
    }) => removeProblemFromList(session?.accessToken, listId, problemId),
    onSuccess: (_data, { listId }) => {
      qc.invalidateQueries({ queryKey: ["lists"] })
      qc.invalidateQueries({ queryKey: ["lists", listId] })
    },
  })
}
