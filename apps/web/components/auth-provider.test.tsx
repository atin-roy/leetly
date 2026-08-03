import { render, screen, act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider, useAuth } from "./auth-provider"

const push = vi.fn()
const replace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}))

function Probe() {
  const { session, accessToken } = useAuth()
  return (
    <div>
      <span data-testid="token">{accessToken ?? "none"}</span>
      <span data-testid="expires">{session?.expiresIn ?? "none"}</span>
    </div>
  )
}

function sessionBody(accessToken: string, expiresIn = 900) {
  return { ok: true, json: async () => ({ accessToken, expiresIn }) }
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.useFakeTimers()
  fetchMock = vi.fn()
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** Lets the timer fire and the awaited fetch inside it settle. */
async function flush(ms = 0) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

describe("AuthProvider", () => {
  it("redeems the refresh cookie immediately when there is no session", async () => {
    fetchMock.mockResolvedValue(sessionBody("first-token"))

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    expect(screen.getByTestId("token")).toHaveTextContent("none")

    await flush()

    expect(fetchMock).toHaveBeenCalledWith("/api/session/refresh", {
      method: "POST",
    })
    expect(screen.getByTestId("token")).toHaveTextContent("first-token")
  })

  it("renews one minute before the access token expires", async () => {
    fetchMock
      .mockResolvedValueOnce(sessionBody("first-token", 900))
      .mockResolvedValueOnce(sessionBody("second-token", 900))

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await flush()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // 900s expiry, 60s leeway → the next renewal is due at 840s. One tick
    // short of that it must not have fired.
    await flush(839_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await flush(1_000)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId("token")).toHaveTextContent("second-token")
  })

  it("floors the renewal delay at 30s so a short-lived token cannot spin", async () => {
    // expiresIn below the leeway would give a negative delay, and a 0ms timer
    // that immediately sets state would re-arm itself in a tight loop.
    fetchMock
      .mockResolvedValueOnce(sessionBody("short-token", 10))
      .mockResolvedValueOnce(sessionBody("next-token", 900))

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await flush()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await flush(29_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await flush(1_000)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("never runs two renewals concurrently, since each rotates the cookie", async () => {
    fetchMock.mockResolvedValue(sessionBody("token", 900))

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await flush()
    // Advancing well past several renewal windows in one go must still produce
    // exactly one call per window, not a burst.
    await flush(840_000)
    await flush(840_000)

    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it("redirects to sign-in and stops retrying when redemption fails", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await flush()

    expect(replace).toHaveBeenCalledWith("/sign-in")
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // The signed-out latch must hold: no further attempts, however long we wait.
    await flush(3_600_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("does not apply a response that arrives after unmount", async () => {
    let resolveRefresh: (value: unknown) => void = () => {}
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve
      }),
    )

    const { unmount } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await flush()
    unmount()

    await act(async () => {
      resolveRefresh(sessionBody("late-token"))
    })

    // No assertion on the DOM — the point is that resolving after unmount must
    // not throw or warn about setting state on an unmounted tree.
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
