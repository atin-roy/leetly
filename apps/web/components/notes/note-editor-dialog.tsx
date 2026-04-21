"use client"

import { useState } from "react"
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownContent } from "@/components/ui/markdown-content"
import type { NoteDto, NoteTag } from "@/lib/types"

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

// Shared dialog dimensions — both modes use the same fixed size
const DIALOG_SIZE = "sm:max-w-5xl h-[85vh] flex flex-col overflow-hidden"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: NoteDto
  initialMode?: "view" | "edit"
  defaultTitle?: string
  onSave: (values: { tag: NoteTag; title: string; content: string }) => void
  onDelete?: () => void
  isDeleting?: boolean
}

export function NoteEditorDialog({
  open,
  onOpenChange,
  note,
  initialMode,
  defaultTitle,
  onSave,
  onDelete,
  isDeleting,
}: Props) {
  const dialogKey = note
    ? `note-${note.id}-${initialMode ?? "view"}`
    : `new-${defaultTitle ?? ""}-${initialMode ?? "edit"}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <NoteEditorDialogBody
          key={dialogKey}
          note={note}
          initialMode={initialMode}
          defaultTitle={defaultTitle}
          onOpenChange={onOpenChange}
          onSave={onSave}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ) : null}
    </Dialog>
  )
}

function NoteEditorDialogBody({
  note,
  initialMode,
  defaultTitle,
  onOpenChange,
  onSave,
  onDelete,
  isDeleting,
}: Omit<Props, "open">) {
  const [mode, setMode] = useState<"view" | "edit">(
    note ? (initialMode ?? "view") : "edit"
  )
  const [tag, setTag] = useState<NoteTag>(note?.tag ?? "GENERAL")
  const [title, setTitle] = useState(note?.title ?? defaultTitle ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [showPreview, setShowPreview] = useState(true)

  function handleSave() {
    if (!title.trim() || !content.trim()) return
    onSave({ tag, title, content })
    if (note) {
      setMode("view")
    } else {
      onOpenChange(false)
    }
  }

  // ── View mode ──────────────────────────────────────────────────────────────
  if (mode === "view") {
    return (
      <DialogContent className={cn(DIALOG_SIZE, "gap-0 p-0")}>
        {/* Fixed header */}
        <div className="shrink-0 flex items-start justify-between gap-4 border-b pl-6 pr-14 py-5">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold leading-snug">{title}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={TAG_COLORS[tag]}>
                {tag}
              </Badge>
              {note?.dateTime && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(note.dateTime), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {note && onDelete ? (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={onDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setMode("edit")}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </div>

        {/* Scrollable body — fills remaining height */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 text-sm">
          <MarkdownContent content={content} />
        </div>
      </DialogContent>
    )
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  return (
    <DialogContent className={DIALOG_SIZE}>
      {/* Fixed header */}
      <DialogHeader className="shrink-0">
        <DialogTitle>{note ? "Edit Note" : "New Note"}</DialogTitle>
      </DialogHeader>

      {/* Flex column that fills remaining height */}
      <div className="flex flex-col flex-1 min-h-0 gap-3">
        {/* Title + Tag — fixed */}
        <div className="shrink-0 flex gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tag</Label>
            <Select value={tag} onValueChange={(v) => setTag(v as NoteTag)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAGS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toolbar — fixed */}
        <div className="shrink-0 flex items-center justify-between border-b pb-2">
          <span className="text-xs text-muted-foreground">Markdown source</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? (
              <>
                <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Show Preview
              </>
            )}
          </Button>
        </div>

        {/* Editor / Split view — fills remaining height */}
        <div
          className={cn(
            "grid gap-3 flex-1 min-h-0",
            showPreview ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note in markdown..."
            className="h-full resize-none font-mono text-sm"
          />
          {showPreview && (
            <div className="h-full overflow-y-auto rounded-md border bg-muted/30 p-4 text-sm">
              {content.trim() ? (
                <MarkdownContent content={content} />
              ) : (
                <p className="text-sm italic text-muted-foreground/50">
                  Preview will appear here...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer — fixed */}
        <div className="shrink-0 flex items-center justify-between gap-2 border-t pt-3">
          <div>
            {note && onDelete ? (
              <Button
                type="button"
                variant="outline"
                className="text-destructive"
                onClick={onDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => (note ? setMode("view") : onOpenChange(false))}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || isDeleting}
          >
            {note ? "Save" : "Create"}
          </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
