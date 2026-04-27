"use client"

import { Loader2, UserCheck2, UserPlus2, UserRoundX, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useDeclineFriendRequest,
  useSendFriendRequest,
  useUnfriend,
} from "@/hooks/use-social"
import type { SocialUserDto } from "@/lib/types"

export function FriendActionButton({
  user,
  fullWidth = false,
}: {
  user: SocialUserDto
  fullWidth?: boolean
}) {
  const sendMutation = useSendFriendRequest()
  const acceptMutation = useAcceptFriendRequest()
  const declineMutation = useDeclineFriendRequest()
  const cancelMutation = useCancelFriendRequest()
  const unfriendMutation = useUnfriend()

  const isPending =
    sendMutation.isPending ||
    acceptMutation.isPending ||
    declineMutation.isPending ||
    cancelMutation.isPending ||
    unfriendMutation.isPending

  async function handleSend() {
    try {
      await sendMutation.mutateAsync(user.id)
      toast.success(`Friend request sent to ${user.displayName}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message.replace(/^\d+:\s*/, "") : "Failed to send request")
    }
  }

  async function handleAccept() {
    if (!user.friendshipRequestId) return
    try {
      await acceptMutation.mutateAsync(user.friendshipRequestId)
      toast.success(`You and ${user.displayName} are now friends`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message.replace(/^\d+:\s*/, "") : "Failed to accept request")
    }
  }

  async function handleDecline() {
    if (!user.friendshipRequestId) return
    try {
      await declineMutation.mutateAsync(user.friendshipRequestId)
      toast.success(`Declined request from ${user.displayName}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message.replace(/^\d+:\s*/, "") : "Failed to decline request")
    }
  }

  async function handleCancel() {
    if (!user.friendshipRequestId) return
    try {
      await cancelMutation.mutateAsync(user.friendshipRequestId)
      toast.success(`Cancelled request to ${user.displayName}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message.replace(/^\d+:\s*/, "") : "Failed to cancel request")
    }
  }

  async function handleUnfriend() {
    try {
      await unfriendMutation.mutateAsync(user.id)
      toast.success(`Removed ${user.displayName} from friends`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message.replace(/^\d+:\s*/, "") : "Failed to remove friend")
    }
  }

  if (user.friendshipState === "SELF") {
    return null
  }

  if (user.friendshipState === "INCOMING_REQUEST") {
    return (
      <div className={`flex gap-2 ${fullWidth ? "w-full" : ""}`}>
        <Button onClick={handleAccept} disabled={isPending} className={fullWidth ? "flex-1" : ""}>
          {acceptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck2 className="h-4 w-4" />}
          Accept
        </Button>
        <Button variant="outline" onClick={handleDecline} disabled={isPending} className={fullWidth ? "flex-1" : ""}>
          {declineMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          Decline
        </Button>
      </div>
    )
  }

  if (user.friendshipState === "OUTGOING_REQUEST") {
    return (
      <Button variant="outline" onClick={handleCancel} disabled={isPending} className={fullWidth ? "w-full" : ""}>
        {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
        Cancel request
      </Button>
    )
  }

  if (user.friendshipState === "FRIENDS") {
    return (
      <Button variant="outline" onClick={handleUnfriend} disabled={isPending} className={fullWidth ? "w-full" : ""}>
        {unfriendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundX className="h-4 w-4" />}
        Unfriend
      </Button>
    )
  }

  return (
    <Button onClick={handleSend} disabled={isPending} className={fullWidth ? "w-full" : ""}>
      {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus2 className="h-4 w-4" />}
      Add friend
    </Button>
  )
}
