"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { createNote, deleteNote, getNote, getNotes, updateNote } from "@/lib/api"
import type {
  CreateNoteRequest,
  NoteFilters,
  UpdateNoteRequest,
} from "@/lib/types"

export function useNotes(filters?: NoteFilters) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["notes", filters],
    queryFn: () => getNotes(session?.accessToken, filters),
    enabled: !!session?.accessToken,
  })
}

export function useNote(id: number) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["notes", id],
    queryFn: () => getNote(session?.accessToken, id),
    enabled: !!session?.accessToken && !!id,
  })
}

export function useCreateNote() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateNoteRequest) =>
      createNote(session?.accessToken, body),
    onSuccess: (note) => {
      qc.setQueryData(["notes", note.id], note)
      qc.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

export function useUpdateNote() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateNoteRequest }) =>
      updateNote(session?.accessToken, id, body),
    onSuccess: (note) => {
      qc.setQueryData(["notes", note.id], note)
      qc.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

export function useDeleteNote() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteNote(session?.accessToken, id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: ["notes", id] })
      qc.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}
