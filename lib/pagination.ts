/**
 * Pagination Utilities
 *
 * Provides cursor-based pagination for efficient data loading
 * Prevents N+1 query problems and improves performance at scale
 *
 * Key Features:
 * - Cursor-based pagination (better than offset-based)
 * - Configurable page sizes
 * - Convex-optimized pagination
 * - Type-safe pagination results
 */

import { PaginationResult } from "convex/server";

/**
 * Default pagination settings
 */
export const PAGINATION_DEFAULTS = {
  /** Default page size for note lists */
  NOTES_PAGE_SIZE: 50,

  /** Default page size for shared notes */
  SHARED_NOTES_PAGE_SIZE: 25,

  /** Default page size for search results */
  SEARCH_PAGE_SIZE: 20,

  /** Default page size for deleted notes (trash) */
  TRASH_PAGE_SIZE: 30,

  /** Maximum allowed page size (prevent abuse) */
  MAX_PAGE_SIZE: 100,

  /** Minimum allowed page size */
  MIN_PAGE_SIZE: 10,
} as const;

/**
 * Pagination options type
 */
export interface PaginationOptions {
  /** Number of items per page */
  numItems?: number;

  /** Cursor for the next page (from previous result) */
  cursor?: string | null;

  /** Cursor for the previous page (from previous result) */
  endCursor?: string | null;
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  items: T[];

  /** Total count of items (if available) */
  totalCount?: number;

  /** Cursor for next page (null if last page) */
  nextCursor: string | null;

  /** Whether there are more items after this page */
  hasMore: boolean;

  /** Current page size */
  pageSize: number;

  /** Index of first item on this page (0-based) */
  startIndex?: number;

  /** Index of last item on this page (0-based) */
  endIndex?: number;
}

/**
 * Convert Convex PaginationResult to our PaginatedResponse format
 */
export function toPaginatedResponse<T>(
  result: PaginationResult<T>,
  options?: {
    totalCount?: number;
    startIndex?: number;
  }
): PaginatedResponse<T> {
  const items = result.page;
  const pageSize = items.length;

  return {
    items,
    totalCount: options?.totalCount,
    nextCursor: result.continueCursor ?? null,
    hasMore: result.isDone === false,
    pageSize,
    startIndex: options?.startIndex,
    endIndex: options?.startIndex !== undefined
      ? options.startIndex + pageSize - 1
      : undefined,
  };
}

/**
 * Validate and normalize pagination options
 * Ensures page size is within allowed bounds
 */
export function normalizePaginationOptions(
  options: PaginationOptions = {},
  defaultPageSize: number = PAGINATION_DEFAULTS.NOTES_PAGE_SIZE
): Required<Pick<PaginationOptions, 'numItems'>> & Pick<PaginationOptions, 'cursor'> {
  let numItems = options.numItems ?? defaultPageSize;

  // Enforce min/max bounds
  numItems = Math.max(PAGINATION_DEFAULTS.MIN_PAGE_SIZE, numItems);
  numItems = Math.min(PAGINATION_DEFAULTS.MAX_PAGE_SIZE, numItems);

  return {
    numItems,
    cursor: options.cursor ?? null,
  };
}

/**
 * Calculate pagination statistics
 * Useful for displaying "Showing X-Y of Z items"
 */
export function getPaginationStats(
  response: PaginatedResponse<any>
): {
  showing: string;
  current: number;
  total: number | null;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const { items, totalCount, startIndex, hasMore } = response;
  const current = items.length;
  const start = (startIndex ?? 0) + 1;
  const end = (startIndex ?? 0) + current;

  return {
    showing: totalCount
      ? `${start}-${end} of ${totalCount}`
      : `${start}-${end}${hasMore ? '+' : ''}`,
    current,
    total: totalCount ?? null,
    hasNext: hasMore,
    hasPrev: (startIndex ?? 0) > 0,
  };
}

/**
 * Client-side pagination helper
 * Manages pagination state in React components
 */
