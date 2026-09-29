import { useEffect } from 'react'

/** Обработчик нажатия клавиши. Получает нижний регистр клавиши. */
export type HotkeyHandler = (key: string) => void

/** Ввод имеет приоритет над горячими клавишами. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

/**
 * Горячие клавиши приложения: window keydown, клавиши R/O/V
 * сопоставляются с инструментами через TOOL_SHORTCUTS из
 * src/constants/tools.ts. Сочетания с Ctrl/Meta/Alt не перехватываются,
 * чтобы не ломать системные и браузерные сочетания.
 */
export function useHotkeys(handler: HotkeyHandler) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isEditableTarget(e.target)) return
      handler(e.key.toLowerCase())
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handler])
}
