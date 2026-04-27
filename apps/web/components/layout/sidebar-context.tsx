"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

const SIDEBAR_EXPANDED_WIDTH = "14rem"
const SIDEBAR_COLLAPSED_WIDTH = "3.5rem"

type SidebarContextType = {
  collapsed: boolean
  mobileOpen: boolean
  toggle: () => void
  toggleMobile: () => void
  closeMobile: () => void
  setMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  mobileOpen: false,
  toggle: () => {},
  toggleMobile: () => {},
  closeMobile: () => {},
  setMobileOpen: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggle = useCallback(() => setCollapsed((c) => !c), [])
  const toggleMobile = useCallback(() => setMobileOpen((open) => !open), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const value = useMemo(
    () => ({ collapsed, mobileOpen, toggle, toggleMobile, closeMobile, setMobileOpen }),
    [closeMobile, collapsed, mobileOpen, toggle, toggleMobile],
  )

  return (
    <SidebarContext.Provider value={value}>
      <div
        className="contents"
        style={
          {
            "--app-sidebar-width": collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
