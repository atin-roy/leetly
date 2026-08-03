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
import { cn } from "@/lib/utils"
import type { SocialUserDto } from "@/lib/types"
import styles from "./friend-action-button.module.css"

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
      <div className={cn(styles.row, fullWidth && styles.full)}>
        <Button onClick={handleAccept} disabled={isPending} className={cn(fullWidth && styles.grow)}>
          {acceptMutation.isPending ? <Loader2 className={styles.spin} /> : <UserCheck2 />}
          Accept
        </Button>
        <Button variant="outline" onClick={handleDecline} disabled={isPending} className={cn(fullWidth && styles.grow)}>
          {declineMutation.isPending ? <Loader2 className={styles.spin} /> : <X />}
          Decline
        </Button>
      </div>
    )
  }

  if (user.friendshipState === "OUTGOING_REQUEST") {
    return (
      <Button variant="outline" onClick={handleCancel} disabled={isPending} className={cn(fullWidth && styles.full)}>
        {cancelMutation.isPending ? <Loader2 className={styles.spin} /> : <X />}
        Cancel request
      </Button>
    )
  }

  if (user.friendshipState === "FRIENDS") {
    return (
      <Button variant="outline" onClick={handleUnfriend} disabled={isPending} className={cn(fullWidth && styles.full)}>
        {unfriendMutation.isPending ? <Loader2 className={styles.spin} /> : <UserRoundX />}
        Unfriend
      </Button>
    )
  }

  return (
    <Button onClick={handleSend} disabled={isPending} className={cn(fullWidth && styles.full)}>
      {sendMutation.isPending ? <Loader2 className={styles.spin} /> : <UserPlus2 />}
      Add friend
    </Button>
  )
}
