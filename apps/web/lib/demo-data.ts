export type DemoSession = {
  name: string
  email: string
  role: string
  focus: string
  streak: number
  avatarFallback: string
}

export type DemoMetric = {
  label: string
  value: string
  change: string
  tone?: "neutral" | "positive" | "warning"
}

export type DemoChartPoint = {
  label: string
  value: number
}

export type DemoActivityDay = {
  day: string
  count: number
}

export type DemoDashboard = {
  hero: {
    eyebrow: string
    title: string
    description: string
    kicker: string
  }
  metricStrip: DemoMetric[]
  weeklyVelocity: DemoChartPoint[]
  patternFocus: DemoChartPoint[]
  insightCards: Array<{
    title: string
    eyebrow: string
    body: string
    footnote: string
  }>
  activity: DemoActivityDay[]
  timeline: Array<{
    label: string
    title: string
    body: string
  }>
}

export type DemoProblem = {
  id: number
  leetcodeId: number
  title: string
  slug: string
  difficulty: "Easy" | "Medium" | "Hard"
  status: "Unseen" | "Attempted" | "Solved" | "Mastered"
  pattern: string
  topic: string
  language: string
  lastTouched: string
  nextReview: string
  timeToSolve: string
  noteCount: number
  inReview: boolean
  listIds: number[]
}

export type DemoProblemDetail = DemoProblem & {
  summary: string
  brief: string
  tags: string[]
  relatedProblemIds: number[]
  notes: Array<{
    id: number
    title: string
    tag: string
    excerpt: string
  }>
  attempts: Array<{
    id: number
    label: string
    date: string
    outcome: string
    duration: string
    language: string
    insight: string
    mistakes: string[]
  }>
}

export type DemoReviewItem = {
  id: number
  problemId: number
  title: string
  dueLabel: string
  difficulty: DemoProblem["difficulty"]
  pattern: string
  reason: string
  interval: string
}

export type DemoList = {
  id: number
  name: string
  subtitle: string
  description: string
  gradient: string
  problemIds: number[]
  cadence: string
}

export type DemoNote = {
  id: number
  title: string
  tag: "Learning" | "Review" | "Interview" | "Strategy"
  date: string
  problemId?: number
  excerpt: string
}

export type DemoAccountSettings = {
  headline: string
  bio: string
  location: string
  timezone: string
  preferredLanguage: string
  dailyGoal: string
  reviewCadence: string
  publishing: Array<{
    label: string
    value: string
  }>
}

export const demoSession: DemoSession = {
  name: "Atin Roy",
  email: "atin@leetly.demo",
  role: "Editorial Tech Demo",
  focus: "Graphs + DP refinement",
  streak: 17,
  avatarFallback: "AR",
}

