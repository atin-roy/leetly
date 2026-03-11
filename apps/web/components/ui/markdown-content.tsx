"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"
import { CodeBlock } from "@/components/ui/code-block"

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({
  content,
  className,
}: MarkdownContentProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <a
              {...props}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children, ...props }) => {
            const code = String(children).replace(/\n$/, "")
            const languageMatch = /language-([\w#+-]+)/.exec(className ?? "")
            const isBlock = Boolean(className) || code.includes("\n")

            if (!isBlock) {
              return (
                <code {...props}>
                  {children}
                </code>
              )
            }

            return (
              <CodeBlock
                code={code}
                language={languageMatch?.[1] ?? null}
              />
            )
          },
          table: ({ children, ...props }) => (
            <div className="my-6 overflow-x-auto">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
