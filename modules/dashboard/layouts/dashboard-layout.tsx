"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "../components/sidebar";
import { CommandPalette } from "@/modules/search/components";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <CommandPalette 
        open={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
    </div>
  );
}
