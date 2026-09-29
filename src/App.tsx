import { useCallback, useState } from 'react'
import { Canvas } from './components/Canvas'
import { LayersPanel } from './components/LayersPanel'
import { PropertiesPanel } from './components/PropertiesPanel'
import { Toolbar } from './components/Toolbar'
import { TOOL_SHORTCUTS } from './constants/tools'
import { useHotkeys } from './hooks/useHotkeys'
import { useShapes } from './hooks/useShapes'
import { useViewport } from './hooks/useViewport'
import type { Tool } from './types/shape'

export default function App() {
  const camera = useViewport()
  const {
    shapes,
    selectedId,
    draft,
    selectShape,
    updateShape,
    beginDrag,
    dragBy,
    endDrag,
    beginDraw,
    updateDraft,
    commitDraft,
    cancelDraft,
  } = useShapes()
  const [activeTool, setActiveTool] = useState<Tool>('select')

  const handleHotkey = useCallback((key: string) => {
    const tool = TOOL_SHORTCUTS[key]
    if (tool) setActiveTool(tool)
  }, [])

  useHotkeys(handleHotkey)

  const selectedShape = shapes.find((s) => s.id === selectedId) ?? null

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950">
      <Canvas
        shapes={shapes}
        draft={draft}
        camera={camera}
        activeTool={activeTool}
        onSelect={selectShape}
        onBeginDrag={beginDrag}
        onDragBy={dragBy}
        onEndDrag={endDrag}
        onBeginDraw={beginDraw}
        onUpdateDraft={updateDraft}
        onCommitDraft={commitDraft}
        onCancelDraft={cancelDraft}
      />
      <Toolbar activeTool={activeTool} onChange={setActiveTool} />

      {/* Правая колонка: свойства + слои. Контейнер пропускает клики в канвас. */}
      <div className="pointer-events-none absolute top-0 right-0 z-10 flex h-full w-64 flex-col gap-3 p-3">
        <PropertiesPanel
          shape={selectedShape}
          onFillChange={(fill) => {
            if (selectedId) updateShape(selectedId, { fill })
          }}
        />
        <LayersPanel shapes={shapes} selectedId={selectedId} onSelect={selectShape} />
      </div>

      {/* Индикатор зума */}
      <div className="absolute bottom-4 left-4 z-10 rounded-md bg-zinc-800/90 px-2 py-1 font-mono text-xs text-zinc-300 shadow">
        {Math.round(camera.view.scale * 100)}%
      </div>
    </div>
  )
}