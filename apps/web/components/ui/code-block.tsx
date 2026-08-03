"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import hljs from "highlight.js/lib/common"
import { cn } from "@/lib/utils"
import styles from "./code-block.module.css"

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
    <div className={cn("code-highlight", styles.block, className)}>
      {chrome ? (
        <div className={cn("code-highlight__header", styles.header)}>
          <span className={styles.language}>
            {languageLabel}
          </span>
          {showCopyButton ? (
            <button
              type="button"
              onClick={handleCopy}
              className={styles.copy}
            >
              {copied ? (
                <Check size={14} />
              ) : (
                <Copy size={14} />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>
      ) : null}
      <pre
        className={cn(styles.pre, preClassName)}
      >
        <code
          className={cn("hljs", styles.code)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  )
}
