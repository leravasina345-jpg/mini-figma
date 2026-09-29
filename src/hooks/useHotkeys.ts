import { useEffect } from 'react'
import { isEditableTarget } from '../utils/dom'

/** Обработчик нажатия клавиши. Получает нижний регистр клавиши. */
export type HotkeyHandler = (key: string) => void

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
