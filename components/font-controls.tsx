"use client"

import { Paintbrush, Type, Code, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

interface FontControlsProps {
  fontFamily: "handwritten" | "normal" | "code" | "serif"
  setFontFamily: (family: "handwritten" | "normal" | "code" | "serif") => void
  fontSize: "small" | "medium" | "large" | "xlarge"
  setFontSize: (size: "small" | "medium" | "large" | "xlarge") => void
  textAlign: "left" | "center" | "right"
  setTextAlign: (align: "left" | "center" | "right") => void
}

const FONT_FAMILIES = [
  { value: "handwritten" as const, label: "Handwritten", icon: Paintbrush },
  { value: "normal" as const, label: "Normal", icon: Type },
  { value: "code" as const, label: "Code", icon: Code },
  { value: "serif" as const, label: "Serif", icon: Type },
]

const FONT_SIZES = [
  { value: "small" as const, label: "S" },
  { value: "medium" as const, label: "M" },
  { value: "large" as const, label: "L" },
  { value: "xlarge" as const, label: "XL" },
]

const TEXT_ALIGNS = [
  { value: "left" as const, icon: AlignLeft },
  { value: "center" as const, icon: AlignCenter },
  { value: "right" as const, icon: AlignRight },
]

export function FontControls({
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  textAlign,
  setTextAlign,
}: FontControlsProps) {
  return (
    <div className="space-y-4">
      {/* Font Family */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Font family</label>
        <div className="grid grid-cols-4 gap-1">
          {FONT_FAMILIES.map((font) => {
            const Icon = font.icon
            const isActive = fontFamily === font.value
            return (
              <button
                key={font.value}
                onClick={() => setFontFamily(font.value)}
                className={`h-10 flex items-center justify-center rounded-md border transition-all ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title={font.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Font size</label>
        <div className="grid grid-cols-4 gap-1">
          {FONT_SIZES.map((size) => {
            const isActive = fontSize === size.value
            return (
              <button
                key={size.value}
                onClick={() => setFontSize(size.value)}
                className={`h-10 flex items-center justify-center rounded-md border font-medium transition-all ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {size.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Text Align */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Text align</label>
        <div className="grid grid-cols-3 gap-1">
          {TEXT_ALIGNS.map((align) => {
            const Icon = align.icon
            const isActive = textAlign === align.value
            return (
              <button
                key={align.value}
                onClick={() => setTextAlign(align.value)}
                className={`h-10 flex items-center justify-center rounded-md border transition-all ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
