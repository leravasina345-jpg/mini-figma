import { useEffect, useRef, useState } from 'react'
import type { ViewportController } from '../hooks/useViewport'
import type { Point, Shape as ShapeType, ShapeType as ShapeKind, Size, Tool } from '../types/shape'
import { screenToCanvas, type Viewport } from '../utils/geometry'
import { Shape } from './Shape'

/** Шаг сетки в координатах холста. */
const GRID_STEP = 16

interface CanvasProps {
  shapes: ShapeType[]
  draft: ShapeType | null
  camera: ViewportController
  activeTool: Tool
  onSelect: (id: string | null) => void
  onBeginDrag: (screen: Point, size: Size, viewport: Viewport, id: string) => void
  onDragBy: (screen: Point, size: Size, viewport: Viewport) => void
  onEndDrag: () => void
  onBeginDraw: (screen: Point, size: Size, viewport: Viewport, type: ShapeKind) => void
  onUpdateDraft: (screen: Point, size: Size, viewport: Viewport) => void
  onCommitDraft: () => void
  onCancelDraft: () => void
}

/** Верхняя фигура (последняя в списке), содержащая точку (в координатах холста). */
function pickShape(shapes: ShapeType[], point: Point): ShapeType | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i]
    if (
      point.x >= s.position.x &&
      point.x <= s.position.x + s.size.width &&
      point.y >= s.position.y &&
      point.y <= s.position.y + s.size.height
    ) {
      return s
    }
  }
  return null
}

/**
 * Холст на весь экран. Рисует сетку (движется вместе с камерой),
 * обрабатывает мышь: пан пробелом, зум колесом, рисование фигур
 * перетаскиванием и перетаскивание выделенных фигур.
 */
export function Canvas({
  shapes,
  draft,
  camera,
  activeTool,
  onSelect,
  onBeginDrag,
  onDragBy,
  onEndDrag,
  onBeginDraw,
  onUpdateDraft,
  onCommitDraft,
  onCancelDraft,
}: CanvasProps) {
  const ref = useRef<HTMLDivElement>(null)
  const sizeRef = useRef<Size>({ width: 0, height: 0 })
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  const drawingRef = useRef(false)
  /** Перетаскиваем ли сейчас выделенную фигуру (инструмент select). */
  const draggingShapeRef = useRef(false)

  // Следим за размером холста — нужен geometry для пересчёта координат.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect
      sizeRef.current = { width: rect.width, height: rect.height }
      setSize(sizeRef.current)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { view, spaceDown, isPanning, beginPan, panBy, endPan, zoomAt } = camera

  // wheel вешаем нативно с { passive: false }, чтобы иметь право preventDefault.
  // Зависимость — стабильный zoomAt: весь объект camera меняется каждый рендер
  // и заставлял бы переподписывать слушатель без нужды.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      zoomAt({ x: e.clientX - rect.left, y: e.clientY - rect.top }, sizeRef.current, e.deltaY)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])
  const gridSize = GRID_STEP * view.scale

  const screenFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const screen: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const boxSize: Size = { width: rect.width, height: rect.height }
    return { screen, boxSize }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const { screen, boxSize } = screenFromEvent(e)
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)

    if (spaceDown) {
      beginPan(screen)
      return
    }

    if (activeTool !== 'select') {
      drawingRef.current = true
      onBeginDraw(screen, boxSize, view, activeTool)
      return
    }

    // select: тянем фигуру от точки попадания, по пустому месту — снять выделение.
    const hit = pickShape(shapes, screenToCanvas(screen, boxSize, view))
    if (hit) {
      onSelect(hit.id)
      draggingShapeRef.current = true
      onBeginDrag(screen, boxSize, view, hit.id)
    } else {
      onSelect(null)
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { screen, boxSize } = screenFromEvent(e)
    if (isPanning) {
      panBy(screen)
      return
    }
    if (drawingRef.current) {
      onUpdateDraft(screen, boxSize, view)
      return
    }
    if (draggingShapeRef.current) {
      onDragBy(screen, boxSize, view)
    }
  }

  const handlePointerUp = () => {
    if (isPanning) {
      endPan()
      return
    }
    if (drawingRef.current) {
      drawingRef.current = false
      onCommitDraft()
      return
    }
    if (draggingShapeRef.current) {
      draggingShapeRef.current = false
      onEndDrag()
    }
  }

  const handlePointerCancel = () => {
    drawingRef.current = false
    draggingShapeRef.current = false
    onCancelDraft()
    onEndDrag()
    endPan()
  }

  const cursor = isPanning
    ? 'cursor-grabbing'
    : spaceDown
      ? 'cursor-grab'
      : activeTool === 'select'
        ? 'cursor-default'
        : 'cursor-crosshair'

  return (
    <div
      ref={ref}
      className={`absolute inset-0 overflow-hidden select-none ${cursor}`}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* Сетка: backgroundPosition сдвигается вместе с pan, шаг масштабируется. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${size.width / 2 + view.panX}px ${size.height / 2 + view.panY}px`,
        }}
      />
      {/* Слой фигур: мир переводится в экран одним transform (зум/пан). */}
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${size.width / 2 + view.panX}px, ${size.height / 2 + view.panY}px) scale(${view.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {shapes.map((shape) => (
          <Shape key={shape.id} shape={shape} scale={view.scale} />
        ))}
        {draft && <Shape shape={draft} scale={view.scale} preview />}
      </div>
    </div>
  )
}