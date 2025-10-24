/**
 * Audit Log Types
 *
 * Type definitions for trash audit logging system
 */

import type { Id } from "../_generated/dataModel";

/**
 * Audit action types
 */
export type AuditAction = "auto_delete" | "restore" | "permanent_delete" | "bulk_restore" | "bulk_delete" | "empty_trash";

/**
 * Item types that can be audited
 */
export type AuditItemType = "note" | "folder";

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  userId: Id<"users">;
  action: AuditAction;
  itemType: AuditItemType;
  itemId: string;
  itemTitle: string;
  timestamp: number;
  metadata?: AuditMetadata;
}

/**
 * Additional metadata for audit entries
 */
export interface AuditMetadata {
  deletedAt?: number;
  expirationDate?: number;
  bulkOperationSize?: number;
  restoredToFolderId?: Id<"folders">;
  restoredToOriginal?: boolean;
  errorMessage?: string;
  [key: string]: any;
}

/**
 * Audit log query filters
 */
export interface AuditLogFilters {
  userId?: Id<"users">;
  action?: AuditAction;
  itemType?: AuditItemType;
  startDate?: number;
  endDate?: number;
}

/**
 * Audit log statistics
 */
export interface AuditStats {
  totalAutoDeletes: number;
  totalRestores: number;
  totalPermanentDeletes: number;
  totalBulkOperations: number;
  period: {
    start: number;
    end: number;
  };
}
