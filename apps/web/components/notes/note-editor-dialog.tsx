"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, Pencil } from "lucide-react"
import { format } from "date-fns"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
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

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-3 text-xl font-bold">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 mt-4 text-lg font-semibold">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1.5 mt-3 text-base font-semibold">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mb-2 leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 list-disc space-y-0.5 pl-5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 list-decimal space-y-0.5 pl-5">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-muted-foreground/30 pl-3 italic text-muted-foreground">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        hr: () => <hr className="my-3 border-border" />,
        pre: ({ children }) => <>{children}</>,
        code: ({ className, children }) => {
          const text = String(children).trimEnd()
          const isBlock = text.includes("\n") || !!className
          if (isBlock) {
            return (
              <pre className="my-2 overflow-x-auto rounded-md bg-muted p-3">
                <code
                  className={cn(
                    "block font-mono text-xs leading-relaxed",
                    className
                  )}
                >
                  {text}
                </code>
              </pre>
            )
          }
          return (
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// Shared dialog dimensions — both modes use the same fixed size
const DIALOG_SIZE = "sm:max-w-5xl h-[85vh] flex flex-col overflow-hidden"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: NoteDto
  initialMode?: "view" | "edit"
  onSave: (values: { tag: NoteTag; title: string; content: string }) => void
}

export function NoteEditorDialog({
  open,
  onOpenChange,
  note,
  initialMode,
  onSave,
}: Props) {
  const [mode, setMode] = useState<"view" | "edit">(
    note ? (initialMode ?? "view") : "edit"
  )
  const [tag, setTag] = useState<NoteTag>(note?.tag ?? "GENERAL")
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    if (open) {
      setMode(note ? (initialMode ?? "view") : "edit")
      setTag(note?.tag ?? "GENERAL")
      setTitle(note?.title ?? "")
      setContent(note?.content ?? "")
      setShowPreview(true)
    }
  }, [open, note, initialMode])

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
      <Dialog open={open} onOpenChange={onOpenChange}>
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

          {/* Scrollable body — fills remaining height */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 text-sm">
            <MarkdownRenderer content={content} />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-sm italic text-muted-foreground/50">
                    Preview will appear here...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer — fixed */}
          <div className="shrink-0 flex justify-end gap-2 border-t pt-3">
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
              disabled={!title.trim() || !content.trim()}
            >
              {note ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
