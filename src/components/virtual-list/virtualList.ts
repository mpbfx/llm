export interface VirtualRangeInput {
  itemCount: number
  scrollTop: number
  viewportHeight: number
  overscan: number
  estimateHeight: number
  getItemHeight?: (index: number) => number | undefined
}

export interface VirtualRangeResult {
  startIndex: number
  endIndex: number
  paddingTop: number
  paddingBottom: number
  totalHeight: number
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

const safeHeight = (value: number | undefined, fallback: number): number => {
  if (!value || value <= 0 || Number.isNaN(value)) return fallback
  return value
}

export const calculateVirtualRange = ({
  itemCount,
  scrollTop,
  viewportHeight,
  overscan,
  estimateHeight,
  getItemHeight,
}: VirtualRangeInput): VirtualRangeResult => {
  if (itemCount <= 0 || viewportHeight <= 0) {
    return {
      startIndex: 0,
      endIndex: -1,
      paddingTop: 0,
      paddingBottom: 0,
      totalHeight: 0,
    }
  }

  const normalizedOverscan = Math.max(0, Math.floor(overscan))
  const heights = new Array<number>(itemCount)
  const offsets = new Array<number>(itemCount + 1)
  offsets[0] = 0

  for (let i = 0; i < itemCount; i += 1) {
    heights[i] = safeHeight(getItemHeight?.(i), estimateHeight)
    offsets[i + 1] = offsets[i] + heights[i]
  }

  const totalHeight = offsets[itemCount]
  const maxScrollTop = Math.max(0, totalHeight - viewportHeight)
  const normalizedScrollTop = clamp(scrollTop, 0, maxScrollTop)
  const visibleTop = normalizedScrollTop
  const visibleBottom = normalizedScrollTop + viewportHeight

  let visibleStart = 0
  while (visibleStart < itemCount && offsets[visibleStart + 1] <= visibleTop) {
    visibleStart += 1
  }

  let visibleEnd = visibleStart
  while (visibleEnd < itemCount && offsets[visibleEnd] < visibleBottom) {
    visibleEnd += 1
  }
  visibleEnd = Math.max(visibleStart, visibleEnd - 1)

  const startIndex = Math.max(0, visibleStart - normalizedOverscan)
  const endIndex = Math.min(itemCount - 1, visibleEnd + normalizedOverscan)

  const paddingTop = offsets[startIndex]
  const renderedHeight = offsets[endIndex + 1] - offsets[startIndex]
  const paddingBottom = Math.max(0, totalHeight - paddingTop - renderedHeight)

  return {
    startIndex,
    endIndex,
    paddingTop,
    paddingBottom,
    totalHeight,
  }
}
