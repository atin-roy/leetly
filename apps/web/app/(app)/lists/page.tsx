"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
  DialogTrigger,
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
import { Skeleton } from "@/components/ui/skeleton"
import { ListCard } from "@/components/lists/list-card"
import { useCreateList, useProblemLists } from "@/hooks/use-lists"
import type { ProblemListDto } from "@/lib/types"

// TODO: remove dummy data once backend is connected
const DUMMY_LISTS: ProblemListDto[] = [
  {
    id: 1,
    name: "All Problems",
    isDefault: true,
    problems: Array.from({ length: 47 }, (_, i) => ({
      id: i + 1,
      leetcodeId: i + 1,
      title: `Problem ${i + 1}`,
      url: `https://leetcode.com/problems/problem-${i + 1}`,
      difficulty: (["EASY", "MEDIUM", "HARD"] as const)[i % 3],
      status: (["SOLVED", "ATTEMPTED", "UNSEEN"] as const)[i % 3],
    })),
  },
  {
    id: 2,
    name: "Blind 75",
    isDefault: false,
    problems: Array.from({ length: 75 }, (_, i) => ({
      id: i + 100,
      leetcodeId: i + 100,
      title: `Problem ${i + 100}`,
      url: `https://leetcode.com/problems/problem-${i + 100}`,
      difficulty: (["EASY", "MEDIUM", "HARD"] as const)[i % 3],
      status: "UNSEEN" as const,
    })),
  },
  {
    id: 3,
    name: "Graph Practice",
    isDefault: false,
    problems: Array.from({ length: 12 }, (_, i) => ({
      id: i + 200,
      leetcodeId: i + 200,
      title: `Graph Problem ${i + 1}`,
      url: `https://leetcode.com/problems/graph-${i + 1}`,
      difficulty: (["MEDIUM", "HARD"] as const)[i % 2],
      status: (["SOLVED_WITH_HELP", "ATTEMPTED"] as const)[i % 2],
    })),
  },
  {
    id: 4,
    name: "Dynamic Programming",
    isDefault: false,
    problems: [],
  },
]

const schema = z.object({ name: z.string().min(1, "Name is required") })

export default function ListsPage() {
  const { data: listsData, isLoading } = useProblemLists()
  const lists = listsData ?? DUMMY_LISTS
  const createMutation = useCreateList()
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  })

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await createMutation.mutateAsync(values)
      toast.success("List created")
      form.reset()
      setOpen(false)
    } catch {
      toast.error("Failed to create list")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Lists</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create List</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="My favorite problems" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    Create
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !lists?.length ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No lists yet. Create one!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  )
}
