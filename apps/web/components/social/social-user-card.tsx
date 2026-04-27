"use client"

import Link from "next/link"
import { ArrowUpRight, UserCheck2, UserPlus2, UserRoundSearch } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FriendActionButton } from "@/components/social/friend-action-button"
import type { SocialUserDto } from "@/lib/types"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getStateBadge(user: SocialUserDto) {
  switch (user.friendshipState) {
    case "FRIENDS":
      return { label: "Friends", icon: <UserCheck2 className="h-3 w-3" /> }
    case "INCOMING_REQUEST":
      return { label: "Incoming request", icon: <UserPlus2 className="h-3 w-3" /> }
    case "OUTGOING_REQUEST":
      return { label: "Request sent", icon: <UserPlus2 className="h-3 w-3" /> }
    default:
      return { label: "Discover", icon: <UserRoundSearch className="h-3 w-3" /> }
  }
}

export function SocialUserCard({
  user,
}: {
  user: SocialUserDto
}) {
  const badge = getStateBadge(user)

  return (
    <Card className="overflow-hidden border-border/70 bg-card/80 py-0 shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-12 w-12 border border-border/70">
              <AvatarImage src={user.avatarDataUrl ?? undefined} alt={user.displayName} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Link
                href={`/profile/${user.id}`}
                className="inline-flex items-center gap-1 text-base font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
              >
                <span className="truncate">{user.displayName}</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <p className="truncate text-sm text-muted-foreground">
                {user.username ? `@${user.username}` : `Member #${user.id}`}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 whitespace-nowrap">
            {badge.icon}
            {badge.label}
          </Badge>
        </div>

        <p className="min-h-[3rem] text-sm leading-6 text-muted-foreground">
          {user.bio?.trim() || "No profile summary yet."}
        </p>

        <FriendActionButton user={user} fullWidth />
      </CardContent>
    </Card>
  )
}
