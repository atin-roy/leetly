"use client"

import Link from "next/link"
import { useDeferredValue, useState } from "react"
import { Search, UserPlus2, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SocialUserCard } from "@/components/social/social-user-card"
import { useFriendOverview, usePeople } from "@/hooks/use-social"
import type { SocialUserDto } from "@/lib/types"
import styles from "./people.module.css"

const PAGE_SIZE = 24

export default function PeoplePage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const deferredSearch = useDeferredValue(search)
  const { data: directory, isLoading: isDirectoryLoading } = usePeople(deferredSearch, page, PAGE_SIZE)
  const { data: overview, isLoading: isOverviewLoading } = useFriendOverview()

  const people = directory?.content ?? []

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>People</p>
        <h1 className={styles.title}>Find people, build your circle.</h1>
        <p className={styles.lede}>
          Browse other Leetly members, send friend requests, and keep incoming
          requests from getting buried.
        </p>
      </header>

      <div className={styles.facts}>
        <div className={styles.fact}>
          <span className={styles.factLabel}>Friends</span>
          <span className={styles.factValue}>{overview?.friends.length ?? "—"}</span>
        </div>
        <div className={styles.fact}>
          <span className={styles.factLabel}>Incoming</span>
          <span className={styles.factValue}>{overview?.incomingRequests.length ?? "—"}</span>
        </div>
        <div className={styles.fact}>
          <span className={styles.factLabel}>Outgoing</span>
          <span className={styles.factValue}>{overview?.outgoingRequests.length ?? "—"}</span>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <p className={styles.panelTitle}>Directory</p>
            <p className={styles.panelNote}>Search by display name or username.</p>
          </div>
          <div className={styles.search}>
            <Search size={16} className={styles.searchIcon} aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(0)
              }}
              placeholder="Search people"
              className={styles.searchInput}
            />
          </div>
        </div>
        <div className={styles.panelBody}>
          {isDirectoryLoading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className={styles.skeletonCard} />
              ))}
            </div>
          ) : people.length > 0 ? (
            <>
              <div className={styles.grid}>
                {people.map((person) => (
                  <SocialUserCard key={person.id} user={person} />
                ))}
              </div>
              {directory && directory.totalPages > 1 ? (
                <div className={styles.pager}>
                  <p className={styles.pagerNote}>
                    Page {directory.page + 1} of {directory.totalPages}
                  </p>
                  <div className={styles.pagerActions}>
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
            <div className={styles.empty}>
              <Users size={28} className={styles.emptyIcon} aria-hidden="true" />
              <p className={styles.emptyTitle}>No matching people yet</p>
              <p className={styles.emptyBody}>
                Try a broader search or invite more people to Leetly.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className={styles.columns}>
        <RequestColumn
          title="Incoming requests"
          note="Accept or decline people who want to connect."
          isLoading={isOverviewLoading}
          people={overview?.incomingRequests}
          emptyLabel="No incoming requests right now."
        />
        <RequestColumn
          title="Friends"
          note="Your accepted connections."
          isLoading={isOverviewLoading}
          people={overview?.friends}
          emptyLabel="No friends yet. Start with the directory above."
        />
        <RequestColumn
          title="Outgoing requests"
          note="Pending requests you can still cancel."
          isLoading={isOverviewLoading}
          people={overview?.outgoingRequests}
          emptyLabel="No outgoing requests at the moment."
        />
      </div>

      <section className={styles.panel}>
        <div className={styles.callout}>
          <div>
            <p className={styles.calloutTitle}>Want a profile URL to share directly?</p>
            <p className={styles.calloutBody}>
              Open any person card to view their public profile page and send requests from there too.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={people[0] ? `/profile/${people[0].id}` : "/people"}>
              <UserPlus2 />
              Explore profile
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function RequestColumn({
  title,
  note,
  isLoading,
  people,
  emptyLabel,
}: {
  title: string
  note: string
  isLoading: boolean
  people: SocialUserDto[] | undefined
  emptyLabel: string
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <p className={styles.panelTitle}>{title}</p>
          <p className={styles.panelNote}>{note}</p>
        </div>
      </div>
      <div className={styles.panelBody}>
        {isLoading ? (
          <Skeleton className={styles.columnSkeleton} />
        ) : people?.length ? (
          <div className={styles.columnList}>
            {people.map((person) => (
              <SocialUserCard key={person.id} user={person} />
            ))}
          </div>
        ) : (
          <div className={styles.columnEmpty}>{emptyLabel}</div>
        )}
      </div>
    </section>
  )
}
