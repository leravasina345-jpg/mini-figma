import { useCallback, useEffect, useRef, useState } from 'react'
import type { Point, Size } from '../types/shape'
import { clampScale, type Viewport } from '../utils/geometry'

export interface ViewportController {
  /** Текущее состояние камеры (передаётся в geometry). */
  view: Viewport
  /** Зажат ли пробел (панорамирование доступно). */
  spaceDown: boolean
  /** Идёт ли сейчас панорамирование. */
  isPanning: boolean
  /** Начать панорамирование в экранной точке. */
  beginPan: (screen: Point) => void
  /** Продолжить панорамирование в новой экранной точке. */
  panBy: (screen: Point) => void
  /** Остановить панорамирование. */
  endPan: () => void
  /** Зум колесом в экранной точке, чтобы точка под курсором не уезжала. */
  zoomAt: (screen: Point, size: Size, deltaY: number) => void
  /** Сброс камеры: масштаб 100%, панорамирование 0 (мир в центре канваса). */
  reset: () => void
}

/**
 * Камера холста: панорамирование (пробел + мышь) и зум колесом.
 * Хук не знает про DOM — он работает с экранными координатами мыши
 * и простым состоянием Viewport.
 */
export function useViewport(): ViewportController {
  const [view, setView] = useState<Viewport>({ scale: 1, panX: 0, panY: 0 })
  const [spaceDown, setSpaceDown] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef<{ screen: Point; pan: Point } | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) setSpaceDown(true)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpaceDown(false)
        setIsPanning(false)
        panStartRef.current = null
      }
    }
    const onBlur = () => {
      setSpaceDown(false)
      setIsPanning(false)
      panStartRef.current = null
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  const beginPan = useCallback(
    (screen: Point) => {
      if (!spaceDown) return
      setIsPanning(true)
      panStartRef.current = { screen, pan: { x: view.panX, y: view.panY } }
    },
    [spaceDown, view.panX, view.panY],
  )

  const panBy = useCallback((screen: Point) => {
    const start = panStartRef.current
    if (!start) return
    setView((v) => ({
      ...v,
      panX: start.pan.x + (screen.x - start.screen.x),
      panY: start.pan.y + (screen.y - start.screen.y),
    }))
  }, [])

  const endPan = useCallback(() => {
    setIsPanning(false)
    panStartRef.current = null
  }, [])

  const zoomAt = useCallback((screen: Point, size: Size, deltaY: number) => {
    setView((v) => {
      const newScale = clampScale(v.scale * Math.exp(-deltaY * 0.001))
      if (newScale === v.scale) return v
      // Точка под курсором в координатах холста остаётся на месте:
      const worldX = (screen.x - size.width / 2 - v.panX) / v.scale
      const worldY = (screen.y - size.height / 2 - v.panY) / v.scale
      return {
        scale: newScale,
        panX: screen.x - size.width / 2 - worldX * newScale,
        panY: screen.y - size.height / 2 - worldY * newScale,
      }
    })
  }, [])

  const reset = useCallback(() => {
    setView({ scale: 1, panX: 0, panY: 0 })
  }, [])

  return { view, spaceDown, isPanning, beginPan, panBy, endPan, zoomAt, reset }
}