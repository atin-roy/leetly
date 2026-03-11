import { format } from "date-fns"
import type { AttemptDto, NoteDto, ProblemDetailDto } from "@/lib/types"

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatDateTime(value: string | null) {
  if (!value) return "Not set"
  return format(new Date(value), "MMM d, yyyy 'at' h:mm a")
}

function formatDuration(minutes: number | null) {
  if (minutes == null) return "Not set"
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`
}

function formatAttempt(attempt: AttemptDto) {
  return [
    `Attempt #${attempt.attemptNumber}`,
    `Created: ${formatDateTime(attempt.createdDate)}`,
    `Language: ${formatEnumLabel(attempt.language)}`,
    `Outcome: ${formatEnumLabel(attempt.outcome)}`,
    `Solve Time: ${formatDuration(attempt.durationMinutes)}`,
    `Timer Start: ${formatDateTime(attempt.startedAt)}`,
    `Timer End: ${formatDateTime(attempt.endedAt)}`,
    `Time Complexity: ${attempt.timeComplexity || "Not set"}`,
    `Space Complexity: ${attempt.spaceComplexity || "Not set"}`,
    `Mistakes: ${attempt.mistakes.length ? attempt.mistakes.map(formatEnumLabel).join(", ") : "None"}`,
    `Approach:\n${attempt.approach || "None"}`,
    `AI Review:\n${attempt.aiReview || "None"}`,
    `What I Learned:\n${attempt.learned || "None"}`,
    `Takeaways:\n${attempt.takeaways || "None"}`,
    `Notes:\n${attempt.notes || "None"}`,
    `Code:\n${attempt.code || "// No code captured."}`,
  ].join("\n")
}

function formatNote(note: NoteDto) {
  return [
    `Title: ${note.title}`,
    `Tag: ${formatEnumLabel(note.tag)}`,
    `Created: ${formatDateTime(note.dateTime)}`,
    `Content:\n${note.content || "None"}`,
  ].join("\n")
}

export function formatProblemForClipboard(problem: ProblemDetailDto, notes: NoteDto[]) {
  return [
    "Problem Export for AI Review",
    `LeetCode ID: ${problem.leetcodeId}`,
    `Title: ${problem.title}`,
    `URL: ${problem.url}`,
    `Difficulty: ${formatEnumLabel(problem.difficulty)}`,
    `Status: ${formatEnumLabel(problem.status)}`,
    `Last Attempted: ${formatDateTime(problem.lastAttemptedAt)}`,
    `Topics: ${problem.topics.length ? problem.topics.map((topic) => topic.name).join(", ") : "None"}`,
    `Patterns: ${problem.patterns.length ? problem.patterns.map((pattern) => pattern.name).join(", ") : "None"}`,
    `Related Problems: ${problem.relatedProblems.length ? problem.relatedProblems.map((related) => `#${related.leetcodeId} ${related.title}`).join(", ") : "None"}`,
    `Problem AI Review:\n${problem.aiReview || "None"}`,
    "",
    "Notes",
    notes.length ? notes.map(formatNote).join("\n\n---\n\n") : "No problem notes.",
    "",
    "Attempts",
    problem.attempts.length
      ? [...problem.attempts]
          .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
          .map(formatAttempt)
          .join("\n\n===\n\n")
      : "No attempts logged.",
  ].join("\n")
}
