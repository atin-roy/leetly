"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowRight, CheckCircle2, ExternalLink, Loader2, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import tones from "@/components/ui/tone.module.css"
import { cn } from "@/lib/utils"
import { fetchLeetCodeProblem, parseProblemInput, type FetchedProblem } from "@/lib/leetcode"
import { DifficultyBadge } from "./difficulty-badge"
import type { CreateProblemRequest, ProblemSummaryDto } from "@/lib/types"
import styles from "./add-problem-dialog.module.css"

interface Props {
  onAdd: (problem: CreateProblemRequest) => Promise<ProblemSummaryDto>
  /** Maps leetcodeId → internal problem id for duplicate detection */
  existingProblems: Map<number, number>
  triggerLabel?: string
  title?: string
  submitLabel?: string
}

export function AddProblemDialog({
  onAdd,
  existingProblems,
  triggerLabel = "New Problem",
  title = "Track a Problem",
  submitLabel = "Add to All Problems",
}: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"form" | "adding" | "added">("form")
  const [input, setInput] = useState("")
  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "fetched" | "error">("idle")
  const [preview, setPreview] = useState<FetchedProblem | null>(null)
  const [added, setAdded] = useState<ProblemSummaryDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function resetForm() {
    setInput("")
    setFetchStatus("idle")
    setPreview(null)
    setError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  function resetAll() {
    resetForm()
    setStep("form")
    setAdded(null)
  }

  function handleInputChange(value: string) {
    setInput(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim() || !parseProblemInput(value)) {
      setFetchStatus("idle")
      setPreview(null)
      setError(null)
      return
    }

    setFetchStatus("loading")
    setPreview(null)
    setError(null)

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await fetchLeetCodeProblem(value)
        setPreview(result)
        setFetchStatus("fetched")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch problem")
        setFetchStatus("error")
      }
    }, 500)
  }

  const duplicateId = preview ? existingProblems.get(preview.leetcodeId) : undefined
  const isDuplicate = duplicateId !== undefined

  async function handleAdd() {
    if (!preview || isDuplicate) return
    setStep("adding")
    try {
      const created = await onAdd(preview)
      setAdded(created)
      setStep("added")
    } catch {
      setError("Failed to add problem")
      setStep("form")
    }
  }

  function handleTrackAnother() {
    resetForm()
    setAdded(null)
    setStep("form")
  }

  function handleClose() {
    setOpen(false)
    resetAll()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetAll() }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {step !== "added" ? (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>

            <div className={styles.body}>
              <div className={styles.field}>
                <Label htmlFor="problem-input">LeetCode number or URL</Label>
                <div className={styles.inputWrap}>
                  <Input
                    id="problem-input"
                    placeholder="e.g. 42 or leetcode.com/problems/two-sum/"
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className={fetchStatus === "loading" ? styles.inputLoading : undefined}
                  />
                  {fetchStatus === "loading" && <Loader2 size={16} className={styles.spinner} />}
                </div>
                {error && <p className={styles.error}>{error}</p>}
              </div>

              {preview && (
                isDuplicate ? (
                  <div className={cn(styles.duplicate, tones.tone, tones.amber)}>
                    <div className={styles.duplicateHead}>
                      <AlertCircle size={16} className={styles.duplicateIcon} />
                      <div>
                        <p className={styles.duplicateTitle}>Already in your list</p>
                        <p className={styles.duplicateNote}>
                          You&apos;re already tracking{" "}
                          <span className={styles.duplicateStrong}>{preview.title}</span>
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className={styles.duplicateAction} onClick={handleClose}>
                      <Link href={`/problems/${duplicateId}`}>
                        <ArrowRight size={14} />
                        Go to problem
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className={styles.preview}>
                    <div className={styles.previewHead}>
                      <div>
                        <p className={styles.previewId}>#{preview.leetcodeId}</p>
                        <p className={styles.previewTitle}>{preview.title}</p>
                      </div>
                      <DifficultyBadge difficulty={preview.difficulty} />
                    </div>
                    <a href={preview.url} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                      <ExternalLink size={12} />
                      View on LeetCode
                    </a>
                  </div>
                )
              )}

              <div className={styles.actions}>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={!preview || isDuplicate || step === "adding"}>
                  {step === "adding" ? <><Loader2 size={16} className={styles.buttonSpinner} />Adding…</> : submitLabel}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Problem Added</DialogTitle>
            </DialogHeader>

            <div className={styles.addedBody}>
              <div className={styles.addedCard}>
                <CheckCircle2 size={20} className={styles.addedIcon} />
                <div className={styles.addedText}>
                  <p className={styles.addedTitle}>{added?.title}</p>
                  <p className={styles.addedMeta}>
                    #{added?.leetcodeId} &middot; {added?.difficulty}
                  </p>
                </div>
              </div>

              <div className={styles.addedActions}>
                <Button asChild>
                  <Link href={`/problems/${added?.id}`} onClick={handleClose}>
                    <ArrowRight size={16} />
                    Open Problem
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleTrackAnother}>
                  <RotateCcw size={16} />
                  Track Another
                </Button>
                <Button variant="ghost" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
