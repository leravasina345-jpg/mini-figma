import type { Shape } from '../types/shape'

interface PropertiesPanelProps {
  shape: Shape | null
  onFillChange: (fill: string) => void
}

/**
 * Панель свойств выбранной фигуры: читает размеры и меняет цвет заливки.
 * Изменения применяются сразу через updateShape (по id фигуры).
 */
export function PropertiesPanel({ shape, onFillChange }: PropertiesPanelProps) {
  return (
    <section className="rounded-xl border border-zinc-700/60 bg-zinc-900/90 p-4 shadow-xl backdrop-blur">
      <h2 className="mb-3 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
        Properties
      </h2>
      {shape ? (
        <>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-zinc-500">Type</dt>
            <dd className="text-right text-zinc-200">{shape.type}</dd>
            <dt className="text-zinc-500">X</dt>
            <dd className="text-right font-mono text-zinc-200">
              {Math.round(shape.position.x)}
            </dd>
            <dt className="text-zinc-500">Y</dt>
            <dd className="text-right font-mono text-zinc-200">
              {Math.round(shape.position.y)}
            </dd>
            <dt className="text-zinc-500">W</dt>
            <dd className="text-right font-mono text-zinc-200">
              {Math.round(shape.size.width)}
            </dd>
            <dt className="text-zinc-500">H</dt>
            <dd className="text-right font-mono text-zinc-200">
              {Math.round(shape.size.height)}
            </dd>
          </dl>

          <label className="mt-4 flex items-center justify-between gap-3 text-sm">
            <span className="text-zinc-400">Fill</span>
            <span className="flex items-center gap-2">
              <input
                type="color"
                value={shape.fill}
                onChange={(e) => onFillChange(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent p-0"
              />
              <code className="font-mono text-xs text-zinc-400">{shape.fill}</code>
            </span>
          </label>
        </>
      ) : (
        <p className="text-sm text-zinc-500">No object selected</p>
      )}
    </section>
  )
}