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
    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1.5 z-20">
      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
      >
        <RotateCw className="h-4 w-4" />
      </Button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

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
        className="px-2 py-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors min-w-[3rem] text-center"
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