const demoProblems: DemoProblemDetail[] = [
  {
    id: 101,
    leetcodeId: 146,
    title: "LRU Cache",
    slug: "lru-cache",
    difficulty: "Medium",
    status: "Mastered",
    pattern: "Design",
    topic: "Hash Map",
    language: "TypeScript",
    lastTouched: "2h ago",
    nextReview: "Today, 18:40",
    timeToSolve: "42 min",
    noteCount: 2,
    inReview: true,
    listIds: [1, 3],
    summary:
      "A cache design problem that now acts as a confidence anchor for interface-heavy implementations.",
    brief:
      "You corrected an eviction bug by separating recency mutation from capacity checks and made the linked-list transitions explicit.",
    tags: ["system design", "hash map", "doubly linked list", "review-ready"],
    relatedProblemIds: [102, 105],
    notes: [
      {
        id: 1,
        title: "Eviction order",
        tag: "Review",
        excerpt:
          "Never evict before the latest write is committed. Update recency first, then prune from tail.",
      },
      {
        id: 2,
        title: "Interview framing",
        tag: "Interview",
        excerpt:
          "Lead with O(1) target constraints, then explain why map + linked list is the minimal composition.",
      },
    ],
    attempts: [
      {
        id: 1,
        label: "Attempt 03",
        date: "Apr 2, 2026",
        outcome: "Accepted",
        duration: "42 min",
        language: "TypeScript",
        insight: "Solved cleanly after writing node movement helpers first.",
        mistakes: ["Overcomplicated insert path", "Forgot existing-key refresh"],
      },
      {
        id: 2,
        label: "Attempt 02",
        date: "Mar 21, 2026",
        outcome: "Wrong Answer",
        duration: "31 min",
        language: "TypeScript",
        insight: "Tail pointer drifted after deleting the oldest node.",
        mistakes: ["Pointer bookkeeping", "State mutation order"],
      },
    ],
  },
  {
    id: 102,
    leetcodeId: 76,
    title: "Minimum Window Substring",
    slug: "minimum-window-substring",
    difficulty: "Hard",
    status: "Solved",
    pattern: "Sliding Window",
    topic: "String",
    language: "Python",
    lastTouched: "Yesterday",
    nextReview: "Tomorrow, 09:10",
    timeToSolve: "58 min",
    noteCount: 1,
    inReview: true,
    listIds: [1, 2],
    summary:
      "A high-value hard problem where your reasoning is good, but state accounting still gets brittle under pressure.",
    brief:
      "The current solve is acceptable. The next step is to make the matched-count invariant feel automatic instead of improvised.",
    tags: ["window invariant", "frequency maps", "hard-set"],
    relatedProblemIds: [101, 106],
    notes: [
      {
        id: 3,
        title: "Matched chars invariant",
        tag: "Learning",
        excerpt:
          "Track satisfied distinct requirements, not raw matched characters, or the shrink loop becomes noisy.",
      },
    ],
    attempts: [
      {
        id: 3,
        label: "Attempt 02",
        date: "Apr 1, 2026",
        outcome: "Accepted",
        duration: "58 min",
        language: "Python",
        insight: "Reframed the problem around a single validity invariant and finished the shrink loop faster.",
        mistakes: ["Window shrink timing"],
      },
    ],
  },
  {
    id: 103,
    leetcodeId: 200,
    title: "Number of Islands",
    slug: "number-of-islands",
    difficulty: "Medium",
    status: "Solved",
    pattern: "Graph Traversal",
    topic: "Graph",
    language: "Java",
    lastTouched: "3d ago",
    nextReview: "In 3 days",
    timeToSolve: "24 min",
    noteCount: 1,
    inReview: true,
    listIds: [2],
    summary:
      "Reliable BFS/DFS execution problem used here as a warm-up benchmark before harder graph work.",
    brief:
      "You now choose traversal style intentionally based on recursion risk rather than habit.",
    tags: ["bfs", "dfs", "matrix graph"],
    relatedProblemIds: [106, 107],
    notes: [
      {
        id: 4,
        title: "Traversal choice",
        tag: "Strategy",
        excerpt:
          "Iterative BFS is cleaner in interviews when the grid can be large and recursion depth is a talking point.",
      },
    ],
    attempts: [
      {
        id: 4,
        label: "Attempt 01",
        date: "Mar 31, 2026",
        outcome: "Accepted",
        duration: "24 min",
        language: "Java",
        insight: "Used BFS and narrated visited marking clearly.",
        mistakes: [],
      },
    ],
  },
  {
    id: 104,
    leetcodeId: 300,
    title: "Longest Increasing Subsequence",
    slug: "longest-increasing-subsequence",
    difficulty: "Medium",
    status: "Attempted",
    pattern: "Dynamic Programming",
    topic: "DP",
    language: "TypeScript",
    lastTouched: "Today",
    nextReview: "Today, 21:00",
    timeToSolve: "67 min",
    noteCount: 2,
    inReview: true,
    listIds: [3],
    summary:
      "Still unstable when moving from quadratic DP reasoning to patience sorting intuition.",
    brief:
      "The redesign uses this as the canonical 'needs editorial compression' case study.",
    tags: ["dp", "binary search", "active review"],
    relatedProblemIds: [105, 108],
    notes: [
      {
        id: 5,
        title: "Two valid narratives",
        tag: "Learning",
        excerpt:
          "Keep the O(n^2) DP explanation ready even if you implement the O(n log n) version.",
      },
      {
        id: 6,
        title: "Binary search edge",
        tag: "Review",
        excerpt:
          "Replace the first tail >= num. Do not append when an equal value should overwrite.",
      },
    ],
    attempts: [
      {
        id: 5,
        label: "Attempt 02",
        date: "Apr 3, 2026",
        outcome: "Not Completed",
        duration: "67 min",
        language: "TypeScript",
        insight: "Lost time translating the tails-array invariant into code.",
        mistakes: ["Wrong binary search target", "Narrative mismatch"],
      },
    ],
  },
  {
    id: 105,
    leetcodeId: 139,
    title: "Word Break",
    slug: "word-break",
    difficulty: "Medium",
    status: "Mastered",
    pattern: "Dynamic Programming",
    topic: "String",
    language: "Go",
    lastTouched: "5d ago",
    nextReview: "In 6 days",
    timeToSolve: "18 min",
    noteCount: 1,
    inReview: false,
    listIds: [3],
    summary:
      "A compact DP problem you use as a confidence reset when the session needs an early win.",
    brief:
      "The current implementation is fast and the explanation is concise enough for interview pacing.",
    tags: ["dp", "memoization", "confidence reset"],
    relatedProblemIds: [104, 108],
    notes: [
      {
        id: 7,
        title: "State definition",
        tag: "Interview",
        excerpt:
          "Always define dp[i] as 'can segment prefix ending at i' before touching the loop.",
      },
    ],
    attempts: [
      {
        id: 6,
        label: "Attempt 02",
        date: "Mar 29, 2026",
        outcome: "Accepted",
        duration: "18 min",
        language: "Go",
        insight: "Early set lookup and prefix state definition made the implementation clean.",
        mistakes: [],
      },
    ],
  },
  {
    id: 106,
    leetcodeId: 127,
    title: "Word Ladder",
    slug: "word-ladder",
    difficulty: "Hard",
    status: "Attempted",
    pattern: "BFS",
    topic: "Graph",
    language: "Python",
    lastTouched: "4h ago",
    nextReview: "Today, 20:10",
    timeToSolve: "71 min",
    noteCount: 1,
    inReview: true,
    listIds: [2],
    summary:
      "Still too expensive in its naive neighbor generation. Good choice for spotlighting algorithmic tradeoff notes.",
    brief:
      "You know the BFS framing. What you need is a sharper precomputation story and faster wildcard grouping recall.",
    tags: ["bfs", "graph layers", "optimization"],
    relatedProblemIds: [102, 103],
    notes: [
      {
        id: 8,
        title: "Wildcard buckets",
        tag: "Strategy",
        excerpt:
          "Precompute patterns like h*t to avoid O(n^2 * wordLength) neighbor checks during BFS.",
      },
    ],
    attempts: [
      {
        id: 7,
        label: "Attempt 01",
        date: "Apr 3, 2026",
        outcome: "Time Limit",
        duration: "71 min",
        language: "Python",
        insight: "The layer traversal was correct. Neighbor generation was not.",
        mistakes: ["Naive adjacency construction"],
      },
    ],
  },
  {
    id: 107,
    leetcodeId: 20,
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy",
    status: "Mastered",
    pattern: "Stack",
    topic: "Stack",
    language: "Rust",
    lastTouched: "1w ago",
    nextReview: "In 2 weeks",
    timeToSolve: "7 min",
    noteCount: 0,
    inReview: false,
    listIds: [1],
    summary:
      "Baseline stack problem retained in the demo to keep the problem mix honest and the layouts varied.",
    brief: "Fast, stable, and no longer worth much dashboard attention.",
    tags: ["stack", "warmup"],
    relatedProblemIds: [103],
    notes: [],
    attempts: [
      {
        id: 8,
        label: "Attempt 01",
        date: "Mar 24, 2026",
        outcome: "Accepted",
        duration: "7 min",
        language: "Rust",
        insight: "Routine stack mapping problem.",
        mistakes: [],
      },
    ],
  },
  {
    id: 108,
    leetcodeId: 72,
    title: "Edit Distance",
    slug: "edit-distance",
    difficulty: "Hard",
    status: "Unseen",
    pattern: "Dynamic Programming",
    topic: "DP",
    language: "TypeScript",
    lastTouched: "Not started",
    nextReview: "Queue when ready",
    timeToSolve: "Pending",
    noteCount: 0,
    inReview: false,
    listIds: [3],
    summary:
      "Deliberately left unseen to give the problems table a clean empty-state edge case and a true frontier item.",
    brief:
      "The right moment for this is after LIS narrative cleanup, not before.",
    tags: ["dp frontier", "edit operations"],
    relatedProblemIds: [104, 105],
    notes: [],
    attempts: [],
  },
  {
    id: 109,
    leetcodeId: 3,
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    status: "Solved",
    pattern: "Sliding Window",
    topic: "String",
    language: "TypeScript",
    lastTouched: "4d ago",
    nextReview: "In 5 days",
    timeToSolve: "19 min",
    noteCount: 1,
    inReview: true,
    listIds: [1, 2],
    summary:
      "A compact window problem that now serves as a calibration point for cleaner left-pointer narration.",
    brief:
      "The implementation is stable. The remaining work is making the invariant explanation shorter and more confident.",
    tags: ["sliding window", "set invariant", "review-ready"],
    relatedProblemIds: [102, 110],
    notes: [
      {
        id: 9,
        title: "Window meaning",
        tag: "Interview",
        excerpt:
          "State that the window always contains unique characters before you talk about movement. It removes half the confusion.",
      },
    ],
    attempts: [
      {
        id: 9,
        label: "Attempt 02",
        date: "Mar 30, 2026",
        outcome: "Accepted",
        duration: "19 min",
        language: "TypeScript",
        insight: "The solve became easier once the set represented the current window and nothing more.",
        mistakes: ["Overexplained pointer updates"],
      },
    ],
  },
  {
    id: 110,
    leetcodeId: 49,
    title: "Group Anagrams",
    slug: "group-anagrams",
    difficulty: "Medium",
    status: "Mastered",
    pattern: "Hash Map",
    topic: "String",
    language: "Go",
    lastTouched: "6d ago",
    nextReview: "In 1 week",
    timeToSolve: "14 min",
    noteCount: 1,
    inReview: false,
    listIds: [1],
    summary:
      "A dependable hashing problem kept in the archive as a fast confidence reset between heavier review sessions.",
    brief:
      "Sorting keys is no longer the issue. The value here is tightening the explanation around tradeoffs and complexity.",
    tags: ["hash map", "string encoding"],
    relatedProblemIds: [101, 109],
    notes: [
      {
        id: 10,
        title: "Keying strategy",
        tag: "Learning",
        excerpt:
          "Mention both sorted-string and frequency-vector keys, then justify the simpler one unless constraints push otherwise.",
      },
    ],
    attempts: [
      {
        id: 10,
        label: "Attempt 03",
        date: "Mar 28, 2026",
        outcome: "Accepted",
        duration: "14 min",
        language: "Go",
        insight: "Narrated the grouping key before coding and avoided needless detours.",
        mistakes: [],
      },
    ],
  },
  {
    id: 111,
    leetcodeId: 98,
    title: "Validate Binary Search Tree",
    slug: "validate-binary-search-tree",
    difficulty: "Medium",
    status: "Attempted",
    pattern: "Tree DFS",
    topic: "Tree",
    language: "Python",
    lastTouched: "Today",
    nextReview: "Today, 22:10",
    timeToSolve: "33 min",
    noteCount: 2,
    inReview: true,
    listIds: [2],
    summary:
      "A familiar tree problem that still exposes occasional sloppiness around global constraints versus local child checks.",
    brief:
      "You remember the shape of the answer, but the range-based invariant is not yet automatic under time pressure.",
    tags: ["tree dfs", "range invariant", "active review"],
    relatedProblemIds: [103, 112],
    notes: [
      {
        id: 11,
        title: "Local checks are not enough",
        tag: "Review",
        excerpt:
          "A valid BST condition propagates through ancestor bounds. Child-only comparisons miss the real invariant.",
      },
      {
        id: 12,
        title: "Narrate bounds early",
        tag: "Interview",
        excerpt:
          "Say min and max bounds before recursion starts. It makes the recursive contract obvious.",
      },
    ],
    attempts: [
      {
        id: 11,
        label: "Attempt 02",
        date: "Apr 3, 2026",
        outcome: "Wrong Answer",
        duration: "33 min",
        language: "Python",
        insight: "The recursion shape was fine. The invariant was too local.",
        mistakes: ["Compared only parent and child", "Missed ancestor bounds"],
      },
    ],
  },
  {
    id: 112,
    leetcodeId: 560,
    title: "Subarray Sum Equals K",
    slug: "subarray-sum-equals-k",
    difficulty: "Medium",
    status: "Solved",
    pattern: "Prefix Sum",
    topic: "Array",
    language: "Java",
    lastTouched: "5d ago",
    nextReview: "In 8 days",
    timeToSolve: "26 min",
    noteCount: 1,
    inReview: false,
    listIds: [2, 3],
    summary:
      "Useful for keeping prefix-sum counting ideas alive without needing a full reread of old notes.",
    brief:
      "The solve is stable. What remains is making the count-map intuition feel less magical in explanation.",
    tags: ["prefix sum", "counting", "arrays"],
    relatedProblemIds: [104, 111],
    notes: [
      {
        id: 13,
        title: "Map stores seen prefixes",
        tag: "Strategy",
        excerpt:
          "Count how many prior prefixes make the current sum land on k. That sentence is the whole problem.",
      },
    ],
    attempts: [
      {
        id: 12,
        label: "Attempt 02",
        date: "Mar 29, 2026",
        outcome: "Accepted",
        duration: "26 min",
        language: "Java",
        insight: "Treating the map as historical prefix counts made the implementation predictable.",
        mistakes: ["Forgot initial zero prefix on first pass"],
      },
    ],
  },
]

