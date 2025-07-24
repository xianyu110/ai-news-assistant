import { useState, useEffect, useCallback, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactNode
  overscan?: number
  className?: string
}

export default function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
}: VirtualizedListProps<T>) {
  const [containerHeight, setContainerHeight] = useState(window.innerHeight - 200)
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      const viewportHeight = window.innerHeight
      const isMobile = window.innerWidth < 768
      const headerHeight = isMobile ? 64 : 0 // Header height on mobile
      const padding = 200 // Additional padding for other elements
      const newHeight = Math.max(400, viewportHeight - headerHeight - padding)
      setContainerHeight(newHeight)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  // Simple fallback for small lists
  if (items.length < 20) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={index}>
            {renderItem({ item, index })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: `${containerHeight}px` }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem({ item, index: startIndex + index })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}