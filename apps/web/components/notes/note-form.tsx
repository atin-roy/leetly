"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateNote, useUpdateNote } from "@/hooks/use-notes"
import type { NoteDto, NoteTag } from "@/lib/types"

const TAGS: { value: NoteTag; label: string }[] = [
  { value: "GENERAL", label: "General" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "LEARNING", label: "Learning" },
  { value: "REVIEW", label: "Review" },
  { value: "STRATEGY", label: "Strategy" },
]

const schema = z.object({
  tag: z.enum(["GENERAL", "INTERVIEW", "LEARNING", "REVIEW", "STRATEGY"]),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: NoteDto
}

export function NoteForm({ open, onOpenChange, note }: Props) {
  const isEdit = !!note
  const createMutation = useCreateNote()
  const updateMutation = useUpdateNote()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tag: "GENERAL", title: "", content: "" },
  })

  useEffect(() => {
    if (note) {
      form.reset({ tag: note.tag, title: note.title, content: note.content })
    } else {
      form.reset({ tag: "GENERAL", title: "", content: "" })
    }
  }, [note, form])

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: note!.id, body: values })
        toast.success("Note updated")
      } else {
        await createMutation.mutateAsync(values)
        toast.success("Note created")
      }
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? "Failed to update note" : "Failed to create note")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Note" : "New Note"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TAGS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Note title..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={6}
                      placeholder="Write your note here..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
