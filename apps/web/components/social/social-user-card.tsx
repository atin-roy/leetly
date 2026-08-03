"use client"

import Link from "next/link"
import { ArrowUpRight, UserCheck2, UserPlus2, UserRoundSearch } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FriendActionButton } from "@/components/social/friend-action-button"
import type { SocialUserDto } from "@/lib/types"
import styles from "./social-user-card.module.css"

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
      return { label: "Friends", icon: <UserCheck2 size={12} /> }
    case "INCOMING_REQUEST":
      return { label: "Incoming request", icon: <UserPlus2 size={12} /> }
    case "OUTGOING_REQUEST":
      return { label: "Request sent", icon: <UserPlus2 size={12} /> }
    default:
      return { label: "Discover", icon: <UserRoundSearch size={12} /> }
  }
}

export function SocialUserCard({
  user,
}: {
  user: SocialUserDto
}) {
  const badge = getStateBadge(user)

  return (
    <Card className={styles.card}>
      <CardContent className={styles.body}>
        <div className={styles.head}>
          <div className={styles.identity}>
            <Avatar className={styles.avatar}>
              <AvatarImage src={user.avatarDataUrl ?? undefined} alt={user.displayName} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className={styles.identityText}>
              <Link href={`/profile/${user.id}`} className={styles.name}>
                <span className={styles.nameLabel}>{user.displayName}</span>
                <ArrowUpRight size={16} />
              </Link>
              <p className={styles.handle}>
                {user.username ? `@${user.username}` : `Member #${user.id}`}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={styles.badge}>
            {badge.icon}
            {badge.label}
          </Badge>
        </div>

        <p className={styles.bio}>{user.bio?.trim() || "No profile summary yet."}</p>

        <FriendActionButton user={user} fullWidth />
      </CardContent>
    </Card>
  )
}
