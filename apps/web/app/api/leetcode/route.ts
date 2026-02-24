import { NextRequest, NextResponse } from "next/server"

const DIFFICULTY_MAP: Record<number, string> = { 1: "EASY", 2: "MEDIUM", 3: "HARD" }

type LeetCodeProblem = {
  stat: {
    frontend_question_id: number
    question__title: string
    question__title_slug: string
  }
  difficulty: { level: number }
}

async function fetchAllProblems(): Promise<LeetCodeProblem[]> {
  const res = await fetch("https://leetcode.com/api/problems/algorithms/", {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error("LeetCode API unavailable")
  const data = await res.json()
  return data.stat_status_pairs
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const id = searchParams.get("id")
  const slug = searchParams.get("slug")

  if (!id && !slug) {
    return NextResponse.json({ error: "Provide id or slug" }, { status: 400 })
  }

  try {
    const problems = await fetchAllProblems()
    const match = id
      ? problems.find((p) => p.stat.frontend_question_id === Number(id))
      : problems.find((p) => p.stat.question__title_slug === slug)

    if (!match) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    return NextResponse.json({
      leetcodeId: match.stat.frontend_question_id,
      title: match.stat.question__title,
      difficulty: DIFFICULTY_MAP[match.difficulty.level] ?? "MEDIUM",
      url: `https://leetcode.com/problems/${match.stat.question__title_slug}/`,
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch from LeetCode" }, { status: 502 })
  }
}