export class PaginationManager {
  private cursor: string | null = null;
  private pageHistory: string[] = [];

  /**
   * Get current cursor for fetching next page
   */
  getCursor(): string | null {
    return this.cursor;
  }

  /**
   * Update cursor after receiving new page
   */
  updateCursor(nextCursor: string | null) {
    if (this.cursor) {
      this.pageHistory.push(this.cursor);
    }
    this.cursor = nextCursor;
  }

  /**
   * Go to previous page
   */
  goBack(): string | null {
    const prev = this.pageHistory.pop();
    if (prev !== undefined) {
      this.cursor = prev;
      return prev;
    }
    return null;
  }

  /**
   * Reset to first page
   */
  reset() {
    this.cursor = null;
    this.pageHistory = [];
  }

  /**
   * Check if we can go back
   */
  canGoBack(): boolean {
    return this.pageHistory.length > 0;
  }
}

/**
 * React hook for pagination state management
 *
 * @example
 * ```typescript
 * const { cursor, nextPage, prevPage, reset, canGoBack } = usePagination();
 *
 * const notes = useQuery(api.notes.getNotesPaginated, {
 *   paginationOpts: { cursor, numItems: 50 }
 * });
 *
 * if (notes?.hasMore) {
 *   <button onClick={() => nextPage(notes.nextCursor)}>Next</button>
 * }
 * ```
 */
export function createPaginationHook() {
  return {
    /**
     * Creates a pagination manager for a component
     */
    usePagination: () => {
      const manager = new PaginationManager();

      return {
        cursor: manager.getCursor(),
        nextPage: (nextCursor: string | null) => manager.updateCursor(nextCursor),
        prevPage: () => manager.goBack(),
        reset: () => manager.reset(),
        canGoBack: () => manager.canGoBack(),
      };
    },
  };
}

/**
 * Performance monitoring utilities
 */
export const PaginationMetrics = {
  /**
   * Calculate estimated memory usage
   * Useful for comparing paginated vs non-paginated queries
   */
  estimateMemoryUsage(itemCount: number, avgItemSizeKB: number = 2): {
    bytes: number;
    kilobytes: number;
    megabytes: number;
    formatted: string;
  } {
    const bytes = itemCount * avgItemSizeKB * 1024;
    const kilobytes = bytes / 1024;
    const megabytes = bytes / (1024 * 1024);

    let formatted: string;
    if (megabytes >= 1) {
      formatted = `${megabytes.toFixed(2)} MB`;
    } else if (kilobytes >= 1) {
      formatted = `${kilobytes.toFixed(2)} KB`;
    } else {
      formatted = `${bytes} bytes`;
    }

    return { bytes, kilobytes, megabytes, formatted };
  },

  /**
   * Calculate performance improvement
   */
  calculateImprovement(
    beforeItemCount: number,
    afterItemCount: number,
    avgItemSizeKB: number = 2
  ): {
    itemsReduced: number;
    percentageReduced: string;
    memoryBefore: string;
    memoryAfter: string;
    memorySaved: string;
  } {
    const before = this.estimateMemoryUsage(beforeItemCount, avgItemSizeKB);
    const after = this.estimateMemoryUsage(afterItemCount, avgItemSizeKB);

    return {
      itemsReduced: beforeItemCount - afterItemCount,
      percentageReduced: ((1 - afterItemCount / beforeItemCount) * 100).toFixed(1) + '%',
      memoryBefore: before.formatted,
      memoryAfter: after.formatted,
      memorySaved: this.estimateMemoryUsage(beforeItemCount - afterItemCount, avgItemSizeKB).formatted,
    };
  },
};

/**
 * Helper to create pagination arguments for Convex queries
 */
export function createPaginationOpts(
  cursor: string | null,
  numItems: number = PAGINATION_DEFAULTS.NOTES_PAGE_SIZE
): { cursor: string | null; numItems: number } {
  return {
    cursor,
    numItems: Math.min(numItems, PAGINATION_DEFAULTS.MAX_PAGE_SIZE),
  };
}
