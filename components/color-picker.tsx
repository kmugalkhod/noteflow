"use client"

interface ColorPickerProps {
  color: string
  setColor: (color: string) => void
}

const PRESET_COLORS = [
  "#000000", // Black
  "#343A40", // Dark Gray
  "#E03131", // Red
  "#2F9E44", // Green
  "#1971C2", // Blue
  "#F59F00", // Orange
  "#7950F2", // Purple
]

export function ColorPicker({ color, setColor }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-1.5">
      {PRESET_COLORS.map((presetColor) => (
        <button
          key={presetColor}
          onClick={() => setColor(presetColor)}
          className={`h-6 w-6 rounded-md border-2 transition-all hover:scale-110 ${
            color.toUpperCase() === presetColor.toUpperCase()
              ? "border-blue-500 scale-110 shadow-sm"
              : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
          }`}
          style={{ backgroundColor: presetColor }}
          title={presetColor}
        />
      ))}

      {/* Custom Color Picker */}
      <div className="relative ml-1">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-6 w-6 rounded-md cursor-pointer border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all"
          title="Custom color"
        />
      </div>
    </div>
  )
}
