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

export default cron;
