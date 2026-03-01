import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue'
import { calculateVirtualRange } from './virtualList'

interface MessageLike {
  id: number
}

interface UseVirtualChatListOptions {
  estimateHeight?: number
  overscan?: number
  followBottomThreshold?: number
}

export const useVirtualChatList = (
  containerRef: Ref<HTMLElement | null>,
  messages: ComputedRef<MessageLike[]>,
  options: UseVirtualChatListOptions = {},
) => {
  const estimateHeight = options.estimateHeight ?? 96
  const overscan = options.overscan ?? 3
  const followBottomThreshold = options.followBottomThreshold ?? 80

  const scrollTop = ref(0)
  const viewportHeight = ref(0)
  const shouldFollowBottom = ref(true)
  const heightMap = ref<Map<number, number>>(new Map())

  const measureViewport = () => {
    const container = containerRef.value
    if (!container) return
    viewportHeight.value = container.clientHeight
    scrollTop.value = container.scrollTop
    const distanceToBottom = container.scrollHeight - (container.scrollTop + container.clientHeight)
    shouldFollowBottom.value = distanceToBottom <= followBottomThreshold
  }

  const onScroll = () => {
    measureViewport()
  }

  const setItemHeight = (id: number, height: number) => {
    if (!height || Number.isNaN(height) || height <= 0) return
    const prev = heightMap.value.get(id)
    if (prev && Math.abs(prev - height) < 2) return

    const next = new Map(heightMap.value)
    next.set(id, height)
    heightMap.value = next

    if (shouldFollowBottom.value) {
      nextTick(() => {
        const container = containerRef.value
        if (!container) return
        container.scrollTop = container.scrollHeight
      })
    }
  }

  const getItemHeight = (index: number) => {
    const message = messages.value[index]
    if (!message) return estimateHeight
    return heightMap.value.get(message.id) ?? estimateHeight
  }

  const range = computed(() => {
    return calculateVirtualRange({
      itemCount: messages.value.length,
      scrollTop: scrollTop.value,
      viewportHeight: viewportHeight.value,
      overscan,
      estimateHeight,
      getItemHeight,
    })
  })

  const visibleMessages = computed(() => {
    if (range.value.endIndex < range.value.startIndex) return []
    return messages.value.slice(range.value.startIndex, range.value.endIndex + 1)
  })

  const paddingTop = computed(() => range.value.paddingTop)
  const paddingBottom = computed(() => range.value.paddingBottom)

  const scrollToBottom = () => {
    const container = containerRef.value
    if (!container) return
    container.scrollTop = container.scrollHeight
    measureViewport()
  }

  watch(
    () => messages.value.length,
    async (curr, prev) => {
      // prune removed message heights to prevent stale map growth
      if (curr < prev) {
        const idSet = new Set(messages.value.map((message) => message.id))
        const next = new Map<number, number>()
        heightMap.value.forEach((height, id) => {
          if (idSet.has(id)) next.set(id, height)
        })
        heightMap.value = next
      }

      await nextTick()
      if (shouldFollowBottom.value) {
        scrollToBottom()
      } else {
        measureViewport()
      }
    },
  )

  watch(
    messages,
    async () => {
      await nextTick()
      measureViewport()
    },
    { deep: true },
  )

  onMounted(() => {
    measureViewport()
    window.addEventListener('resize', measureViewport)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', measureViewport)
  })

  return {
    onScroll,
    paddingTop,
    paddingBottom,
    visibleMessages,
    setItemHeight,
    scrollToBottom,
    measureViewport,
  }
}
