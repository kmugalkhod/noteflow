"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus, RotateCcw, RotateCw } from "lucide-react"

interface ZoomControlsProps {
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function ZoomControls({ onUndo, onRedo, canUndo, canRedo }: ZoomControlsProps) {
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 25))
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  return (
    <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-20 ring-1 ring-black/5">
      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
      >
        <RotateCw className="h-4 w-4" />
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />

      {/* Zoom Controls */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        title="Zoom out"
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <button
        onClick={handleResetZoom}
        className="px-3 py-1.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors min-w-[3.5rem] text-center"
      >
        {zoom}%
      </button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        title="Zoom in"
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
