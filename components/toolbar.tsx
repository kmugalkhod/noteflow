"use client"

import { Button } from "@/components/ui/button"
import {
  MousePointer2,
  Hand,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pen,
  Type,
  Image as ImageIcon,
  Eraser
} from "lucide-react"

interface ToolbarProps {
  tool: "select" | "hand" | "pen" | "eraser" | "line" | "rectangle" | "diamond" | "circle" | "arrow" | "text" | "image"
  setTool: (tool: "select" | "hand" | "pen" | "eraser" | "line" | "rectangle" | "diamond" | "circle" | "arrow" | "text" | "image") => void
}

const tools = [
  { id: "select" as const, icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "hand" as const, icon: Hand, label: "Hand", shortcut: "H" },
  { id: "rectangle" as const, icon: Square, label: "Rectangle", shortcut: "R" },
  { id: "diamond" as const, icon: Diamond, label: "Diamond", shortcut: "D" },
  { id: "circle" as const, icon: Circle, label: "Circle", shortcut: "C" },
  { id: "arrow" as const, icon: ArrowRight, label: "Arrow", shortcut: "A" },
  { id: "line" as const, icon: Minus, label: "Line", shortcut: "L" },
  { id: "pen" as const, icon: Pen, label: "Pen", shortcut: "P" },
  { id: "text" as const, icon: Type, label: "Text", shortcut: "T" },
  { id: "image" as const, icon: ImageIcon, label: "Image", shortcut: "I" },
  { id: "eraser" as const, icon: Eraser, label: "Eraser", shortcut: "E" },
]

export function Toolbar({ tool, setTool }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-1">
      {tools.map((t, index) => {
        const Icon = t.icon
        const isActive = tool === t.id

        return (
          <div key={t.id} className="flex items-center">
            {(index === 2 || index === 6 || index === 10) && (
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTool(t.id)}
              title={`${t.label} (${t.shortcut})`}
              className={`h-9 w-9 p-0 rounded-md transition-all ${
                isActive
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