const demoListsData: DemoList[] = [
  {
    id: 1,
    name: "Interview Spine",
    subtitle: "High-signal classics",
    description:
      "Anchor problems that should stay explainable under pressure, not just solvable in quiet conditions.",
    gradient:
      "linear-gradient(135deg, color-mix(in oklab, var(--accent-solid) 32%, transparent), transparent 72%)",
    problemIds: [101, 102, 107],
    cadence: "Twice weekly",
  },
  {
    id: 2,
    name: "Graph Pressure Test",
    subtitle: "Traversal under constraints",
    description:
      "A tighter graph set built to expose narration gaps, queue mistakes, and runtime tradeoffs.",
    gradient:
      "linear-gradient(135deg, color-mix(in oklab, var(--chart-3) 32%, transparent), transparent 72%)",
    problemIds: [102, 103, 106],
    cadence: "Every 3 days",
  },
  {
    id: 3,
    name: "DP Rewrite",
    subtitle: "From vague to precise",
    description:
      "Problems selected for cleaner state definitions, stronger transition language, and less hand-waving.",
    gradient:
      "linear-gradient(135deg, color-mix(in oklab, var(--chart-4) 32%, transparent), transparent 72%)",
    problemIds: [101, 104, 105, 108],
    cadence: "Daily",
  },
]

