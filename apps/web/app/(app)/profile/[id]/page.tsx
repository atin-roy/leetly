"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Flame, FolderKanban, NotebookPen, Trophy, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FriendActionButton } from "@/components/social/friend-action-button"
import { usePublicProfile } from "@/hooks/use-social"
import type { PublicUserProfileDto, SocialUserDto } from "@/lib/types"
import styles from "./profile.module.css"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function toSocialUser(profile: PublicUserProfileDto): SocialUserDto {
  return {
    id: profile.userId,
    username: profile.username,
    displayName: profile.displayName,
    avatarDataUrl: profile.avatarDataUrl,
    bio: profile.bio,
    friendshipState: profile.friendshipState,
    friendshipRequestId: profile.friendshipRequestId,
  }
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rawId } = use(params)
  const id = Number(rawId)
  const { data: profile, isLoading, isError, error } = usePublicProfile(id)

  if (!Number.isFinite(id)) {
    return <p className={styles.notice}>Invalid profile id.</p>
  }

  if (isLoading) {
    return (
      <div className={styles.skeletons}>
        <Skeleton className={styles.skeletonHero} />
        <Skeleton className={styles.skeletonPanel} />
        <Skeleton className={styles.skeletonPanel} />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className={styles.errorPanel}>
        {error instanceof Error ? error.message : "Failed to load profile."}
      </div>
    )
  }

  const socialUser = toSocialUser(profile)
  const statCards = profile.stats
    ? [
        { label: "Solved", value: profile.stats.totalSolved, icon: <Trophy size={16} /> },
        { label: "Current streak", value: profile.stats.currentStreak, icon: <Flame size={16} /> },
        { label: "Topics covered", value: profile.stats.distinctTopicsCovered, icon: <Users size={16} /> },
        { label: "Patterns covered", value: profile.stats.distinctPatternsCovered, icon: <FolderKanban size={16} /> },
      ]
    : []

  return (
    <div className={styles.page}>
      <Button variant="ghost" size="sm" asChild className={styles.back}>
        <Link href="/people">
          <ArrowLeft size={16} />
          Back to people
        </Link>
      </Button>

      <section className={styles.hero}>
        <div className={styles.identity}>
          <Avatar className={styles.avatar}>
            <AvatarImage src={profile.avatarDataUrl ?? undefined} alt={profile.displayName} />
            <AvatarFallback>{getInitials(profile.displayName)}</AvatarFallback>
          </Avatar>
          <div className={styles.identityText}>
            <div className={styles.badges}>
              <Badge variant="outline">
                {profile.isOwnProfile ? "Your public profile" : "Member profile"}
              </Badge>
              {profile.progressPublic ? <Badge variant="secondary">Progress visible</Badge> : null}
              {profile.listsPublic ? <Badge variant="secondary">Lists visible</Badge> : null}
              {profile.notesPublic ? <Badge variant="secondary">Notes visible</Badge> : null}
            </div>
            <h1 className={styles.name}>{profile.displayName}</h1>
            <p className={styles.handle}>
              {profile.username ? `@${profile.username}` : `Member #${profile.userId}`}
            </p>
            <p className={styles.bio}>{profile.bio?.trim() || "No profile summary yet."}</p>
            <div className={styles.links}>
              {profile.leetcodeUrl ? (
                <Button asChild variant="outline" size="sm">
                  <a href={profile.leetcodeUrl} target="_blank" rel="noreferrer">
                    LeetCode
                    <ExternalLink size={16} />
                  </a>
                </Button>
              ) : null}
              {profile.githubUrl ? (
                <Button asChild variant="outline" size="sm">
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer">
                    GitHub
                    <ExternalLink size={16} />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {!profile.isOwnProfile ? (
          <div className={styles.friendAction}>
            <FriendActionButton user={socialUser} fullWidth />
          </div>
        ) : null}
      </section>

      <div className={styles.grid}>
        <div className={styles.column}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <p className={styles.panelTitle}>Progress</p>
              <p className={styles.panelNote}>
                {profile.progressPublic || profile.isOwnProfile
                  ? "Shared solve and streak highlights."
                  : "This member keeps progress details private."}
              </p>
            </div>
            <div className={styles.panelBody}>
              {profile.stats ? (
                <div className={styles.stats}>
                  {statCards.map((stat) => (
                    <div key={stat.label} className={styles.stat}>
                      <div className={styles.statHead}>
                        <span className={styles.statLabel}>{stat.label}</span>
                        {stat.icon}
                      </div>
                      <p className={styles.statValue}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.panelEmpty}>No public progress metrics available.</p>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <p className={styles.panelTitle}>Public lists</p>
              <p className={styles.panelNote}>
                {profile.listsPublic || profile.isOwnProfile
                  ? "Shared study buckets and their current shape."
                  : "This member keeps lists private."}
              </p>
            </div>
            <div className={styles.panelBody}>
              {profile.lists.length ? (
                <div className={styles.rows}>
                  {profile.lists.map((list) => (
                    <div key={list.id} className={styles.row}>
                      <div className={styles.rowHead}>
                        <div>
                          <p className={styles.rowTitle}>{list.name}</p>
                          <p className={styles.rowNote}>
                            {list.totalProblems} problems &middot; {list.completedProblems} completed &middot;{" "}
                            {list.remainingProblems} remaining
                          </p>
                        </div>
                        {list.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.panelEmpty}>No public lists available.</p>
              )}
            </div>
          </section>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <p className={styles.panelTitle}>Recent notes</p>
            <p className={styles.panelNote}>
              {profile.notesPublic || profile.isOwnProfile
                ? "Latest notes this member is willing to share."
                : "This member keeps notes private."}
            </p>
          </div>
          <div className={styles.panelBody}>
            {profile.notes.length ? (
              <div className={styles.rows}>
                {profile.notes.map((note) => (
                  <div key={note.id} className={styles.row}>
                    <div className={styles.rowHead}>
                      <p className={styles.rowTitle}>{note.title}</p>
                      <Badge variant="outline">{note.tag}</Badge>
                    </div>
                    <p className={styles.rowBody}>{note.content}</p>
                    <p className={styles.rowMeta}>
                      <NotebookPen size={14} />
                      {new Date(note.dateTime).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.panelEmpty}>No public notes available.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
