import type { Difficulty } from "./types"

export interface FetchedProblem {
  leetcodeId: number
  title: string
  difficulty: Difficulty
  url: string
}

export function parseProblemInput(input: string): { param: "id" | "slug"; value: string } | null {
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) return { param: "id", value: trimmed }
  const match = trimmed.match(/leetcode\.com\/problems\/([\w-]+)/i)
  if (match) return { param: "slug", value: match[1] }
  return null
}

export async function fetchLeetCodeProblem(input: string): Promise<FetchedProblem> {
  const parsed = parseProblemInput(input)
  if (!parsed) throw new Error("Enter a valid problem number or LeetCode URL")

  const res = await fetch(`/api/leetcode?${parsed.param}=${parsed.value}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? "Failed to fetch problem")
  return data
}
