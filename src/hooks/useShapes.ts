import { useCallback, useEffect, useRef, useState } from 'react'
import type { Point, Shape, ShapeType, Size } from '../types/shape'
import { screenToCanvas, type Viewport } from '../utils/geometry'

/** Цвет по умолчанию для новой фигуры. */
const DEFAULT_FILL = '#4f8dff'

/** ref-дубль списка: beginDrag находит исходную позицию без гонок с рендером. */
function useLatest<T>(value: T) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}

/**
 * Состояние фигур: список, добавление, изменение, выделение, перетаскивание.
 * Сюда приходят СКРИН-координаты мыши — пересчёт в координаты холста
 * (с учётом зума/пана) делает utils/geometry.ts, чтобы при зуме фигура
 * не «уезжала» от курсора.
 */
export function useShapes() {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Shape | null>(null)
  const draftRef = useRef<Shape | null>(null)
  const draftStartRef = useRef<Point | null>(null)
  const shapesRef = useLatest<Shape[]>(shapes)

  /** Активное перетаскивание фигуры: id, точка старта и исходная позиция. */
  const dragRef = useRef<{ id: string; start: Point; original: Point } | null>(null)

  const setDraftBoth = useCallback((shape: Shape | null) => {
    draftRef.current = shape
    setDraft(shape)
  }, [])

  const addShape = useCallback((input: Omit<Shape, 'id' | 'selected'>) => {
    const id = crypto.randomUUID()
    setShapes((prev) => [...prev, { ...input, id, selected: false }])
    setSelectedId(id)
  }, [])

  const updateShape = useCallback((id: string, patch: Partial<Omit<Shape, 'id'>>) => {
    setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const selectShape = useCallback((id: string | null) => {
    setSelectedId(id)
    setShapes((prev) => prev.map((s) => ({ ...s, selected: s.id === id })))
  }, [])

  /** Начать перетаскивание выделенной фигуры: фиксируем старт в канвас-координатах. */
  const beginDrag = useCallback((screen: Point, size: Size, viewport: Viewport, id: string) => {
    const shape = shapesRef.current.find((s) => s.id === id)
    if (!shape) return
    dragRef.current = {
      id,
      start: screenToCanvas(screen, size, viewport),
      original: { ...shape.position },
    }
  }, [])

  /** Продолжить перетаскивание: позиция = исходная + сдвиг от старта. */
  const dragBy = useCallback((screen: Point, size: Size, viewport: Viewport) => {
    const drag = dragRef.current
    if (!drag) return
    const current = screenToCanvas(screen, size, viewport)
    const dx = current.x - drag.start.x
    const dy = current.y - drag.start.y
    setShapes((prev) =>
      prev.map((s) =>
        s.id === drag.id
          ? { ...s, position: { x: drag.original.x + dx, y: drag.original.y + dy } }
          : s,
      ),
    )
  }, [])

  /** Закончить перетаскивание. */
  const endDrag = useCallback(() => {
    dragRef.current = null
  }, [])

  /** Начать перетаскивание для рисования: фиксируем старт в канвас-координатах. */
  const beginDraw = useCallback(
    (screen: Point, size: Size, viewport: Viewport, type: ShapeType) => {
      const start = screenToCanvas(screen, size, viewport)
      draftStartRef.current = start
      setDraftBoth({
        id: 'draft',
        type,
        position: start,
        size: { width: 0, height: 0 },
        fill: DEFAULT_FILL,
        selected: false,
      })
    },
    [setDraftBoth],
  )

  /** Продолжить рисование: пересчитываем размер (в т.ч. при тянем влево/вверх). */
  const updateDraft = useCallback(
    (screen: Point, size: Size, viewport: Viewport) => {
      const start = draftStartRef.current
      const prev = draftRef.current
      if (!start || !prev) return
      const current = screenToCanvas(screen, size, viewport)
      setDraftBoth({
        ...prev,
        position: {
          x: Math.min(start.x, current.x),
          y: Math.min(start.y, current.y),
        },
        size: {
          width: Math.abs(current.x - start.x),
          height: Math.abs(current.y - start.y),
        },
      })
    },
    [setDraftBoth],
  )

  /** Завершить рисование: фигура попадает в список. Клик без размера игнорится. */
  const commitDraft = useCallback(() => {
    const d = draftRef.current
    draftStartRef.current = null
    if (!d || d.size.width <= 0 || d.size.height <= 0) {
      setDraftBoth(null)
      return null
    }
    const shape: Shape = { ...d, id: crypto.randomUUID(), selected: true }
    setShapes((prev) => [...prev, shape])
    setSelectedId(shape.id)
    setDraftBoth(null)
    return shape
  }, [setDraftBoth])

  /** Отменить незавершённую фигуру (например, pointercancel). */
  const cancelDraft = useCallback(() => {
    draftStartRef.current = null
    setDraftBoth(null)
  }, [setDraftBoth])

  return {
    shapes,
    selectedId,
    draft,
    addShape,
    updateShape,
    selectShape,
    beginDrag,
    dragBy,
    endDrag,
    beginDraw,
    updateDraft,
    commitDraft,
    cancelDraft,
  }
}