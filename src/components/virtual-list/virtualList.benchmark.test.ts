import { describe, expect, it } from 'vitest'
import { performance } from 'node:perf_hooks'
import { calculateVirtualRange } from './virtualList'

interface Scenario {
  name: string
  itemCount: number
  scrollTop: number
  viewportHeight: number
  estimateHeight: number
  overscan: number
}

const scenarios: Scenario[] = [
  {
    name: '10k-top',
    itemCount: 10_000,
    scrollTop: 0,
    viewportHeight: 720,
    estimateHeight: 88,
    overscan: 3,
  },
  {
    name: '10k-middle',
    itemCount: 10_000,
    scrollTop: 420_000,
    viewportHeight: 720,
    estimateHeight: 88,
    overscan: 3,
  },
  {
    name: '50k-deep',
    itemCount: 50_000,
    scrollTop: 2_300_000,
    viewportHeight: 720,
    estimateHeight: 88,
    overscan: 3,
  },
]

describe('virtual list benchmark', () => {
  it('quantifies rendered count reduction before/after virtualization', () => {
    const rows = scenarios.map((scenario) => {
      const range = calculateVirtualRange({
        itemCount: scenario.itemCount,
        scrollTop: scenario.scrollTop,
        viewportHeight: scenario.viewportHeight,
        overscan: scenario.overscan,
        estimateHeight: scenario.estimateHeight,
      })

      const fullRenderCount = scenario.itemCount
      const virtualRenderCount = range.endIndex >= range.startIndex
        ? range.endIndex - range.startIndex + 1
        : 0

      const reductionPct = ((1 - virtualRenderCount / fullRenderCount) * 100).toFixed(2)

      return {
        scenario: scenario.name,
        before: fullRenderCount,
        after: virtualRenderCount,
        reduction: `${reductionPct}%`,
      }
    })

    console.table(rows)

    rows.forEach((row) => {
      expect(row.after).toBeLessThan(row.before)
    })
  })

  it('measures core range-calc cost (before vs after model)', () => {
    const itemCount = 50_000
    const viewportHeight = 720
    const estimateHeight = 88
    const overscan = 3
    const iterations = 2_000

    const sampleScrollTops = Array.from({ length: iterations }, (_, i) => {
      return (i * 1300) % (itemCount * estimateHeight)
    })

    const t0 = performance.now()
    sampleScrollTops.forEach((scrollTop) => {
      // before: full render creates per-item render payload for the entire list
      const fullPayload = Array.from({ length: itemCount }, (_, i) => ({
        id: i,
        key: `msg-${i}`,
        top: i * estimateHeight,
      }))
      if (fullPayload.length === 0 || scrollTop < 0) throw new Error('unreachable')
    })
    const beforeMs = performance.now() - t0

    const t1 = performance.now()
    sampleScrollTops.forEach((scrollTop) => {
      const range = calculateVirtualRange({
        itemCount,
        scrollTop,
        viewportHeight,
        overscan,
        estimateHeight,
      })
      const visibleCount = range.endIndex - range.startIndex + 1
      const visiblePayload = Array.from({ length: visibleCount }, (_, i) => {
        const index = range.startIndex + i
        return {
          id: index,
          key: `msg-${index}`,
          top: index * estimateHeight,
        }
      })
      if (visiblePayload.length === 0 && itemCount > 0) throw new Error('unreachable')
    })
    const afterMs = performance.now() - t1

    const avgAfterMs = afterMs / iterations
    const speedup = beforeMs / afterMs

    console.table([
      {
        metric: 'scroll-update total ms',
        before: beforeMs.toFixed(2),
        after: afterMs.toFixed(2),
        improvement: `${speedup.toFixed(2)}x faster`,
      },
      {
        metric: 'range calc avg ms/update',
        before: 'N/A',
        after: avgAfterMs.toFixed(4),
        improvement: 'core calc cost',
      },
    ])

    expect(afterMs).toBeLessThan(beforeMs)
    expect(avgAfterMs).toBeLessThan(2)
  })
})
