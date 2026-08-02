"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/auth-provider"
import {
  addProblemPattern,
  addProblemTopic,
  addRelatedProblem,
  createPattern,
  createProblem,
  createTopic,
  deleteProblem,
  getPatterns,
  getProblem,
  getProblemRefs,
  getProblems,
  getTopics,
  removeProblemPattern,
  removeProblemTopics,
  updateProblemAiReview,
  updateProblemStatus,
} from "@/lib/api"
import type {
  CreateProblemRequest,
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
  const { session } = useAuth()
  const normalized = useMemo(() => normalizeFilters(filters), [filters])

  return useQuery({
    // The access token is deliberately NOT part of the key. It rotates on
    // refresh, which would change every key and throw away the whole cache.
    queryKey: [
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
    queryFn: () => getProblems(session?.accessToken, normalized),
    enabled: !!session?.accessToken,
    placeholderData: (previousData) => previousData,
  })
}

/** Map of leetcodeId → problemId for everything the user already owns. */
export function useProblemRefs() {
  const { session } = useAuth()
  const query = useQuery({
    queryKey: ["problems", "refs"],
    queryFn: () => getProblemRefs(session?.accessToken),
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  })

  return useMemo(
    () => new Map((query.data ?? []).map((ref) => [ref.leetcodeId, ref.id])),
    [query.data],
  )
}

export function useProblem(id: number) {
  const { session } = useAuth()
  return useQuery({
    queryKey: ["problems", id],
    queryFn: () => getProblem(session?.accessToken, id),
    enabled: !!session?.accessToken && !!id,
  })
}

export function useTopics() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ["topics"],
    queryFn: () => getTopics(session?.accessToken),
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePatterns() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ["patterns"],
    queryFn: () => getPatterns(session?.accessToken),
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateProblem() {
  const { session } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProblemRequest) =>
      createProblem(session?.accessToken, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] })
      qc.invalidateQueries({ queryKey: ["lists"] })
    },
  })
}

export function useDeleteProblem() {
  const { session } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (problemId: number) => deleteProblem(session?.accessToken, problemId),
    onSuccess: (_, problemId) => {
      qc.removeQueries({ queryKey: ["problems", problemId] })
      qc.invalidateQueries({ queryKey: ["problems"] })
      qc.invalidateQueries({ queryKey: ["lists"] })
      qc.invalidateQueries({ queryKey: ["stats"] })
      qc.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

export function useCreateTopic() {
  const { session } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; description?: string }) =>
      createTopic(session?.accessToken, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  })
}

export function useCreatePattern() {
  const { session } = useAuth()
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
  const { session } = useAuth()
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

export function useUpdateProblemAiReview(problemId: number) {
  const { session } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (aiReview: string | null) =>
      updateProblemAiReview(session?.accessToken, problemId, { aiReview }),
    onSuccess: (updatedProblem) => {
      qc.setQueryData<ProblemDetailDto | undefined>(
        ["problems", problemId],
        (current) => current ? { ...current, aiReview: updatedProblem.aiReview } : current,
      )
      qc.invalidateQueries({ queryKey: ["problems", problemId] })
    },
  })
}

export function useAddTopic(problemId: number) {
  const { session } = useAuth()
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
  const { session } = useAuth()
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
  const { session } = useAuth()
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
  const { session } = useAuth()
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
  const { session } = useAuth()
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
