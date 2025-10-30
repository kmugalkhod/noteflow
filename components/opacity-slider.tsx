"use client"

interface OpacitySliderProps {
  opacity: number
  setOpacity: (opacity: number) => void
}

export function OpacitySlider({ opacity, setOpacity }: OpacitySliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Opacity</span>
        <span className="text-xs font-medium text-foreground">{opacity}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={opacity}
        onChange={(e) => setOpacity(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${opacity}%, #e5e7eb ${opacity}%, #e5e7eb 100%)`,
        }}
      />
    </div>
  )
}
