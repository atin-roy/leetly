"use client"

import Link from "next/link"
import { useDeferredValue, useState } from "react"
import { Search, UserPlus2, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SocialUserCard } from "@/components/social/social-user-card"
import { useFriendOverview, usePeople } from "@/hooks/use-social"

const PAGE_SIZE = 24

export default function PeoplePage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const deferredSearch = useDeferredValue(search)
  const { data: directory, isLoading: isDirectoryLoading } = usePeople(deferredSearch, page, PAGE_SIZE)
  const { data: overview, isLoading: isOverviewLoading } = useFriendOverview()

  const people = directory?.content ?? []

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--background)_88%,var(--primary)_12%),color-mix(in_oklab,var(--background)_94%,var(--accent)_6%))] px-5 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.08)] sm:px-6 sm:py-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <Badge variant="outline" className="border-white/20 bg-background/70">
              Social graph
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Discover profiles and build your circle.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
              Browse other Leetly members, send friend requests, and keep incoming requests from getting buried.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <Card className="border-border/60 bg-background/76 py-0 backdrop-blur">
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Friends</p>
                <p className="mt-2 text-2xl font-semibold">{overview?.friends.length ?? "—"}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-background/76 py-0 backdrop-blur">
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Incoming</p>
                <p className="mt-2 text-2xl font-semibold">{overview?.incomingRequests.length ?? "—"}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-background/76 py-0 backdrop-blur">
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Outgoing</p>
                <p className="mt-2 text-2xl font-semibold">{overview?.outgoingRequests.length ?? "—"}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Card className="border-border/70 py-0">
        <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>People directory</CardTitle>
              <CardDescription>
                Search by display name or username and jump into any public profile.
              </CardDescription>
            </div>
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(0)
                }}
                placeholder="Search people"
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          {isDirectoryLoading ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-56 rounded-[1.5rem]" />
              ))}
            </div>
          ) : people.length > 0 ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {people.map((person) => (
                  <SocialUserCard key={person.id} user={person} />
                ))}
              </div>
              {directory && directory.totalPages > 1 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {directory.page + 1} of {directory.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page >= directory.totalPages - 1}
                      onClick={() => setPage((current) => current + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-muted/20 px-6 py-14 text-center sm:px-8">
              <Users className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">No matching people yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a broader search or invite more people to Leetly.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <Card className="self-start border-border/70 py-0">
          <CardHeader className="border-b border-border/60 px-5 py-5">
            <CardTitle>Incoming requests</CardTitle>
            <CardDescription>Accept or decline people who want to connect.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5 sm:py-6">
            {isOverviewLoading ? (
              <Skeleton className="h-40 rounded-[1.5rem]" />
            ) : overview?.incomingRequests.length ? (
              overview.incomingRequests.map((person) => (
                <SocialUserCard key={person.id} user={person} />
              ))
            ) : (
              <div className="rounded-[1.1rem] border border-dashed border-border/60 bg-muted/15 px-4 py-5 text-sm text-muted-foreground">
                No incoming requests right now.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="self-start border-border/70 py-0">
          <CardHeader className="border-b border-border/60 px-5 py-5">
            <CardTitle>Friends</CardTitle>
            <CardDescription>Your accepted connections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5 sm:py-6">
            {isOverviewLoading ? (
              <Skeleton className="h-40 rounded-[1.5rem]" />
            ) : overview?.friends.length ? (
              overview.friends.map((person) => (
                <SocialUserCard key={person.id} user={person} />
              ))
            ) : (
              <div className="rounded-[1.1rem] border border-dashed border-border/60 bg-muted/15 px-4 py-5 text-sm text-muted-foreground">
                No friends yet. Start with the directory above.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="self-start border-border/70 py-0">
          <CardHeader className="border-b border-border/60 px-5 py-5">
            <CardTitle>Outgoing requests</CardTitle>
            <CardDescription>Pending requests you can still cancel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5 py-5 sm:py-6">
            {isOverviewLoading ? (
              <Skeleton className="h-40 rounded-[1.5rem]" />
            ) : overview?.outgoingRequests.length ? (
              overview.outgoingRequests.map((person) => (
                <SocialUserCard key={person.id} user={person} />
              ))
            ) : (
              <div className="rounded-[1.1rem] border border-dashed border-border/60 bg-muted/15 px-4 py-5 text-sm text-muted-foreground">
                No outgoing requests at the moment.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 py-0">
        <CardContent className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-medium text-foreground">Want a profile URL to share directly?</p>
            <p className="text-sm text-muted-foreground">
              Open any person card to view their public profile page and send requests from there too.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={people[0] ? `/profile/${people[0].id}` : "/people"}>
              <UserPlus2 className="h-4 w-4" />
              Explore profile
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
