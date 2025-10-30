"use client"

import { ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LayersControlProps {
  onBringToFront?: () => void
  onBringForward?: () => void
  onSendBackward?: () => void
  onSendToBack?: () => void
}

export function LayersControl({
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
}: LayersControlProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Layers</label>
      <div className="grid grid-cols-4 gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onSendToBack}
          className="h-10 p-0 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Send to back"
        >
          <ArrowDownToLine className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSendBackward}
          className="h-10 p-0 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Send backward"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBringForward}
          className="h-10 p-0 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Bring forward"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBringToFront}
          className="h-10 p-0 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Bring to front"
        >
          <ArrowUpToLine className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
