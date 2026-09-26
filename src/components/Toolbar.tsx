import { TOOLS } from '../constants/tools'
import type { Tool } from '../types/shape'

interface ToolbarProps {
  activeTool: Tool
  onChange: (tool: Tool) => void
}

/**
 * Панель инструментов слева. Пока каркас: кнопки есть,
 * переключение инструмента работает (активный подсвечен).
 */
export function Toolbar({ activeTool, onChange }: ToolbarProps) {
  return (
    <aside className="absolute top-1/2 left-3 z-20 flex -translate-y-1/2 flex-col items-center gap-1 rounded-xl bg-zinc-800/80 p-1.5 shadow-xl backdrop-blur">
      {TOOLS.map((tool) => {
        const active = tool.id === activeTool
        return (
          <button
            key={tool.id}
            type="button"
            title={`${tool.label} (${tool.shortcut})`}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-base leading-none transition-colors ${
              active
                ? 'bg-blue-600 text-white'
                : 'text-zinc-300 hover:bg-zinc-700/70 hover:text-white'
            }`}
            onClick={() => onChange(tool.id)}
          >
            {tool.icon}
          </button>
        )
      })}
    </aside>
  )
}