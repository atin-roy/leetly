import type { ProblemListDto } from "@/lib/types"

const DEFAULT_LIST_NAME = "My Problems"
const DEFAULT_LIST_DISPLAY_NAME = "All Problems"

export function getListDisplayName(list: Pick<ProblemListDto, "name" | "isDefault">) {
  if (list.isDefault || list.name === DEFAULT_LIST_NAME) {
    return DEFAULT_LIST_DISPLAY_NAME
  }

  return list.name
}

export function getListDisplayNameFromName(name: string) {
  return name === DEFAULT_LIST_NAME ? DEFAULT_LIST_DISPLAY_NAME : name
}

export function getListHref(list: Pick<ProblemListDto, "id" | "name" | "isDefault">) {
  if (list.isDefault || list.name === DEFAULT_LIST_NAME) {
    return "/problems"
  }

  return `/lists/${list.id}`
}
