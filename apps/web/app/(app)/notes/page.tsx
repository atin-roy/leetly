"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NoteEditorDialog } from "@/components/notes/note-editor-dialog"
import type { NoteDto, NoteFilters, NoteTag } from "@/lib/types"

const TAG_COLORS: Record<NoteTag, string> = {
  GENERAL: "bg-gray-100 text-gray-700",
  INTERVIEW: "bg-blue-100 text-blue-700",
  LEARNING: "bg-green-100 text-green-700",
  REVIEW: "bg-orange-100 text-orange-700",
  STRATEGY: "bg-purple-100 text-purple-700",
}

const TAGS: { value: NoteTag; label: string }[] = [
  { value: "GENERAL", label: "General" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "LEARNING", label: "Learning" },
  { value: "REVIEW", label: "Review" },
  { value: "STRATEGY", label: "Strategy" },
]

// TODO: replace with real data from useNotes()
const DUMMY_NOTES: NoteDto[] = [
  {
    id: 1,
    problemId: null,
    dateTime: "2026-02-20T10:30:00",
    tag: "LEARNING",
    title: "Two Pointers Pattern",
    content: `# Two Pointers

A technique where two pointers iterate through a data structure, usually from opposite ends or at different speeds.

## When to use
- Sorted arrays or strings
- Finding pairs that satisfy a condition
- Removing duplicates in-place

## Template
\`\`\`python
def two_pointers(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        if condition(arr[left], arr[right]):
            left += 1
            right -= 1
        elif needs_increment:
            left += 1
        else:
            right -= 1
\`\`\`

## Key Problems
- Two Sum II (sorted)
- 3Sum
- Container With Most Water
- Trapping Rain Water`,
  },
  {
    id: 2,
    problemId: null,
    dateTime: "2026-02-18T14:00:00",
    tag: "LEARNING",
    title: "Sliding Window Cheatsheet",
    content: `# Sliding Window

Use when you need to find a subarray/substring satisfying some constraint.

## Fixed-size window
\`\`\`python
for i in range(len(arr)):
    window.add(arr[i])
    if len(window) > k:
        window.remove(arr[i - k])
    if len(window) == k:
        # update answer
\`\`\`

## Variable-size window (shrink when invalid)
\`\`\`python
left = 0
for right in range(len(arr)):
    window.add(arr[right])
    while not valid(window):
        window.remove(arr[left])
        left += 1
    # update answer
\`\`\`

## Key Problems
- Minimum Window Substring *(hard)*
- Longest Repeating Character Replacement
- Fruit Into Baskets`,
  },
  {
    id: 3,
    problemId: null,
    dateTime: "2026-02-15T09:00:00",
    tag: "INTERVIEW",
    title: "Behavioral Interview Prep",
    content: `# Behavioral Interview Notes

## STAR Format
**S**ituation → **T**ask → **A**ction → **R**esult

## Common Questions

### Tell me about a challenge you overcame
- Situation: Legacy codebase with no tests, tight deadline
- Task: Add new feature without breaking existing functionality
- Action: Wrote characterization tests first, then refactored incrementally
- Result: Shipped on time with 0 regressions

### Conflict with a teammate
Focus on: curiosity over judgment, data-driven resolution

## Things to Remember
- Ask clarifying questions before diving into code
- Think out loud — interviewers want to see your process
- Discuss tradeoffs, don't just pick the first answer
- State time/space complexity after every solution`,
  },
  {
    id: 4,
    problemId: null,
    dateTime: "2026-02-17T20:00:00",
    tag: "REVIEW",
    title: "Weekly Review — Feb 17",
    content: `# Weekly Review

## What went well
- Solved 8 problems this week (goal was 7)
- First attempt solve on **Coin Change** — bottom-up DP finally clicked
- Reduced avg solve time from ~45 min → ~35 min

## What didn't go well
- Still struggling with graph problems (BFS/DFS traversal order)
- Got stuck on Minimum Window Substring for 90+ minutes

## Plan for next week
- [ ] Complete 3 graph problems (BFS focus)
- [ ] Re-do Minimum Window Substring without hints
- [ ] Review backtracking template
- [ ] Do 1 timed mock interview`,
  },
  {
    id: 5,
    problemId: null,
    dateTime: "2026-02-10T11:00:00",
    tag: "STRATEGY",
    title: "Problem-Solving Framework",
    content: `# My Problem-Solving Framework

## Step 1: Clarify (2 min)
- What are the constraints? (array size, value range)
- Edge cases: empty input, single element, duplicates?
- Can I modify the input in-place?

## Step 2: Explore examples (2 min)
- Walk through the given example manually
- Create a simple custom example
- Try to spot the pattern

## Step 3: Brute force first (2 min)
State the naive solution and its complexity — shows you understand the problem.

## Step 4: Optimize (10 min)
Common optimizations to consider:
- **Hash map** — O(1) lookups
- **Sorting** — enables two pointers / binary search
- **Prefix sums** — subarray sums in O(1)
- **Monotonic stack** — next greater/smaller element

## Step 5: Code (15 min)
- Write clean code with meaningful variable names
- Don't optimize prematurely

## Step 6: Test (5 min)
- Walk through your own example
- Check all edge cases`,
  },
  {
    id: 6,
    problemId: null,
    dateTime: "2026-02-05T16:30:00",
    tag: "GENERAL",
    title: "Binary Search Template",
    content: `# Binary Search

> Use when the input is sorted or when the search space can be made monotonic.

## Standard template
\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2  # avoids overflow
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\`

## Find leftmost position
\`\`\`python
left, right = 0, len(arr)
while left < right:
    mid = (left + right) // 2
    if arr[mid] < target:
        left = mid + 1
    else:
        right = mid
return left
\`\`\`

## Key insight
Binary search works on any **monotonic** function, not just sorted arrays.
Ask yourself: *"Can I binary search the answer?"*`,
  },
]

