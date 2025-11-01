/**
 * Application-wide constants
 * Centralized location for all magic numbers and configuration values
 */

// ============================================
// AUTO-SAVE & DEBOUNCING
// ============================================
export const DEBOUNCE_DELAY_MS = 1500; // Auto-save delay for note editor and drawing canvas
export const SAVE_INDICATOR_DURATION_MS = 2000; // How long "Saved" indicator shows

// ============================================
// UI DIMENSIONS & LAYOUT
// ============================================
export const NOTES_PANEL_WIDTH_DEFAULT = 300; // Default width of notes list panel
export const NOTES_PANEL_WIDTH_MIN = 200; // Minimum width
export const NOTES_PANEL_WIDTH_MAX = 500; // Maximum width

// ============================================
// FILE & DATA LIMITS
// ============================================
export const DRAWING_SIZE_LIMIT_BYTES = 500_000; // 500KB limit for drawing data
export const NOTE_PREVIEW_LENGTH = 100; // Characters shown in note preview

// ============================================
// ANIMATIONS & TRANSITIONS
// ============================================
export const ANIMATION_DURATION_FAST_MS = 150; // Fast transitions (hover, clicks)
export const ANIMATION_DURATION_NORMAL_MS = 300; // Normal transitions (modals, panels)
export const ANIMATION_DURATION_SLOW_MS = 500; // Slow transitions (page transitions)

// ============================================
// LOCAL STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: "sidebar-collapsed",
  NOTES_PANEL_COLLAPSED: "notes-panel-collapsed",
  NOTES_PANEL_WIDTH: "notes-panel-width",
  NOTEFLOW_NOTES_STORAGE: "noteflow-notes-storage",
} as const;

// ============================================
// QUERY LIMITS
// ============================================
export const RECENT_NOTES_LIMIT_DEFAULT = 10; // Number of recent notes to fetch
export const SEARCH_RESULTS_LIMIT_DEFAULT = 50; // Max search results

// ============================================
// TIMEOUT VALUES
// ============================================
export const FOCUS_DELAY_MS = 10; // Delay before focusing elements after state changes
export const TOAST_AUTO_DISMISS_MS = 3000; // Auto-dismiss duration for toasts
