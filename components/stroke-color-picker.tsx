"use client"

interface StrokeColorPickerProps {
  color: string
  setColor: (color: string) => void
}

const STROKE_COLORS = [
  "#000000", // Black
  "#E03131", // Red
  "#2F9E44", // Green
  "#1971C2", // Blue
  "#F59F00", // Orange
  "#7950F2", // Purple
]

export function StrokeColorPicker({ color, setColor }: StrokeColorPickerProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {STROKE_COLORS.map((c) => (
        <button
          key={c}
          onClick={() => setColor(c)}
          className={`h-7 w-7 rounded border-2 transition-all hover:scale-110 ${
            color.toUpperCase() === c.toUpperCase()
              ? "border-blue-500 scale-110 shadow-sm"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
          }`}
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
    </div>
  )
}
