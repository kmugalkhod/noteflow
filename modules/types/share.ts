import { Id } from "@/convex/_generated/dataModel";

/**
 * SharedNote entity - represents a publicly shared note
 */
export interface SharedNote {
  _id: Id<"sharedNotes">;
  shareId: string;
  noteId: Id<"notes">;
  userId: Id<"users">;
  isActive: boolean;
  viewCount: number;
  lastAccessedAt?: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Data returned when creating a share link
 * Note: shareUrl should be built client-side using buildShareUrl(shareId)
 */
export interface ShareLinkData {
  shareId: string;
  isNew: boolean;
}

/**
 * Public note data (safe for unauthenticated viewing)
 */
export interface PublicNoteData {
  title: string;
  content: string;
  blocks?: string;
  contentType?: "plain" | "rich";
  coverImage?: string;
}

/**
 * Share analytics data
 */
export interface ShareAnalytics {
  shareId: string;
  viewCount: number;
  lastAccessedAt?: number;
  createdAt: number;
  isActive: boolean;
  noteTitle: string;
}

/**
 * My shared notes list item
 * Note: shareUrl should be built client-side using buildShareUrl(shareId)
 */
export interface MySharedNoteItem {
  _id: Id<"sharedNotes">;
  shareId: string;
  noteId: Id<"notes">;
  noteTitle: string;
  viewCount: number;
  lastAccessedAt?: number;
  createdAt: number;
  isActive: boolean;
}
