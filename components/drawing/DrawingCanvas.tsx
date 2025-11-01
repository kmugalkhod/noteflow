"use client";

import { useRef, useState, useEffect, useCallback, memo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebounce } from "@/modules/shared/hooks/use-debounce";
import { useMediaQuery } from "@/modules/shared/hooks/use-media-query";
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
  const [isSidebarManuallyToggled, setIsSidebarManuallyToggled] = useState(false);
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Mobile detection
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tool shortcuts
      if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v': setTool('select'); e.preventDefault(); break;
          case 'h': setTool('hand'); e.preventDefault(); break;
          case 'r': setTool('rectangle'); e.preventDefault(); break;
          case 'd': setTool('diamond'); e.preventDefault(); break;
          case 'c': setTool('circle'); e.preventDefault(); break;
          case 'a': setTool('arrow'); e.preventDefault(); break;
          case 'l': setTool('line'); e.preventDefault(); break;
          case 'p': setTool('pen'); e.preventDefault(); break;
          case 't': setTool('text'); e.preventDefault(); break;
          case 'i': setTool('image'); e.preventDefault(); break;
          case 'e': setTool('eraser'); e.preventDefault(); break;
        }
      }

      // Undo/Redo shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo(); // Cmd/Ctrl+Shift+Z = Redo
        } else {
          undo(); // Cmd/Ctrl+Z = Undo
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyStep, history.length]);

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

  const renderText = (text: string, x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontConfig = getFontConfig();
    ctx.font = fontConfig.font;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "top";

    // Draw text
    ctx.fillText(text, x, y);
    saveState();
  };

  const handleTextSubmit = () => {
    if (textInput && textInput.value.trim()) {
      renderText(textInput.value, textInput.x, textInput.y);
    }
    setTextInput(null);
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

  // Get font configuration for text rendering
  const getFontConfig = () => {
    const fontSizeMap = {
      small: 16,
      medium: 20,
      large: 28,
      xlarge: 36,
    };

    const fontFamilyMap = {
      handwritten: "'Virgil', 'Segoe Print', 'Comic Sans MS', cursive",
      normal: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      code: "'Cascadia Code', 'Fira Code', 'Courier New', monospace",
      serif: "Georgia, 'Times New Roman', serif",
    };

    const size = fontSizeMap[fontSize];
    const family = fontFamilyMap[fontFamily];

    return { size, family, font: `${size}px ${family}` };
  };

  // Draw diamond shape
  const drawDiamond = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    ctx.beginPath();
    ctx.moveTo(centerX, y1); // Top
    ctx.lineTo(x2, centerY); // Right
    ctx.lineTo(centerX, y2); // Bottom
    ctx.lineTo(x1, centerY); // Left
    ctx.closePath();

    if (fillColor !== "transparent") {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    ctx.stroke();
  };

  // Draw arrow with arrowhead
  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const headLength = 15; // Length of arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw image at center with max size of 400px
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = width * ratio;
          height = height * ratio;
        }

        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;

        ctx.drawImage(img, x, y, width, height);
        saveState();
        toast.success('Image added to canvas');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readonly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle text tool
    if (tool === "text") {
      setTextInput({ x, y, value: "" });
      return;
    }

    // Handle image tool
    if (tool === "image") {
      fileInputRef.current?.click();
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });

    if (["line", "rectangle", "circle", "diamond", "arrow"].includes(tool)) {
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

    if (["line", "rectangle", "circle", "diamond", "arrow"].includes(tool) && startPos && previewCanvas) {
      ctx.putImageData(previewCanvas, 0, 0);

      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = opacity / 100;

      if (tool === "line") {
        drawRoughLine(ctx, startPos.x, startPos.y, x, y);
      } else if (tool === "rectangle") {
        const width = x - startPos.x;
        const height = y - startPos.y;
        ctx.beginPath();
        ctx.rect(startPos.x, startPos.y, width, height);
        if (fillColor !== "transparent") {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        if (fillColor !== "transparent") {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
      } else if (tool === "diamond") {
        drawDiamond(ctx, startPos.x, startPos.y, x, y);
      } else if (tool === "arrow") {
        drawArrow(ctx, startPos.x, startPos.y, x, y);
      }

      ctx.globalAlpha = 1;
    }

    ctx.beginPath();
    setIsDrawing(false);
    setStartPos(null);
    setPreviewCanvas(null);
    saveState();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!readonly && isDrawing && ["line", "rectangle", "circle", "diamond", "arrow"].includes(tool) && startPos && previewCanvas) {
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
      ctx.globalAlpha = opacity / 100;

      if (tool === "line") {
        drawRoughLine(ctx, startPos.x, startPos.y, x, y);
      } else if (tool === "rectangle") {
        const width = x - startPos.x;
        const height = y - startPos.y;
        ctx.beginPath();
        ctx.rect(startPos.x, startPos.y, width, height);
        if (fillColor !== "transparent") {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        if (fillColor !== "transparent") {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
      } else if (tool === "diamond") {
        drawDiamond(ctx, startPos.x, startPos.y, x, y);
      } else if (tool === "arrow") {
        drawArrow(ctx, startPos.x, startPos.y, x, y);
      }

      ctx.globalAlpha = 1;
    } else if (!readonly && isDrawing && (tool === "pen" || tool === "eraser")) {
      draw(e);
    }
  };

  const shouldShowSidebar = tool !== "select" && tool !== "hand";
  const isSidebarOpen = (shouldShowSidebar || isSidebarManuallyToggled) && !isMobile;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Mobile Notice */}
      {isMobile && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-50 p-6">
          <div className="text-center max-w-md">
            <div className="mb-4 flex justify-center">
              <svg className="w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Desktop Required
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              The drawing canvas requires a larger screen for the best experience. Please open this page on a desktop or tablet device (≥768px width).
            </p>
          </div>
        </div>
      )}

      {/* Property Sidebar - Left (absolute positioned within this container) */}
      {!isMobile && <PropertySidebar
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
      />}

      {/* Top Bar - Professional Style */}
      {!isMobile && (
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 z-30 pointer-events-none shadow-sm">
        {/* Left: Hamburger Menu */}
        <div className="pointer-events-auto">
          <HamburgerMenu
            onReset={clear}
            canvasBackgroundColor={canvasBgColor}
            onCanvasBackgroundChange={setCanvasBgColor}
          />
        </div>

        {/* Center: Main Toolbar */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarManuallyToggled(!isSidebarManuallyToggled)}
            className={`h-10 w-10 p-0 rounded-lg transition-all flex items-center justify-center ${
              isSidebarOpen
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800"
                : "bg-white/95 dark:bg-slate-900/95 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-lg border border-slate-200 dark:border-slate-700"
            }`}
            title="Toggle Properties Sidebar (A)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Toolbar tool={tool} setTool={setTool} />
        </div>

        {/* Right: Action Buttons */}
        <div className="pointer-events-auto">
          <ActionButtons />
        </div>
      </div>
      )}

      {/* Canvas */}
      <div className="absolute inset-0 flex items-center justify-center p-8 pt-24 pb-8">
        <div className="relative w-full h-full max-w-7xl">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            className="w-full h-full cursor-crosshair rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 ring-1 ring-black/5"
            style={{ backgroundColor: canvasBgColor }}
          />
        </div>
      </div>

      {/* Zoom Controls - Bottom Left */}
      {!isMobile && (
        <ZoomControls
          onUndo={undo}
          onRedo={redo}
          canUndo={historyStep > 0}
          canRedo={historyStep < history.length - 1}
        />
      )}

      {/* Save indicator */}
      {isSaving && (
        <div className="absolute top-20 right-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-xl z-40 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          Saving...
        </div>
      )}

      {/* Text Input Overlay */}
      {textInput && (
        <div
          className="absolute z-50"
          style={{
            left: `${textInput.x + (canvasRef.current?.getBoundingClientRect().left || 0)}px`,
            top: `${textInput.y + (canvasRef.current?.getBoundingClientRect().top || 0)}px`,
          }}
        >
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={textInput.value}
              onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTextSubmit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setTextInput(null);
                }
              }}
              onBlur={handleTextSubmit}
              placeholder="Type text..."
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-blue-500 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 shadow-xl outline-none min-w-[200px]"
              style={{
                font: getFontConfig().font,
                textAlign: textAlign,
              }}
            />
            <div className="absolute -bottom-8 left-0 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded shadow">
              Press Enter to add • Esc to cancel
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}

// Export memoized version
export const DrawingCanvas = memo(DrawingCanvasComponent);