const demoReviewQueueData: DemoReviewItem[] = [
  {
    id: 9001,
    problemId: 104,
    title: "Longest Increasing Subsequence",
    dueLabel: "Due now",
    difficulty: "Medium",
    pattern: "Dynamic Programming",
    reason: "Binary-search tails invariant still slips under time pressure.",
    interval: "1 day cadence",
  },
  {
    id: 9002,
    problemId: 101,
    title: "LRU Cache",
    dueLabel: "In 47 min",
    difficulty: "Medium",
    pattern: "Design",
    reason: "Keep the eviction explanation crisp enough for live interview narration.",
    interval: "4 day interval",
  },
  {
    id: 9003,
    problemId: 106,
    title: "Word Ladder",
    dueLabel: "Tonight",
    difficulty: "Hard",
    pattern: "BFS",
    reason: "Wildcard preprocessing needs one more clean pass before it sticks.",
    interval: "next-day retry",
  },
]

const demoNotesData: DemoNote[] = [
  {
    id: 11,
    title: "Explain DP state before loops",
    tag: "Interview",
    date: "Apr 3, 2026",
    excerpt:
      "If the state sentence is unclear, the implementation usually gets noisy. Force the one-line state definition first.",
  },
  {
    id: 12,
    title: "LIS needs two stories",
    tag: "Learning",
    date: "Apr 3, 2026",
    problemId: 104,
    excerpt:
      "Keep both O(n^2) and O(n log n) explanations. One is easier to derive, the other is easier to brag about.",
  },
  {
    id: 13,
    title: "Window problems fail on shrink timing",
    tag: "Review",
    date: "Apr 1, 2026",
    problemId: 102,
    excerpt:
      "Most misses come from contracting before logging the candidate answer or after the validity condition is already broken.",
  },
  {
    id: 14,
    title: "Graph BFS narration rhythm",
    tag: "Strategy",
    date: "Mar 31, 2026",
    problemId: 106,
    excerpt:
      "State the queue meaning, visited meaning, and per-level meaning out loud. It cuts down self-inflicted confusion.",
  },
]

