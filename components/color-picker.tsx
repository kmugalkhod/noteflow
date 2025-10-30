"use client"
import { Palette } from "lucide-react"

interface ColorPickerProps {
  color: string
  setColor: (color: string) => void
}

const PRESET_COLORS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#FFC0CB",
  "#A52A2A",
]

export function ColorPicker({ color, setColor }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <Palette className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-14 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors shadow-sm"
          title="Pick a color"
        />
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 shadow-sm">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              onClick={() => setColor(presetColor)}
              className={`h-7 w-7 rounded-lg border-2 transition-all hover:scale-110 ${
                color.toUpperCase() === presetColor.toUpperCase()
                  ? "border-blue-500 shadow-md scale-110"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
              }`}
              style={{ backgroundColor: presetColor }}
              title={presetColor}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
