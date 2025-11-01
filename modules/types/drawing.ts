import type { Id } from "@/convex/_generated/dataModel";

/**
 * Drawing entity from Convex database
 */
export interface Drawing {
  _id: Id<"drawings">;
  _creationTime: number;
  noteId: Id<"notes">;
  userId: Id<"users">;
  data: string;              // Compressed tldraw data
  version: number;
  sizeBytes: number;
  elementCount?: number;
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
}

/**
 * Drawing summary for list views
 */
export interface DrawingSummary {
  _id: Id<"drawings">;
  noteId: Id<"notes">;
  noteTitle: string;
  sizeBytes: number;
  elementCount?: number;
  createdAt: number;
  updatedAt: number;
}
