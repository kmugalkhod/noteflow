"use client";

import { useRef, useState, useEffect, useCallback, memo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebounce } from "@/modules/shared/hooks/use-debounce";
import { toast } from "@/modules/shared/lib/toast";
import { Toolbar } from "../toolbar";
import { ColorPicker } from "../color-picker";
import { BrushControls } from "../brush-controls";
import { HamburgerMenu } from "../hamburger-menu";
import { ActionButtons } from "../action-buttons";
import { ZoomControls } from "../zoom-controls";
import { PropertySidebar } from "../property-sidebar";

interface DrawingCanvasProps {
  noteId?: Id<"notes">; // Optional for standalone mode
  drawingId?: Id<"drawings">;
  readonly?: boolean;
}

function DrawingCanvasComponent({ noteId, drawingId, readonly = false }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<"select" | "hand" | "pen" | "eraser" | "line" | "rectangle" | "diamond" | "circle" | "arrow" | "text" | "image">("pen");
  const [canvasBgColor, setCanvasBgColor] = useState("#ffffff");

  // Property sidebar states
  const [fillColor, setFillColor] = useState("transparent");
  const [opacity, setOpacity] = useState(100);
  const [fontFamily, setFontFamily] = useState<"handwritten" | "normal" | "code" | "serif">("normal");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large" | "xlarge">("medium");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<ImageData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDrawingId, setCurrentDrawingId] = useState(drawingId);
  const [isInitialized, setIsInitialized] = useState(false);

  // Convex integration
  const isStandalone = !noteId;
  const drawing = useQuery(
    isStandalone ? api.drawings.getStandaloneDrawing : api.drawings.getDrawingByNote,
    isStandalone ? {} : { noteId: noteId! }
  );

  const createDrawing = useMutation(
    isStandalone ? api.drawings.createStandaloneDrawing : api.drawings.createDrawing
  );
  const updateDrawing = useMutation(api.drawings.updateDrawing);

  // Debounced canvas data for auto-save
  const canvasDataRef = useRef<string | null>(null);
  const debouncedCanvasData = useDebounce(canvasDataRef.current, 1500);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight || 600;

    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load existing drawing
    if (drawing?.data && !isInitialized) {
      try {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setHistory([imageData]);
          setHistoryStep(0);
          setCurrentDrawingId(drawing._id);
          setIsInitialized(true);
        };
        img.src = drawing.data;
      } catch (error) {
        console.error("Failed to load drawing:", error);
        toast.error("Failed to load drawing");
      }
    } else if (!drawing && !isInitialized) {
      // Save initial blank state
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([imageData]);
      setHistoryStep(0);
      setIsInitialized(true);
    }

    const handleResize = () => {
      const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight || 600;
      ctx.fillStyle = canvasBgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(currentImageData, 0, 0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawing, isInitialized]);

  // Capture canvas data whenever history changes
  const captureCanvasData = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || readonly) return;

    try {
      const dataUrl = canvas.toDataURL("image/png");
      canvasDataRef.current = dataUrl;
    } catch (error) {
      console.error("Failed to capture canvas:", error);
    }
  }, [readonly]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    captureCanvasData();
  }, [history, historyStep, captureCanvasData]);

  // Auto-save to Convex
  useEffect(() => {
    if (!debouncedCanvasData || readonly || !isInitialized) return;

    const saveDrawing = async () => {
      setIsSaving(true);

      try {
        if (!currentDrawingId) {
          const args = isStandalone
            ? { data: debouncedCanvasData }
            : { noteId: noteId!, data: debouncedCanvasData };
          const { drawingId: newId } = await createDrawing(args as any);
          setCurrentDrawingId(newId);
          toast.success("Drawing saved");
        } else {
          await updateDrawing({
            drawingId: currentDrawingId,
            data: debouncedCanvasData,
          });
        }
      } catch (error: any) {
        console.error("Save failed:", error);
        toast.error("Failed to save drawing");
      } finally {
        setIsSaving(false);
      }
    };

    saveDrawing();
  }, [debouncedCanvasData, readonly, isInitialized, currentDrawingId, noteId, isStandalone, createDrawing, updateDrawing]);

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const newStep = historyStep - 1;
      ctx.putImageData(history[newStep], 0, 0);
      setHistoryStep(newStep);
      captureCanvasData();
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const newStep = historyStep + 1;
      ctx.putImageData(history[newStep], 0, 0);
      setHistoryStep(newStep);
      captureCanvasData();
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  // Hand-drawn line with slight randomness
  const drawRoughLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const segments = Math.floor(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 5);
    ctx.beginPath();
    ctx.moveTo(x1, y1);

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 0.3;
      const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 0.3;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readonly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });

    if (["line", "rectangle", "circle"].includes(tool)) {
      setPreviewCanvas(canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height) || null);
    } else {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readonly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "pen") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === "eraser") {
      ctx.clearRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
    }
  };

  const endDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readonly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (["line", "rectangle", "circle"].includes(tool) && startPos && previewCanvas) {
      ctx.putImageData(previewCanvas, 0, 0);

      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (tool === "line") {
        drawRoughLine(ctx, startPos.x, startPos.y, x, y);
      } else if (tool === "rectangle") {
        const width = x - startPos.x;
        const height = y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    ctx.beginPath();
    setIsDrawing(false);
    setStartPos(null);
    setPreviewCanvas(null);
    saveState();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!readonly && isDrawing && ["line", "rectangle", "circle"].includes(tool) && startPos && previewCanvas) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.putImageData(previewCanvas, 0, 0);

      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (tool === "line") {
        drawRoughLine(ctx, startPos.x, startPos.y, x, y);
      } else if (tool === "rectangle") {
        const width = x - startPos.x;
        const height = y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    } else if (!readonly && isDrawing && tool === "pen") {
      draw(e);
    }
  };

  const isSidebarOpen = tool !== "select" && tool !== "hand";

  return (
    <div className="relative w-full bg-[#fafafa] dark:bg-[#1a1a1a] overflow-hidden rounded-lg border border-border" style={{ height: '600px' }}>
      {/* Property Sidebar - Left (absolute positioned within this container) */}
      <PropertySidebar
        tool={tool}
        isOpen={isSidebarOpen}
        strokeColor={color}
        setStrokeColor={setColor}
        fillColor={fillColor}
        setFillColor={setFillColor}
        opacity={opacity}
        setOpacity={setOpacity}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
        textAlign={textAlign}
        setTextAlign={setTextAlign}
      />

      {/* Top Bar - Excalidraw Style */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-transparent z-30 pointer-events-none">
        {/* Left: Hamburger Menu */}
        <div className="pointer-events-auto">
          <HamburgerMenu
            onReset={clear}
            canvasBackgroundColor={canvasBgColor}
            onCanvasBackgroundChange={setCanvasBgColor}
          />
        </div>

        {/* Center: Main Toolbar */}
        <div className="pointer-events-auto">
          <Toolbar tool={tool} setTool={setTool} />
        </div>

        {/* Right: Action Buttons */}
        <div className="pointer-events-auto">
          <ActionButtons />
        </div>
      </div>

      {/* Canvas */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pt-20">
        <div
          className="relative w-full h-full"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            className="w-full h-full cursor-crosshair rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: canvasBgColor }}
          />
        </div>
      </div>

      {/* Zoom Controls - Bottom Left */}
      <ZoomControls
        onUndo={undo}
        onRedo={redo}
        canUndo={historyStep > 0}
        canRedo={historyStep < history.length - 1}
      />

      {/* Save indicator */}
      {isSaving && (
        <div className="absolute top-24 right-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm shadow-lg z-40">
          Saving...
        </div>
      )}
    </div>
  );
}

// Export memoized version
export const DrawingCanvas = memo(DrawingCanvasComponent);
