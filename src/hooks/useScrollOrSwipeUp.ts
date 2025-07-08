import { useEffect, useRef } from 'react'

const useScrollOrSwipeUp = (use: boolean, onWheelOrSwipeUp: () => void) => {
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef(0)

  const handleWheel = (event: Event) => {
    const wheelEvent = event as WheelEvent
    if (wheelEvent.deltaY > 0) {
      onWheelOrSwipeUp()
    }
  }

  const handleTouchStart = (event: TouchEvent) => {
    touchStartY.current = event.touches[0].clientY
  }

  const handleTouchEnd = (event: TouchEvent) => {
    touchEndY.current = event.changedTouches[0].clientY
    if (touchStartY.current - touchEndY.current > 50) {
      onWheelOrSwipeUp()
    }
  }

  useEffect(() => {
    if (use) {
      window.addEventListener('wheel', handleWheel)
      window.addEventListener('touchstart', handleTouchStart, { passive: true })
      window.addEventListener('touchend', handleTouchEnd, { passive: true })
    }

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [use, onWheelOrSwipeUp])
}

export default useScrollOrSwipeUp
