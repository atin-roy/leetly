"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getNotes, getProblem } from "@/lib/api"
import { formatProblemForClipboard } from "@/lib/problem-export"
import type { NoteDto, ProblemDetailDto } from "@/lib/types"

interface Props {
  problemId: number
  problem?: ProblemDetailDto
  notes?: NoteDto[]
  size?: "sm" | "default" | "icon"
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
  className?: string
  showText?: boolean
  label?: string
  title?: string
}

export function CopyProblemButton({
  problemId,
  problem,
  notes,
  size = "sm",
  variant = "ghost",
  className,
  showText = true,
  label = "Copy for AI",
  title = "Copy full problem details for AI",
}: Props) {
  const { data: session } = useSession()
  const [isCopying, setIsCopying] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (isCopying) return

    setIsCopying(true)
    try {
      const problemDetail = problem ?? await getProblem(session?.accessToken, problemId)
      const problemNotes = notes ?? (await getNotes(session?.accessToken, { problemId })).content
      const payload = formatProblemForClipboard(problemDetail, problemNotes)

      await navigator.clipboard.writeText(payload)
      setCopied(true)
      toast.success("Problem details copied")
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy problem details")
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={isCopying}
      data-interactive="true"
      className={className}
      title={title}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {showText ? <span>{copied ? "Copied" : isCopying ? "Copying..." : label}</span> : null}
    </Button>
  )
}
