import { describe, expect, it } from 'vitest'
import { calculateVirtualRange } from './virtualList'

describe('calculateVirtualRange', () => {
  it('returns empty range for empty list', () => {
    const result = calculateVirtualRange({
      itemCount: 0,
      scrollTop: 0,
      viewportHeight: 600,
      overscan: 3,
      estimateHeight: 80,
    })

    expect(result).toEqual({
      startIndex: 0,
      endIndex: -1,
      paddingTop: 0,
      paddingBottom: 0,
      totalHeight: 0,
    })
  })

  it('calculates range with fixed estimate height', () => {
    const result = calculateVirtualRange({
      itemCount: 100,
      scrollTop: 1000,
      viewportHeight: 500,
      overscan: 2,
      estimateHeight: 100,
    })

    expect(result.startIndex).toBe(8)
    expect(result.endIndex).toBe(16)
    expect(result.paddingTop).toBe(800)
    expect(result.totalHeight).toBe(10000)
  })

  it('uses measured heights when available', () => {
    const heights = [100, 180, 90, 300, 120, 110, 260]

    const result = calculateVirtualRange({
      itemCount: heights.length,
      scrollTop: 260,
      viewportHeight: 240,
      overscan: 1,
      estimateHeight: 100,
      getItemHeight: (index) => heights[index],
    })

    expect(result.startIndex).toBe(0)
    expect(result.endIndex).toBe(4)
    expect(result.paddingTop).toBe(0)
    expect(result.totalHeight).toBe(1160)
    expect(result.paddingBottom).toBe(370)
  })
})
