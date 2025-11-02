"use client";

import { useCallback, useEffect, useRef, useReducer, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebounce } from "@/modules/shared/hooks/use-debounce";
import { toast } from "@/modules/shared/lib/toast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { DEBOUNCE_DELAY_MS } from "@/lib/constants";

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

interface ExcalidrawCanvasProps {
  noteId?: Id<"notes">;
  drawingId?: Id<"drawings">;
  readonly?: boolean;
}

// Type for createDrawing mutation args
type CreateDrawingArgs =
  | { data: string } // Standalone
  | { noteId: Id<"notes">; data: string }; // Note-attached

// State management with useReducer
interface DrawingState {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  isSaving: boolean;
  currentDrawingId: Id<"drawings"> | undefined;
  isInitialized: boolean;
}

type DrawingAction =
  | { type: "SET_API"; payload: ExcalidrawImperativeAPI | null }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_DRAWING_ID"; payload: Id<"drawings"> }
  | { type: "INITIALIZE" };

function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case "SET_API":
      return { ...state, excalidrawAPI: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_DRAWING_ID":
      return { ...state, currentDrawingId: action.payload };
    case "INITIALIZE":
      return { ...state, isInitialized: true };
    default:
      return state;
  }
}

// Security: Whitelist of allowed appState properties to prevent data injection
const ALLOWED_APP_STATE_KEYS = [
  "viewBackgroundColor",
  "currentItemStrokeColor",
  "currentItemBackgroundColor",
  "currentItemFillStyle",
  "currentItemStrokeWidth",
  "currentItemRoughness",
  "currentItemOpacity",
  "currentItemFontFamily",
  "currentItemFontSize",
  "currentItemTextAlign",
  "gridSize",
  "zoom",
  "scrollX",
  "scrollY",
] as const;

export function ExcalidrawCanvas({
  noteId,
  drawingId,
  readonly = false
}: ExcalidrawCanvasProps) {
  const router = useRouter();

  // Consolidate state with useReducer for better performance
  const [state, dispatch] = useReducer(drawingReducer, {
    excalidrawAPI: null,
    isSaving: false,
    currentDrawingId: drawingId,
    isInitialized: false,
  });

  const hasLoadedRef = useRef(false);
  const [drawingData, setDrawingData] = useState<string | null>(null);

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

  const debouncedDrawingData = useDebounce(drawingData, DEBOUNCE_DELAY_MS);

  // Load existing drawing data
  useEffect(() => {
    const { excalidrawAPI } = state;

    if (drawing?.data && !hasLoadedRef.current && excalidrawAPI) {
      try {
        const savedData = JSON.parse(drawing.data);

        // Security: Validate data structure before loading
        if (!savedData.elements || !Array.isArray(savedData.elements)) {
          throw new Error("Invalid drawing data structure");
        }

        excalidrawAPI.updateScene({
          elements: savedData.elements,
          appState: savedData.appState,
        });

        // Load files if present with validation
        if (savedData.files && typeof savedData.files === "object") {
          Object.entries(savedData.files).forEach(([fileId, fileData]: [string, unknown]) => {
            // Type guard to ensure fileData has expected structure
            const isValidFileData = (data: unknown): data is { dataURL: string; mimeType?: string; created?: number } => {
              return (
                typeof data === "object" &&
                data !== null &&
                "dataURL" in data &&
                typeof data.dataURL === "string"
              );
            };

            // Security: Validate file data structure and dataURL format
            if (
              isValidFileData(fileData) &&
              fileData.dataURL.startsWith("data:image/")
            ) {
              excalidrawAPI.addFiles([{
                id: fileId,
                dataURL: fileData.dataURL,
                mimeType: fileData.mimeType || "image/png",
                created: fileData.created || Date.now(),
              }]);
            }
          });
        }

        hasLoadedRef.current = true;
        dispatch({ type: "SET_DRAWING_ID", payload: drawing._id });
        dispatch({ type: "INITIALIZE" });
        // Removed verbose "Drawing loaded" toast - loading is expected behavior
      } catch (error) {
        console.error("Failed to load drawing:", error);
        toast.error("Failed to load drawing");
        dispatch({ type: "INITIALIZE" });
      }
    } else if (!drawing && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      dispatch({ type: "INITIALIZE" });
    }
  }, [drawing, state]);

  // Auto-save to Convex
  useEffect(() => {
    const { isInitialized, currentDrawingId } = state;

    if (!debouncedDrawingData || readonly || !isInitialized) return;

    const saveDrawing = async () => {
      dispatch({ type: "SET_SAVING", payload: true });

      try {
        if (!currentDrawingId) {
          // Type-safe mutation arguments based on standalone mode
          const args: CreateDrawingArgs = isStandalone
            ? { data: debouncedDrawingData }
            : { noteId: noteId!, data: debouncedDrawingData };

          const { drawingId: newId } = await createDrawing(args);
          dispatch({ type: "SET_DRAWING_ID", payload: newId });
          // Removed verbose "Drawing saved" toast - auto-save is expected behavior
        } else {
          await updateDrawing({
            drawingId: currentDrawingId,
            data: debouncedDrawingData,
          });
        }
      } catch (error) {
        console.error("Save failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to save drawing";
        toast.error(errorMessage);
      } finally {
        dispatch({ type: "SET_SAVING", payload: false });
      }
    };

    saveDrawing();
  }, [debouncedDrawingData, readonly, state, noteId, isStandalone, createDrawing, updateDrawing]);

  // Handle changes in the canvas
  const handleChange = useCallback((elements: readonly unknown[], appState: Record<string, unknown>, files: Record<string, unknown>) => {
    if (!state.isInitialized || readonly) return;

    // Security: Filter appState to only include whitelisted properties
    const sanitizedAppState: Record<string, unknown> = {};
    ALLOWED_APP_STATE_KEYS.forEach((key) => {
      if (appState[key] !== undefined) {
        sanitizedAppState[key] = appState[key];
      }
    });

    const drawingState = {
      elements: elements,
      appState: sanitizedAppState,
      files: files || {},
    };

    setDrawingData(JSON.stringify(drawingState));
  }, [state.isInitialized, readonly]);

  return (
    <div className="relative w-full h-full">
      {/* Back to NoteFlow Button - positioned to not overlap with Excalidraw menu */}
      <button
        onClick={() => router.push('/workspace')}
        className="absolute top-4 right-4 z-[9999] flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors shadow-lg text-sm font-medium text-gray-700 dark:text-gray-200"
        title="Back to NoteFlow"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to NoteFlow</span>
      </button>

      {/* Save indicator */}
      {state.isSaving && (
        <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-xl z-50 flex items-center gap-2 transition-opacity duration-150">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          Saving...
        </div>
      )}

      <Excalidraw
        excalidrawAPI={(api) => dispatch({ type: "SET_API", payload: api })}
        onChange={handleChange}
        viewModeEnabled={readonly}
        zenModeEnabled={false}
        gridModeEnabled={true}
      />
    </div>
  );
}
