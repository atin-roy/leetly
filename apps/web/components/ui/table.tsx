"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type TableProps = React.ComponentPropsWithoutRef<"table"> & {
  containerClassName?: string
}

const Table = React.forwardRef<
  HTMLTableElement,
  TableProps
>(({ className, containerClassName, ...props }, ref) => (
  <div
    data-slot="table-container"
    className={cn(
      "overflow-x-auto rounded-[1.5rem] border border-[var(--border-default)] bg-[color:color-mix(in_oklab,var(--surface-card)_78%,transparent)]",
      containerClassName,
    )}
  >
    <table
      ref={ref}
      data-slot="table"
      className={cn("w-full border-collapse border-spacing-0 caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentPropsWithoutRef<"thead">
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    data-slot="table-header"
    className={cn(
      "bg-[color:color-mix(in_oklab,var(--surface-muted)_70%,transparent)] text-[var(--text-muted)] [&_tr]:border-b-0",
      className,
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentPropsWithoutRef<"tbody">
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    data-slot="table-body"
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentPropsWithoutRef<"tfoot">
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    data-slot="table-footer"
    className={cn(
      "border-t border-[var(--border-default)] bg-[color:color-mix(in_oklab,var(--surface-muted)_50%,transparent)]",
      className,
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.ComponentPropsWithoutRef<"tr">
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    data-slot="table-row"
    className={cn(
      "border-b border-[var(--border-default)] transition-colors hover:bg-[color:color-mix(in_oklab,var(--surface-accent)_55%,transparent)]",
      className,
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentPropsWithoutRef<"th">
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    data-slot="table-head"
    className={cn("px-4 py-3 text-left font-mono text-[0.72rem] uppercase tracking-[0.16em]", className)}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentPropsWithoutRef<"td">
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    data-slot="table-cell"
    className={cn("px-4 py-4 align-middle text-[var(--text-secondary)]", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.ComponentPropsWithoutRef<"caption">
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    data-slot="table-caption"
    className={cn("mt-4 text-sm text-[var(--text-muted)]", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
