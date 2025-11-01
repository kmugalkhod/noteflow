"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileJson } from "lucide-react"

interface ExportMenuProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function ExportMenu({ canvasRef }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const exportAsImage = (format: "png" | "jpg") => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.href = canvas.toDataURL(`image/${format}`)
    link.download = `drawing.${format}`
    link.click()
    setIsOpen(false)
  }

  const exportAsJSON = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL("image/png")
    const data = {
      timestamp: new Date().toISOString(),
      width: canvas.width,
      height: canvas.height,
      imageData: imageData,
    }

    const link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }))
    link.download = "drawing.json"
    link.click()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="default"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-md rounded-lg h-10 px-4 transition-all"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <button
            onClick={() => exportAsImage("png")}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-sm"
          >
            <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium">Export as PNG</span>
          </button>
          <button
            onClick={() => exportAsImage("jpg")}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-sm border-t border-gray-100 dark:border-gray-700"
          >
            <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium">Export as JPG</span>
          </button>
          <button
            onClick={exportAsJSON}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-sm border-t border-gray-100 dark:border-gray-700"
          >
            <FileJson className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium">Export as JSON</span>
          </button>
        </div>
      )}
    </div>
  )
}
