"use client"

import { Button } from "@/components/ui/button"
import { Pen, Eraser, Minus, Square, Circle, RotateCcw, RotateCw, Trash2 } from "lucide-react"

interface ToolbarProps {
  tool: "pen" | "eraser" | "line" | "rectangle" | "circle"
  setTool: (tool: "pen" | "eraser" | "line" | "rectangle" | "circle") => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  canUndo: boolean
  canRedo: boolean
}

export function Toolbar({ tool, setTool, onUndo, onRedo, onClear, canUndo, canRedo }: ToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Drawing Tools */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 shadow-sm">
        <Button
          size="sm"
          variant={tool === "pen" ? "default" : "ghost"}
          onClick={() => setTool("pen")}
          title="Pen (P)"
          className={`h-10 w-10 p-0 rounded-lg transition-all ${
            tool === "pen" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md" : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Pen className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={tool === "eraser" ? "default" : "ghost"}
          onClick={() => setTool("eraser")}
          title="Eraser (E)"
          className={`h-10 w-10 p-0 rounded-lg transition-all ${
            tool === "eraser" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md" : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={tool === "line" ? "default" : "ghost"}
          onClick={() => setTool("line")}
          title="Line (L)"
          className={`h-10 w-10 p-0 rounded-lg transition-all ${
            tool === "line" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md" : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={tool === "rectangle" ? "default" : "ghost"}
          onClick={() => setTool("rectangle")}
          title="Rectangle (R)"
          className={`h-10 w-10 p-0 rounded-lg transition-all ${
            tool === "rectangle" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md" : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={tool === "circle" ? "default" : "ghost"}
          onClick={() => setTool("circle")}
          title="Circle (C)"
          className={`h-10 w-10 p-0 rounded-lg transition-all ${
            tool === "circle" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md" : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Circle className="h-4 w-4" />
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-300 dark:bg-gray-700" />

      {/* History Controls */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="h-10 w-10 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="h-10 w-10 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          title="Clear Canvas"
          className="h-10 w-10 p-0 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
