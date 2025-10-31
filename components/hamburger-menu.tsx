"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  FolderOpen,
  Download,
  Save,
  Users,
  Command,
  Search,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Github,
  Twitter,
  MessageCircle,
  Sun,
  Moon,
  Monitor,
  ArrowLeft,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

interface HamburgerMenuProps {
  onOpen?: () => void
  onSave?: () => void
  onExport?: () => void
  onReset?: () => void
  canvasBackgroundColor: string
  onCanvasBackgroundChange: (color: string) => void
}

const CANVAS_BG_COLORS = [
  { label: "White", value: "#ffffff" },
  { label: "Light Gray", value: "#f5f5f5" },
  { label: "Light Blue", value: "#e3f2fd" },
  { label: "Light Yellow", value: "#fffde7" },
  { label: "Light Pink", value: "#fce4ec" },
  { label: "Light Green", value: "#e8f5e9" },
]

export function HamburgerMenu({
  onOpen,
  onSave,
  onExport,
  onReset,
  canvasBackgroundColor,
  onCanvasBackgroundChange,
}: HamburgerMenuProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleBackToNotes = () => {
    router.push("/")
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
        <DropdownMenuItem onClick={handleBackToNotes} className="flex items-center gap-2 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Notes</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem onClick={onOpen} className="flex items-center gap-2 cursor-pointer">
          <FolderOpen className="h-4 w-4" />
          <span>Open</span>
          <span className="ml-auto text-xs text-muted-foreground">Cmd+O</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSave} className="flex items-center gap-2 cursor-pointer">
          <Save className="h-4 w-4" />
          <span>Save to...</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExport} className="flex items-center gap-2 cursor-pointer">
          <Download className="h-4 w-4" />
          <span>Export image...</span>
          <span className="ml-auto text-xs text-muted-foreground">Cmd+Shift+E</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Users className="h-4 w-4" />
          <span>Live collaboration...</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Command className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-600 dark:text-blue-400">Command palette</span>
          <span className="ml-auto text-xs text-muted-foreground">Cmd+/</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Search className="h-4 w-4" />
          <span>Find on canvas</span>
          <span className="ml-auto text-xs text-muted-foreground">Cmd+F</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
          <span className="ml-auto text-xs text-muted-foreground">?</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem onClick={onReset} className="flex items-center gap-2 cursor-pointer">
          <RotateCcw className="h-4 w-4" />
          <span>Reset the canvas</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Sparkles className="h-4 w-4" />
          <span>Excalidraw+</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Github className="h-4 w-4" />
          <span>GitHub</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Twitter className="h-4 w-4" />
          <span>Follow us</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <MessageCircle className="h-4 w-4" />
          <span>Discord chat</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        {/* Theme Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
              <Sun className="h-4 w-4 mr-2" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
              <Monitor className="h-4 w-4 mr-2" />
              System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Canvas Background */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: canvasBackgroundColor }}
            />
            <span>Canvas background</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            {CANVAS_BG_COLORS.map((bg) => (
              <DropdownMenuItem
                key={bg.value}
                onClick={() => onCanvasBackgroundChange(bg.value)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: bg.value }}
                />
                <span>{bg.label}</span>
                {canvasBackgroundColor === bg.value && (
                  <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
