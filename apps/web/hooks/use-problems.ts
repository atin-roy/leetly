"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  addProblemPattern,
  addProblemTopic,
  addRelatedProblem,
  createPattern,
  createProblem,
  createTopic,
  getPatterns,
  getProblem,
  getProblems,
  getTopics,
  removeProblemPattern,
  removeProblemTopics,
  updateProblemStatus,
} from "@/lib/api"
import type {
  PagedResponse,
  ProblemDetailDto,
  ProblemFilters,
  ProblemListDto,
  ProblemSummaryDto,
} from "@/lib/types"

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

function updateProblemInPage(
  page: PagedResponse<ProblemSummaryDto> | undefined,
  updatedProblem: ProblemSummaryDto,
) {
  if (!page) return page

  let changed = false
  const content = page.content.map((problem) => {
    if (problem.id !== updatedProblem.id) return problem
    changed = true
    return { ...problem, status: updatedProblem.status }
  })

  return changed ? { ...page, content } : page
}

function updateProblemInList(
  list: ProblemListDto | undefined,
  updatedProblem: ProblemSummaryDto,
) {
  if (!list) return list

  let changed = false
  const problems = list.problems.map((problem) => {
    if (problem.id !== updatedProblem.id) return problem
    changed = true
    return { ...problem, status: updatedProblem.status }
  })

  return changed ? { ...list, problems } : list
}

export function useProblems(filters?: ProblemFilters) {
  const { data: session } = useSession()
  const normalized = useMemo(() => normalizeFilters(filters), [filters])

  return useQuery({
    queryKey: [
      "problems",
      session?.accessToken,
      normalized.difficulty ?? null,
      normalized.status ?? null,
      normalized.topicId ?? null,
      normalized.patternId ?? null,
      normalized.search ?? null,
      normalized.page,
      normalized.size,
      normalized.sort ?? null,
    ],
    queryFn: () => getProblems(session?.accessToken, normalized),
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

export function useCreateProblem() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<ProblemSummaryDto, "id" | "status">) =>
      createProblem(session?.accessToken, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] })
      qc.invalidateQueries({ queryKey: ["lists"] })
    },
  })
}

export function useCreateTopic() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; description?: string }) =>
      createTopic(session?.accessToken, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  })
}

export function useCreatePattern() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; description?: string; topicId?: number | null; namedAlgorithm?: boolean }) =>
      createPattern(session?.accessToken, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patterns"] }),
  })
}

export function useInvalidateProblem() {
  const qc = useQueryClient()
  return (id: number) => {
    qc.invalidateQueries({ queryKey: ["problems", id] })
    qc.invalidateQueries({ queryKey: ["problems"] })
  }
}

export function useUpdateProblemStatus(problemId: number) {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: string) =>
      updateProblemStatus(session?.accessToken, problemId, status),
    onSuccess: (updatedProblem) => {
      qc.setQueryData<ProblemDetailDto | undefined>(
        ["problems", problemId],
        (current) => current ? { ...current, status: updatedProblem.status } : current,
      )
      qc.setQueriesData(
        { queryKey: ["problems"] },
        (current: PagedResponse<ProblemSummaryDto> | ProblemDetailDto | undefined) =>
          current && "content" in current
            ? updateProblemInPage(current, updatedProblem)
            : current,
      )
      qc.setQueriesData(
        { queryKey: ["lists"] },
        (current: ProblemListDto[] | ProblemListDto | undefined) => {
          if (Array.isArray(current)) {
            return current.map((list) => updateProblemInList(list, updatedProblem) ?? list)
          }

          return current && "problems" in current
            ? updateProblemInList(current, updatedProblem)
            : current
        },
      )
      qc.invalidateQueries({ queryKey: ["problems", problemId] })
      qc.invalidateQueries({ queryKey: ["problems"] })
      qc.invalidateQueries({ queryKey: ["lists"] })
      qc.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}

export function useAddTopic(problemId: number) {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (topicId: number) =>
      addProblemTopic(session?.accessToken, problemId, topicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems", problemId] })
      qc.invalidateQueries({ queryKey: ["problems"] })
    },
  })
}

export function useRemoveTopics(problemId: number) {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (topicIds: number[]) =>
      removeProblemTopics(session?.accessToken, problemId, topicIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems", problemId] })
      qc.invalidateQueries({ queryKey: ["problems"] })
    },
  })
}

export function useAddPattern(problemId: number) {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patternId: number) =>
      addProblemPattern(session?.accessToken, problemId, patternId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems", problemId] })
      qc.invalidateQueries({ queryKey: ["problems"] })
    },
  })
}

export function useRemovePattern(problemId: number) {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patternId: number) =>
      removeProblemPattern(session?.accessToken, problemId, patternId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems", problemId] })
      qc.invalidateQueries({ queryKey: ["problems"] })
    },
  })
}

export function useAddRelatedProblem(problemId: number) {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (relatedId: number) =>
      addRelatedProblem(session?.accessToken, problemId, relatedId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems", problemId] })
      qc.invalidateQueries({ queryKey: ["problems"] })
    },
  })
}