export const demoAccountSettings: DemoAccountSettings = {
  headline: "Turning scattered solve history into a sharper editorial practice.",
  bio:
    "This demo branch treats the account page as a profile of working habits instead of a generic settings dump.",
  location: "Remote / UTC",
  timezone: "UTC",
  preferredLanguage: "TypeScript",
  dailyGoal: "2 deliberate solves",
  reviewCadence: "Nightly 30-minute review block",
  publishing: [
    { label: "Public progress", value: "Visible to collaborators" },
    { label: "Shared lists", value: "Private by default" },
    { label: "Notes policy", value: "Highlights only, not raw drafts" },
  ],
}

export const demoDashboard: DemoDashboard = {
  hero: {
    eyebrow: "Editorial-tech demo branch",
    title: "A study system that reads like a desk, not a dashboard template.",
    description:
      "This branch bypasses auth, replaces live queries with stable mock data, and turns the product into a reviewable narrative surface.",
    kicker: "17-day solve streak · 3 active queues · 1 pattern rewrite in progress",
  },
  metricStrip: [
    { label: "Solved archive", value: "148", change: "+9 this month", tone: "positive" },
    { label: "Review pressure", value: "12", change: "3 due today", tone: "warning" },
    { label: "Hard problem comfort", value: "61%", change: "+7 pts vs Feb", tone: "positive" },
    { label: "Average writeup depth", value: "4.2/5", change: "stable", tone: "neutral" },
  ],
  weeklyVelocity: [
    { label: "Mon", value: 3 },
    { label: "Tue", value: 5 },
    { label: "Wed", value: 2 },
    { label: "Thu", value: 6 },
    { label: "Fri", value: 4 },
    { label: "Sat", value: 7 },
    { label: "Sun", value: 5 },
  ],
  patternFocus: [
    { label: "DP", value: 42 },
    { label: "Graphs", value: 31 },
    { label: "Sliding", value: 19 },
    { label: "Design", value: 8 },
  ],
  insightCards: [
    {
      eyebrow: "Signal",
      title: "DP is where the writing still outruns the implementation.",
      body:
        "You often know the right state transition but delay committing to the exact invariant, which costs time and confidence.",
      footnote: "Current case study: Longest Increasing Subsequence",
    },
    {
      eyebrow: "Strength",
      title: "Graph traversal explanations are sharper than last month.",
      body:
        "Your queue semantics and visited-state framing are more disciplined. The remaining gap is preprocessing tradeoffs.",
      footnote: "Recent gain: Number of Islands",
    },
    {
      eyebrow: "Workflow",
      title: "Notes are now compact enough to reread.",
      body:
        "The best entries have one invariant, one failure mode, and one interview phrasing note. That structure scales.",
      footnote: "14 stable notes in the current mock library",
    },
  ],
  activity: [
    { day: "M", count: 1 },
    { day: "T", count: 3 },
    { day: "W", count: 2 },
    { day: "T", count: 4 },
    { day: "F", count: 1 },
    { day: "S", count: 5 },
    { day: "S", count: 4 },
    { day: "M", count: 2 },
    { day: "T", count: 4 },
    { day: "W", count: 0 },
    { day: "T", count: 3 },
    { day: "F", count: 2 },
    { day: "S", count: 4 },
    { day: "S", count: 5 },
  ],
  timeline: [
    {
      label: "Now",
      title: "Rewrite LIS note into a cleaner editorial sequence",
      body: "Keep both the quadratic and binary-search narratives. The current note assumes too much.",
    },
    {
      label: "Tonight",
      title: "Re-run Word Ladder with wildcard buckets",
      body: "This is the main review debt item blocking graph confidence from feeling earned.",
    },
    {
      label: "Weekend",
      title: "Open the unseen DP frontier",
      body: "Edit Distance moves in only after the LIS explanation becomes compact and repeatable.",
    },
  ],
}

export function getDemoSession() {
  return demoSession
}

export function getDemoDashboard() {
  return demoDashboard
}

export function getDemoProblems() {
  return demoProblems
}

export function getDemoProblem(id: number) {
  return demoProblems.find((problem) => problem.id === id)
}

export function getDemoReviewQueue() {
  return demoReviewQueueData
}

export function getDemoLists() {
  return demoListsData
}

export function getDemoList(id: number) {
  const list = demoListsData.find((item) => item.id === id)
  if (!list) return null

  return {
    ...list,
    problems: demoProblems.filter((problem) => list.problemIds.includes(problem.id)),
  }
}

export function getDemoNotes() {
  return demoNotesData
}

export function getRelatedProblems(problemIds: number[]) {
  return demoProblems.filter((problem) => problemIds.includes(problem.id))
}
