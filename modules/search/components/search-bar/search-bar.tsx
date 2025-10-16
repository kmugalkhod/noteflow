"use client";

import { Search, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onOpenCommandPalette: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  onOpenCommandPalette, 
  placeholder = "Search notes...",
  className = ""
}: SearchBarProps) {

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={placeholder}
          className="pl-10 pr-20"
          onFocus={() => {
            onOpenCommandPalette();
          }}
          readOnly
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={onOpenCommandPalette}
          >
            <Command className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">⌘K</span>
          </Button>
        </div>
      </div>
    </div>
  );
}