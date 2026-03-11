"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import hljs from "highlight.js/lib/common"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string | null
  chrome?: boolean
  showCopyButton?: boolean
  className?: string
  preClassName?: string
}

const LANGUAGE_ALIASES: Record<string, string> = {
  "c#": "csharp",
  "c++": "cpp",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  md: "markdown",
  plaintext: "text",
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function normalizeLanguage(language?: string | null) {
  if (!language) return null
  const normalized = language.trim().toLowerCase()
  return LANGUAGE_ALIASES[normalized] ?? normalized
}

function formatLanguageLabel(language?: string | null) {
  if (!language) return "Plain text"
  return language
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function highlightCode(code: string, language?: string | null) {
  const normalizedLanguage = normalizeLanguage(language)

  if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
    return {
      html: hljs.highlight(code, {
        ignoreIllegals: true,
        language: normalizedLanguage,
      }).value,
      languageLabel: formatLanguageLabel(language ?? normalizedLanguage),
    }
  }

  const autoDetected = hljs.highlightAuto(code)
  return {
    html: autoDetected.value || escapeHtml(code),
    languageLabel: formatLanguageLabel(language ?? autoDetected.language),
  }
}

export function CodeBlock({
  code,
  language,
  chrome = false,
  showCopyButton = false,
  className,
  preClassName,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const trimmedCode = code.trimEnd()
  const { html, languageLabel } = highlightCode(trimmedCode, language)

  async function handleCopy() {
    await navigator.clipboard.writeText(trimmedCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("code-highlight overflow-hidden rounded-xl border", className)}>
      {chrome ? (
        <div className="code-highlight__header flex items-center justify-between gap-3 border-b px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            {languageLabel}
          </span>
          {showCopyButton ? (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>
      ) : null}
      <pre
        className={cn(
          "overflow-x-auto px-4 py-3 text-sm leading-6",
          preClassName
        )}
      >
        <code
          className="hljs block min-w-full bg-transparent p-0 font-mono text-[13px]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  )
}
