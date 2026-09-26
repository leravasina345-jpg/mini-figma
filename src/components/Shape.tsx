import type { CSSProperties } from 'react'
import type { Shape as ShapeType } from '../types/shape'

const SELECTION_COLOR = '#3b82f6'

interface ShapeProps {
  shape: ShapeType
  /** Текущий зум: рамка и маркеры компенсируются, чтобы не расплываться при зуме. */
  scale: number
  /** Предпросмотр незавершённой фигуры при перетаскивании. */
  preview?: boolean
}

/** Позиции 8 маркеров выделения вокруг рамки фигуры. */
function markerStyles(half: number): CSSProperties[] {
  return [
    { left: -half, top: -half },
    { right: -half, top: -half },
    { right: -half, bottom: -half },
    { left: -half, bottom: -half },
    { left: `calc(50% - ${half}px)`, top: -half },
    { right: -half, top: `calc(50% - ${half}px)` },
    { left: `calc(50% - ${half}px)`, bottom: -half },
    { left: -half, top: `calc(50% - ${half}px)` },
  ]
}

/**
 * Рендер одной фигуры с рамкой выделения и маркерами.
 * Координаты в системе холста — слой в Canvas переводит их в экран через
 * зум/пан, поэтому фигура масштабируется вместе с канвасом; рамка и маркеры
 * делятся на scale, чтобы на экране оставаться постоянного размера.
 */
export function Shape({ shape, scale, preview }: ShapeProps) {
  const inv = 1 / scale
  const selected = shape.selected && !preview

  return (
    <div
      className="absolute"
      style={{
        left: shape.position.x,
        top: shape.position.y,
        width: shape.size.width,
        height: shape.size.height,
      }}
    >
      {/* Тело фигуры */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          backgroundColor: shape.fill,
          border: `${1.5 * inv}px solid rgba(59,130,246,0.55)`,
          borderRadius: shape.type === 'ellipse' ? '50%' : `${2 * inv}px`,
          opacity: preview ? 0.6 : 1,
          cursor: 'move',
        }}
      />

      {selected && (
        <>
          {/* Рамка выделения */}
          <div
            className="absolute"
            style={{
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              border: `${inv}px dashed ${SELECTION_COLOR}`,
              pointerEvents: 'none',
            }}
          />
          {/* Маркеры (готовы под будущий ресайз, пока декоративные) */}
          {markerStyles(4 * inv).map((style, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: `${8 * inv}px`,
                height: `${8 * inv}px`,
                backgroundColor: '#ffffff',
                border: `${1.5 * inv}px solid ${SELECTION_COLOR}`,
                pointerEvents: 'none',
                ...style,
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}