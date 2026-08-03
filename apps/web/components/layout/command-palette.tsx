"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import dynamic from "next/dynamic"

/*
 * Only the hotkey listener ships in the initial bundle. The dialog — and the
 * problem list it searches — is fetched the first time the palette is opened,
 * which for a session that never uses it is never.
 */
const CommandPaletteDialog = dynamic(
  () =>
    import("./command-palette-dialog").then((mod) => mod.CommandPaletteDialog),
  { ssr: false },
)

const CommandPaletteContext = createContext<{ open: () => void } | null>(null)

/** Lets the sidebar's search button open the palette without prop drilling. */
export function useCommandPalette() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider")
  }
  return context
}

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  // Kept separate from isOpen so closing the palette doesn't discard the chunk.
  const [loaded, setLoaded] = useState(false)

  const open = useCallback(() => {
    setLoaded(true)
    setIsOpen(true)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) {
        return
      }
      event.preventDefault()
      setLoaded(true)
      setIsOpen((wasOpen) => !wasOpen)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const value = useMemo(() => ({ open }), [open])

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {loaded && (
        <CommandPaletteDialog open={isOpen} onOpenChange={setIsOpen} />
      )}
    </CommandPaletteContext.Provider>
  )
}