const PAGE_SIZE = 20
const DEFAULT_FILTERS: NoteFilters = { page: 0, size: PAGE_SIZE }

function NoteCard({
  note,
  onClick,
  onEdit,
  onDelete,
}: {
  note: NoteDto
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{note.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={TAG_COLORS[note.tag]}>
                {note.tag}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(note.dateTime), "MMM d, yyyy")}
              </span>
            </div>
          </div>
          <div
            className="flex shrink-0 items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
          {note.content}
        </p>
      </CardContent>
    </Card>
  )
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteDto[]>(DUMMY_NOTES)
  const [filters, setFilters] = useState<NoteFilters>(DEFAULT_FILTERS)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<NoteDto | undefined>()
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view")

  function handleChange(partial: Partial<NoteFilters>) {
    setFilters((f) => ({ ...f, ...partial }))
  }

  function handleView(note: NoteDto) {
    setSelectedNote(note)
    setDialogMode("view")
    setFormOpen(true)
  }

  function handleEdit(note: NoteDto) {
    setSelectedNote(note)
    setDialogMode("edit")
    setFormOpen(true)
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this note?")) return
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  // TODO: replace with server-side filtering from useNotes()
  const filtered = notes.filter((n) => {
    if (filters.tag && n.tag !== filters.tag) return false
    return true
  })

  const page = filters.page ?? 0
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSave({ tag, title, content }: { tag: NoteTag; title: string; content: string }) {
    if (selectedNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNote.id ? { ...n, tag, title, content } : n
        )
      )
    } else {
      setNotes((prev) => [
        {
          id: Date.now(),
          problemId: null,
          dateTime: new Date().toISOString(),
          tag,
          title,
          content,
        },
        ...prev,
      ])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
        <Button
          size="sm"
          onClick={() => {
            setSelectedNote(undefined)
            setFormOpen(true)
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={filters.tag ?? "all"}
          onValueChange={(v) =>
            handleChange({ tag: v === "all" ? undefined : (v as NoteTag), page: 0 })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {TAGS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {paged.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onClick={() => handleView(note)}
            onEdit={() => handleEdit(note)}
            onDelete={() => handleDelete(note.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => handleChange({ page: page - 1 })}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => handleChange({ page: page + 1 })}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <NoteEditorDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        note={selectedNote}
        initialMode={dialogMode}
        onSave={handleSave}
      />
    </div>
  )
}
