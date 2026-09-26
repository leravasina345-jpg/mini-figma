import { useEffect } from 'react'

/** Обработчик нажатия клавиши. Получает нижний регистр клавиши. */
export type HotkeyHandler = (key: string) => void

/**
 * Заготовка горячих клавиш. Сейчас не подключена — на следующем шаге
 * здесь навесится window keydown/keyup, а клавиши R/O/V сопоставятся
 * с инструментами через TOOL_SHORTCUTS из src/constants/tools.ts.
 */
export function useHotkeys(_handler: HotkeyHandler) {
  useEffect(() => {
    // TODO(шаг 3): подключить обработчики клавиатуры.
    return () => {}
  }, [_handler])
}