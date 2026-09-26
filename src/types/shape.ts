/** Инструмент, выбранный в тулбаре. */
export type Tool = 'select' | 'rectangle' | 'ellipse'

/** Геометрический примитив, который рисует пользователь. */
export type ShapeType = 'rectangle' | 'ellipse'

/** Точка в координатах холста. */
export interface Point {
  x: number
  y: number
}

/** Размер в координатах холста. */
export interface Size {
  width: number
  height: number
}

/**
 * Одна фигура на холсте.
 * position — верхний левый угол в координатах холста (не экрана),
 * size — размер в тех же единицах. Экранные координаты вычисляются
 * в utils/geometry.ts с учётом зумы и панорамирования.
 */
export interface Shape {
  id: string
  type: ShapeType
  position: Point
  size: Size
  /** Цвет заливки. */
  fill: string
  selected: boolean
}