/**
 * Scheduled Jobs (Cron)
 *
 * Convex cron jobs for automated background tasks
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const cron = cronJobs();

/**
 * Daily Trash Cleanup
 *
 * Automatically permanently deletes notes and folders that have been in trash
 * for more than 30 days. Runs daily at midnight UTC to minimize impact.
 */
cron.daily(
  "cleanup-expired-trash",
  {
    hourUTC: 0, // Midnight UTC
    minuteUTC: 0,
  },
  internal.trash.cleanupExpiredTrash
);

/**
 * Hourly Rate Limit Cleanup
 *
 * Removes expired rate limit records and old violation logs
 * to prevent database bloat. Runs every hour.
 */
cron.hourly(
  "cleanup-rate-limits",
  {
    minuteUTC: 15, // Run at :15 past every hour
  },
  internal.rateLimit.cleanupExpiredRecords
);

export default cron;
