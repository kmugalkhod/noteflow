"use client"

import { StrokeColorPicker } from "./stroke-color-picker"
import { OpacitySlider } from "./opacity-slider"
import { FontControls } from "./font-controls"
import { LayersControl } from "./layers-control"
import { BrushControls } from "./brush-controls"

type Tool = "select" | "hand" | "pen" | "eraser" | "line" | "rectangle" | "diamond" | "circle" | "arrow" | "text" | "image"

interface PropertySidebarProps {
  tool: Tool
  isOpen: boolean

  // Drawing properties
  strokeColor: string
  setStrokeColor: (color: string) => void
  fillColor: string
  setFillColor: (color: string) => void
  opacity: number
  setOpacity: (opacity: number) => void
  brushSize: number
  setBrushSize: (size: number) => void

  // Font properties
  fontFamily: "handwritten" | "normal" | "code" | "serif"
  setFontFamily: (family: "handwritten" | "normal" | "code" | "serif") => void
  fontSize: "small" | "medium" | "large" | "xlarge"
  setFontSize: (size: "small" | "medium" | "large" | "xlarge") => void
  textAlign: "left" | "center" | "right"
  setTextAlign: (align: "left" | "center" | "right") => void
}

export function PropertySidebar({
  tool,
  isOpen,
  strokeColor,
  setStrokeColor,
  fillColor,
  setFillColor,
  opacity,
  setOpacity,
  brushSize,
  setBrushSize,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  textAlign,
  setTextAlign,
}: PropertySidebarProps) {
  // Don't show sidebar for select/hand tools
  if (tool === "select" || tool === "hand") {
    return null
  }

  const isTextTool = tool === "text"
  const isShapeTool = ["rectangle", "diamond", "circle", "arrow"].includes(tool)
  const isDrawingTool = ["pen", "line", "eraser"].includes(tool)

  return (
    <div
      className={`absolute left-6 top-20 bottom-6 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 overflow-y-auto transition-all duration-300 ring-1 ring-black/5 ${
        isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      }`}
    >
      <div className="p-5 space-y-6">
        {/* Stroke Color - Show for all tools */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Stroke</label>
          <StrokeColorPicker color={strokeColor} setColor={setStrokeColor} />
        </div>

        {/* Stroke Width - Show for drawing tools */}
        {(isDrawingTool || isShapeTool) && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Stroke width</label>
            <BrushControls brushSize={brushSize} setBrushSize={setBrushSize} />
          </div>
        )}

        {/* Text/Font Controls - Only for text tool */}
        {isTextTool && (
          <FontControls
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
            textAlign={textAlign}
            setTextAlign={setTextAlign}
          />
        )}

        {/* Fill Color - Only for shapes */}
        {isShapeTool && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Background</label>
            <div className="space-y-1.5">
              <button
                onClick={() => setFillColor("transparent")}
                className={`w-full h-10 rounded-md border-2 transition-all hover:scale-105 flex items-center justify-between px-3 ${
                  fillColor === "transparent"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
                <span className="text-sm font-medium text-foreground">Transparent</span>
              </button>
              <button
                onClick={() => setFillColor("#ffffff")}
                className={`w-full h-10 rounded-md border-2 transition-all hover:scale-105 flex items-center justify-between px-3 ${
                  fillColor === "#ffffff"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600 bg-white" />
                <span className="text-sm font-medium text-foreground">Solid</span>
              </button>
            </div>
          </div>
        )}

        {/* Opacity */}
        <OpacitySlider opacity={opacity} setOpacity={setOpacity} />

        {/* Layers */}
        <LayersControl />
      </div>
    </div>
  )
}
