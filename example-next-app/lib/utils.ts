import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCsrfToken(flow: any) {
  return flow.ui.nodes.find(
    (node: any) =>
      node.type === "input" &&
      node.attributes.name === "csrf_token"
  )?.attributes.value
}
