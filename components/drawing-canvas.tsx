"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Toolbar } from "./toolbar"
import { ColorPicker } from "./color-picker"
import { BrushControls } from "./brush-controls"
import { ExportMenu } from "./export-menu"

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(3)
  const [tool, setTool] = useState<"pen" | "eraser" | "line" | "rectangle" | "circle">("pen")
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyStep, setHistoryStep] = useState(-1)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [previewCanvas, setPreviewCanvas] = useState<ImageData | null>(null)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight - 80

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save initial state
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory([imageData])
    setHistoryStep(0)

    const handleResize = () => {
      const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight - 80
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.putImageData(currentImageData, 0, 0)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const saveState = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(imageData)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const newStep = historyStep - 1
      ctx.putImageData(history[newStep], 0, 0)
      setHistoryStep(newStep)
    }
  }

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const newStep = historyStep + 1
      ctx.putImageData(history[newStep], 0, 0)
      setHistoryStep(newStep)
    }
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveState()
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setStartPos({ x, y })

    if (["line", "rectangle", "circle"].includes(tool)) {
      setPreviewCanvas(canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height) || null)
    } else {
      draw(e)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "pen") {
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === "eraser") {
      ctx.clearRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize)
    }
  }

  const endDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (["line", "rectangle", "circle"].includes(tool) && startPos && previewCanvas) {
      // Restore preview
      ctx.putImageData(previewCanvas, 0, 0)

      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (tool === "line") {
        ctx.beginPath()
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      } else if (tool === "rectangle") {
        const width = x - startPos.x
        const height = y - startPos.y
        ctx.strokeRect(startPos.x, startPos.y, width, height)
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2))
        ctx.beginPath()
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
      }
    }

    ctx.beginPath()
    setIsDrawing(false)
    setStartPos(null)
    setPreviewCanvas(null)
    saveState()
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && ["line", "rectangle", "circle"].includes(tool) && startPos && previewCanvas) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Restore preview
      ctx.putImageData(previewCanvas, 0, 0)

      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (tool === "line") {
        ctx.beginPath()
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      } else if (tool === "rectangle") {
        const width = x - startPos.x
        const height = y - startPos.y
        ctx.strokeRect(startPos.x, startPos.y, width, height)
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2))
        ctx.beginPath()
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
      }
    } else if (isDrawing && tool === "pen") {
      draw(e)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-card border-b border-border">
        <Toolbar
          tool={tool}
          setTool={setTool}
          onUndo={undo}
          onRedo={redo}
          onClear={clear}
          canUndo={historyStep > 0}
          canRedo={historyStep < history.length - 1}
        />
        <div className="flex items-center gap-4">
          <ColorPicker color={color} setColor={setColor} />
          <BrushControls brushSize={brushSize} setBrushSize={setBrushSize} />
          <ExportMenu canvasRef={canvasRef} />
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        className="flex-1 cursor-crosshair bg-white"
      />
    </div>
  )
}
