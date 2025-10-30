"use client"

import { Button } from "@/components/ui/button"
import { Share2, Library } from "lucide-react"

interface ActionButtonsProps {
  onShare?: () => void
  onLibrary?: () => void
}

export function ActionButtons({ onShare, onLibrary }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onShare}
        className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button
        onClick={onLibrary}
        variant="outline"
        className="h-9 px-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-medium shadow-sm transition-all"
      >
        <Library className="h-4 w-4 mr-2" />
        Library
      </Button>
    </div>
  )
}
