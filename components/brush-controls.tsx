"use client"

import { Brush } from "lucide-react"

interface BrushControlsProps {
  brushSize: number
  setBrushSize: (size: number) => void
}

export function BrushControls({ brushSize, setBrushSize }: BrushControlsProps) {
  return (
    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm">
      <Brush className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      <input
        type="range"
        min="1"
        max="50"
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
        className="w-28 h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(brushSize / 50) * 100}%, #e5e7eb ${(brushSize / 50) * 100}%, #e5e7eb 100%)`
        }}
        title="Brush size"
      />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10 text-right">{brushSize}px</span>
    </div>
  )
}
