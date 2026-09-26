import { useMemo } from 'react'
import type { Shape } from '../types/shape'

interface LayersPanelProps {
  shapes: Shape[]
  selectedId: string | null
  onSelect: (id: string) => void
}

/**
 * Список слоёв (фигур): верхняя на холсте — первой в списке.
 * Клик по слою выделяет фигуру на канвасе (onSelect → useShapes.selectShape).
 */
export function LayersPanel({ shapes, selectedId, onSelect }: LayersPanelProps) {
  // Верхиний слой — последний в массиве shapes, в списке показываем его первым.
  const items = useMemo(() => [...shapes].reverse(), [shapes])

  return (
    <section className="pointer-events-auto max-h-64 overflow-y-auto rounded-xl border border-zinc-700/60 bg-zinc-900/90 p-4 shadow-xl backdrop-blur">
      <h2 className="mb-3 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
        Layers
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No layers yet</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((shape, index) => (
            <li key={shape.id}>
              <button
                type="button"
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                  shape.id === selectedId
                    ? 'bg-blue-600/25 text-blue-200'
                    : 'text-zinc-300 hover:bg-zinc-800'
                }`}
                onClick={() => onSelect(shape.id)}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-sm border border-black/20"
                  style={{ backgroundColor: shape.fill }}
                />
                <span className="truncate">
                  {shape.type} {shapes.length - index}
                </span>
                <span className="ml-auto font-mono text-xs text-zinc-500">
                  #{shape.id.slice(0, 4)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}