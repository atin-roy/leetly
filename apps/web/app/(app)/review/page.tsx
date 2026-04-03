import { ReviewStatsBar } from "@/components/review/review-stats-bar"
import { ReviewQueue } from "@/components/review/review-queue"

export default function ReviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Review</h1>
      <ReviewStatsBar />
      <ReviewQueue />
    </div>
  )
}
