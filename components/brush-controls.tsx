"use client"

interface BrushControlsProps {
  brushSize: number
  setBrushSize: (size: number) => void
}

const STROKE_WIDTHS = [1, 2, 4, 8, 12]

export function BrushControls({ brushSize, setBrushSize }: BrushControlsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {STROKE_WIDTHS.map((width) => (
        <button
          key={width}
          onClick={() => setBrushSize(width)}
          className={`h-9 w-9 flex items-center justify-center rounded-md transition-all ${
            brushSize === width
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
          title={`${width}px stroke`}
        >
          <div
            className="rounded-full bg-current"
            style={{
              width: `${Math.min(width * 2, 16)}px`,
              height: `${Math.min(width * 2, 16)}px`,
            }}
          />
        </button>
      ))}
    </div>
  )
}
