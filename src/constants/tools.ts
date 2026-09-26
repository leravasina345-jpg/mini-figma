import type { Tool } from '../types/shape'

/** Описание инструмента для тулбара. */
export interface ToolDefinition {
  id: Tool
  label: string
  /** Клавиша-горячая (регистр не важен). */
  shortcut: string
  /** Простой глиф для кнопки. */
  icon: string
}

/** Список инструментов, порядок = порядок в тулбаре. */
export const TOOLS: ToolDefinition[] = [
  { id: 'select', label: 'Select', shortcut: 'V', icon: '↖' },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: '▭' },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: '◯' },
]

/** Соответствие клавиш инструментам (R/O/V). Меняется в одном месте. */
export const TOOL_SHORTCUTS: Record<string, Tool> = {
  v: 'select',
  r: 'rectangle',
  o: 'ellipse',
}