"use client";

import { useEffect, useCallback } from "react";

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Cmd on Mac, Win on Windows
  description?: string;
};

export type ShortcutHandler = () => void;

/**
 * Keyboard Shortcuts Hook
 *
 * Provides a consistent way to register keyboard shortcuts across the app.
 * Handles platform-specific modifiers (Cmd vs Ctrl).
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  handler: ShortcutHandler,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Normalize key comparison
      const key = event.key.toLowerCase();
      const targetKey = shortcut.key.toLowerCase();

      // Check if key matches
      const keyMatches = key === targetKey;

      // Check modifiers
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

      // For common shortcuts, treat Cmd (Mac) and Ctrl (Windows) as equivalent
      const modifierKey = event.metaKey || event.ctrlKey;
      const modifierMatches = shortcut.ctrl || shortcut.meta
        ? modifierKey
        : !modifierKey;

      if (
        keyMatches &&
        (shortcut.ctrl || shortcut.meta ? modifierMatches : ctrlMatches && metaMatches) &&
        shiftMatches &&
        altMatches
      ) {
        event.preventDefault();
        handler();
      }
    },
    [shortcut, handler, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Multiple Keyboard Shortcuts Hook
 *
 * Register multiple keyboard shortcuts at once.
 */
export function useKeyboardShortcuts(
  shortcuts: Array<{
    shortcut: KeyboardShortcut;
    handler: ShortcutHandler;
    enabled?: boolean;
  }>
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const { shortcut, handler, enabled = true } of shortcuts) {
        if (!enabled) continue;

        const key = event.key.toLowerCase();
        const targetKey = shortcut.key.toLowerCase();

        const keyMatches = key === targetKey;

        // Simplified modifier checking
        const modifierKey = event.metaKey || event.ctrlKey;
        const needsModifier = shortcut.ctrl || shortcut.meta;
        const modifierMatches = needsModifier ? modifierKey : !modifierKey;

        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && modifierMatches && shiftMatches && altMatches) {
          event.preventDefault();
          handler();
          break; // Only trigger one shortcut per keypress
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Get platform-specific modifier key name
 */
export function getModifierKeyName(): string {
  if (typeof window === "undefined") return "Ctrl";
  return navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl";
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  const isMac = typeof window !== "undefined" && navigator.platform.toLowerCase().includes("mac");

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.shift) {
    parts.push(isMac ? "⇧" : "Shift");
  }
  if (shortcut.alt) {
    parts.push(isMac ? "⌥" : "Alt");
  }

  // Capitalize first letter of key
  const key = shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);
  parts.push(key);

  return parts.join(isMac ? "" : "+");
}

/**
 * Common keyboard shortcuts
 */
export const COMMON_SHORTCUTS = {
  // Navigation
  COMMAND_PALETTE: { key: "k", meta: true, ctrl: true, description: "Open command palette" },
  SEARCH: { key: "f", meta: true, ctrl: true, description: "Search" },

  // Note operations
  NEW_NOTE: { key: "n", meta: true, ctrl: true, description: "Create new note" },
  DELETE_NOTE: { key: "Backspace", meta: true, ctrl: true, description: "Delete note" },
  SAVE: { key: "s", meta: true, ctrl: true, description: "Save (auto-save enabled)" },

  // Editing
  BOLD: { key: "b", meta: true, ctrl: true, description: "Bold text" },
  ITALIC: { key: "i", meta: true, ctrl: true, description: "Italic text" },
  UNDERLINE: { key: "u", meta: true, ctrl: true, description: "Underline text" },

  // UI
  TOGGLE_SIDEBAR: { key: "b", meta: true, ctrl: true, shift: true, description: "Toggle sidebar" },
  CLOSE_MODAL: { key: "Escape", description: "Close modal" },

  // Focus navigation
  FOCUS_NOTES: { key: "1", meta: true, ctrl: true, description: "Focus notes list" },
  FOCUS_EDITOR: { key: "2", meta: true, ctrl: true, description: "Focus editor" },
} as const;
