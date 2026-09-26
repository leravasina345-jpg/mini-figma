import type { Point, Size } from '../types/shape'

/** Состояние камеры: панорамирование (pan) и масштаб (scale). */
export interface Viewport {
  scale: number
  /** Сдвиг в экранных пикселях относительно центра канваса. */
  panX: number
  panY: number
}

export const MIN_SCALE = 0.1
export const MAX_SCALE = 4

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

/**
 * Экранные координаты мыши (относительно верхнего левого угла канваса)
 * в координаты холста. Без этого пересчёта фигуры «уезжают» от курсора
 * при зуме и панорамировании: мы всегда делим на scale и вычитаем pan.
 */
export function screenToCanvas(screen: Point, size: Size, viewport: Viewport): Point {
  return {
    x: (screen.x - size.width / 2 - viewport.panX) / viewport.scale,
    y: (screen.y - size.height / 2 - viewport.panY) / viewport.scale,
  }
}

/** Обратный пересчёт: канвас → экран (для отрисовки/курсора). */
export function canvasToScreen(canvas: Point, size: Size, viewport: Viewport): Point {
  return {
    x: canvas.x * viewport.scale + size.width / 2 + viewport.panX,
    y: canvas.y * viewport.scale + size.height / 2 + viewport.panY,
  }
}