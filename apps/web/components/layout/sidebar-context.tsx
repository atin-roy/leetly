"use client"

import { createContext, useContext, useState } from "react"

const SIDEBAR_EXPANDED_WIDTH = "14rem"
const SIDEBAR_COLLAPSED_WIDTH = "3.5rem"

type SidebarContextType = {
  collapsed: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggle: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed((c) => !c) }}>
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
