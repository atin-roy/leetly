"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  addProblemToList,
  createProblemList,
  deleteProblemList,
  getProblemList,
  getProblemLists,
  removeProblemFromList,
} from "@/lib/api"
import type { CreateListRequest } from "@/lib/types"

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
    onSuccess: (_data, { listId }) =>
      qc.invalidateQueries({ queryKey: ["lists", listId] }),
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
    onSuccess: (_data, { listId }) =>
      qc.invalidateQueries({ queryKey: ["lists", listId] }),
  })
}
