"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Flame, FolderKanban, NotebookPen, Trophy, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FriendActionButton } from "@/components/social/friend-action-button"
import { usePublicProfile } from "@/hooks/use-social"
import type { PublicUserProfileDto, SocialUserDto } from "@/lib/types"

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
    return <div className="text-sm text-muted-foreground">Invalid profile id.</div>
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-[2rem]" />
        <Skeleton className="h-72 rounded-[2rem]" />
        <Skeleton className="h-72 rounded-[2rem]" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="p-6 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to load profile."}
        </CardContent>
      </Card>
    )
  }

  const socialUser = toSocialUser(profile)
  const statCards = profile.stats
    ? [
        { label: "Solved", value: profile.stats.totalSolved, icon: <Trophy className="h-4 w-4" /> },
        { label: "Current streak", value: profile.stats.currentStreak, icon: <Flame className="h-4 w-4" /> },
        { label: "Topics covered", value: profile.stats.distinctTopicsCovered, icon: <Users className="h-4 w-4" /> },
        { label: "Patterns covered", value: profile.stats.distinctPatternsCovered, icon: <FolderKanban className="h-4 w-4" /> },
      ]
    : []

  return (
    <div className="space-y-6 pb-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/people">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to people
        </Link>
      </Button>

      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--background)_88%,var(--primary)_12%),color-mix(in_oklab,var(--background)_94%,var(--accent)_6%))] px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="h-20 w-20 border border-border/70 shadow-sm">
              <AvatarImage src={profile.avatarDataUrl ?? undefined} alt={profile.displayName} />
              <AvatarFallback>{getInitials(profile.displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-white/20 bg-background/70">
                  {profile.isOwnProfile ? "Your public profile" : "Member profile"}
                </Badge>
                {profile.progressPublic ? <Badge variant="secondary">Progress visible</Badge> : null}
                {profile.listsPublic ? <Badge variant="secondary">Lists visible</Badge> : null}
                {profile.notesPublic ? <Badge variant="secondary">Notes visible</Badge> : null}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{profile.displayName}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {profile.username ? `@${profile.username}` : `Member #${profile.userId}`}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {profile.bio?.trim() || "No profile summary yet."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.leetcodeUrl ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={profile.leetcodeUrl} target="_blank" rel="noreferrer">
                      LeetCode
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
                {profile.githubUrl ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={profile.githubUrl} target="_blank" rel="noreferrer">
                      GitHub
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {!profile.isOwnProfile ? (
            <div className="w-full max-w-sm">
              <FriendActionButton user={socialUser} fullWidth />
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.9fr)]">
        <div className="space-y-6">
          <Card className="border-border/70 py-0">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Progress</CardTitle>
              <CardDescription>
                {profile.progressPublic || profile.isOwnProfile
                  ? "Shared solve and streak highlights."
                  : "This member keeps progress details private."}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              {profile.stats ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {statCards.map((stat) => (
                    <div key={stat.label} className="rounded-[1.4rem] border border-border/70 bg-card/70 p-4">
                      <div className="flex items-center justify-between gap-3 text-muted-foreground">
                        <span className="text-sm font-medium">{stat.label}</span>
                        {stat.icon}
                      </div>
                      <p className="mt-3 text-3xl font-semibold tracking-tight">{stat.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No public progress metrics available.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 py-0">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Public lists</CardTitle>
              <CardDescription>
                {profile.listsPublic || profile.isOwnProfile
                  ? "Shared study buckets and their current shape."
                  : "This member keeps lists private."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-6">
              {profile.lists.length ? (
                profile.lists.map((list) => (
                  <div key={list.id} className="rounded-[1.4rem] border border-border/70 bg-card/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-tight">{list.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {list.totalProblems} problems • {list.completedProblems} completed • {list.remainingProblems} remaining
                        </p>
                      </div>
                      {list.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No public lists available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 py-0">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Recent notes</CardTitle>
            <CardDescription>
              {profile.notesPublic || profile.isOwnProfile
                ? "Latest notes this member is willing to share."
                : "This member keeps notes private."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            {profile.notes.length ? (
              profile.notes.map((note) => (
                <div key={note.id} className="rounded-[1.4rem] border border-border/70 bg-card/70 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{note.title}</p>
                    <Badge variant="outline">{note.tag}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.content}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    <NotebookPen className="mr-1 inline h-3.5 w-3.5" />
                    {new Date(note.dateTime).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No public notes available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
