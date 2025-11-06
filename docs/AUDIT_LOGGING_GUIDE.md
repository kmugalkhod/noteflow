# Admin Audit Logging System - Testing & Usage Guide

**Last Updated**: November 4, 2025

## Overview

The Admin Audit Logging System provides transparency and accountability for all admin access to user data. Every time an admin views, exports, or debugs user data, it's automatically logged.

## System Architecture

### Database Schema

The `adminAuditLog` table in Convex stores all access logs:

```typescript
adminAuditLog: defineTable({
  adminEmail: v.string(),      // Email of admin who accessed data
  adminClerkId: v.string(),    // Clerk ID of admin
  targetUserId: v.string(),    // User whose data was accessed
  action: v.string(),          // Type of access performed
  reason: v.string(),          // Detailed explanation with reference
  metadata: v.optional(v.any()), // Additional context
  timestamp: v.number(),       // Unix timestamp
  ipAddress: v.optional(v.string()), // IP address of admin
})
```

### Indexes

- `by_target_user` - Users can see who accessed their data
- `by_admin` - Track all actions by specific admin
- `by_timestamp` - Sort by time for audit reviews
- `by_action` - Filter by action type

## API Functions

### 1. `logAdminAccess` (Mutation)

**Purpose**: Log any admin access to user data

**Parameters**:
```typescript
{
  adminEmail: string,    // Your official company email
  targetUserId: string,  // Clerk user ID of affected user
  action: string,        // Type of access (see standard actions below)
  reason: string,        // Detailed explanation with ticket/issue number
  metadata?: any        // Additional structured context
}
```

**Standard Action Types**:
- `viewed_notes` - Read user's notes
- `exported_data` - Exported user's data
- `debugged_issue` - Investigated technical problem
- `legal_compliance` - Legal requirement access
- `security_investigation` - Security incident response
- `account_recovery` - Helped user recover account
- `data_migration` - Migrated user's data

**Example Usage**:
```typescript
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

const logAccess = useMutation(api.adminAudit.logAdminAccess);

// Support ticket scenario
await logAccess({
  adminEmail: "admin@noteflow.com",
  targetUserId: "user_2abc123",
  action: "viewed_notes",
  reason: "Support ticket #456 - User reported missing notes",
  metadata: {
    ticketId: "456",
    requestedBy: "user@example.com",
    timestamp: Date.now()
  }
});

// Bug investigation scenario
await logAccess({
  adminEmail: "dev@noteflow.com",
  targetUserId: "user_2xyz789",
  action: "debugged_issue",
  reason: "GitHub issue #123 - Note sync failure investigation",
  metadata: {
    issueNumber: "123",
    githubUrl: "https://github.com/kmugalkhod/noteflow/issues/123"
  }
});

// Legal compliance scenario
await logAccess({
  adminEmail: "legal@noteflow.com",
  targetUserId: "user_2def456",
  action: "legal_compliance",
  reason: "Court order case #789 - Data preservation request",
  metadata: {
    caseNumber: "789",
    court: "District Court",
    orderDate: "2025-11-01"
  }
});
```

**Authorization**: Only admins with emails in `ADMIN_EMAILS` array can log access.

**Returns**: `{ success: true, message: "Access logged" }`

---

### 2. `getUserAuditLog` (Query)

**Purpose**: Users can see who accessed their data

**Parameters**:
```typescript
{
  userId?: string  // Optional: defaults to current user
}
```

**Example Usage**:
```typescript
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

// User viewing their own audit log
const auditLog = useQuery(api.adminAudit.getUserAuditLog, {});

// Admin viewing specific user's audit log
const userLog = useQuery(api.adminAudit.getUserAuditLog, {
  userId: "user_2abc123"
});
```

**Returns**: Array of audit log entries (max 100 most recent)

**Authorization**:
- Users can only see their own audit log
- Admins can view any user's audit log

---

### 3. `getAllAuditLogs` (Query)

**Purpose**: Admin-only query to view all audit logs

**Parameters**: None

**Example Usage**:
```typescript
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

// Admin viewing all logs
const allLogs = useQuery(api.adminAudit.getAllAuditLogs);
```

**Returns**: Array of all audit log entries (max 1000 most recent)

**Authorization**: Admin-only (email must be in `ADMIN_EMAILS`)

---

## Testing Guide

### Manual Testing Steps

#### Test 1: Log Admin Access

**Prerequisites**:
1. Update `ADMIN_EMAILS` in `convex/adminAudit.ts` with your email
2. Deploy schema to Convex: `npx convex dev`
3. Be logged in with admin account

**Test Procedure**:
```typescript
// In your admin dashboard or dev console
const logAccess = useMutation(api.adminAudit.logAdminAccess);

await logAccess({
  adminEmail: "your-email@noteflow.com",
  targetUserId: "test_user_123",
  action: "viewed_notes",
  reason: "Test - Verifying audit logging system works",
  metadata: { testId: "audit-test-001" }
});
```

**Expected Result**:
- ✅ Function succeeds with `{ success: true }`
- ✅ Entry appears in Convex dashboard under `adminAuditLog` table
- ✅ All fields populated correctly

**Failure Scenarios**:
- ❌ "Not authenticated" - You're not logged in
- ❌ "Unauthorized - admin access only" - Your email not in `ADMIN_EMAILS`

---

#### Test 2: View User Audit Log

**Test Procedure**:
```typescript
// User viewing their own log
const myLog = useQuery(api.adminAudit.getUserAuditLog, {});
console.log("My audit log:", myLog);

// Admin viewing specific user's log
const userLog = useQuery(api.adminAudit.getUserAuditLog, {
  userId: "test_user_123"
});
console.log("User audit log:", userLog);
```

**Expected Result**:
- ✅ Returns array of log entries
- ✅ Entries sorted by timestamp (newest first)
- ✅ Max 100 entries returned
- ✅ Users see only their own logs (unless admin)

---

#### Test 3: View All Audit Logs (Admin Only)

**Test Procedure**:
```typescript
// Admin viewing all logs
const allLogs = useQuery(api.adminAudit.getAllAuditLogs);
console.log("All audit logs:", allLogs);
```

**Expected Result**:
- ✅ Admin: Returns all log entries
- ❌ Non-admin: "Unauthorized" error

---

### Automated Testing

Create test file `tests/adminAudit.test.ts`:

```typescript
import { describe, it, expect } from "@jest/globals";

describe("Admin Audit Logging", () => {
  it("should log admin access with all required fields", async () => {
    const logEntry = {
      adminEmail: "admin@noteflow.com",
      targetUserId: "user_123",
      action: "viewed_notes",
      reason: "Test access",
      metadata: { testId: "001" }
    };

    // Test that entry is created with proper structure
    expect(logEntry.adminEmail).toBe("admin@noteflow.com");
    expect(logEntry.targetUserId).toBe("user_123");
    expect(logEntry.action).toBe("viewed_notes");
  });

  it("should reject unauthorized users", async () => {
    // Test that non-admin emails are rejected
    const unauthorizedEmail = "hacker@example.com";
    const ADMIN_EMAILS = ["admin@noteflow.com"];

    expect(ADMIN_EMAILS.includes(unauthorizedEmail)).toBe(false);
  });
});
```

Run tests: `npm test`

---

## Integration Examples

### Support Dashboard Integration

```typescript
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function SupportTicketViewer({ ticketId, userId }: Props) {
  const logAccess = useMutation(api.adminAudit.logAdminAccess);
  const [hasLogged, setHasLogged] = useState(false);

  const handleViewUserData = async () => {
    // Log before accessing
    await logAccess({
      adminEmail: "support@noteflow.com",
      targetUserId: userId,
      action: "viewed_notes",
      reason: `Support ticket #${ticketId} - User data access`,
      metadata: { ticketId, timestamp: Date.now() }
    });

    setHasLogged(true);
    // Now safe to show user data
  };

  return (
    <div>
      <button onClick={handleViewUserData}>
        View User Data (Will Log Access)
      </button>
      {hasLogged && <UserDataDisplay userId={userId} />}
    </div>
  );
}
```

### User Audit Log Viewer

```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserAuditLogPage() {
  const auditLog = useQuery(api.adminAudit.getUserAuditLog, {});

  if (!auditLog) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Access Audit Log</h1>

      {auditLog.length === 0 ? (
        <p className="text-muted-foreground">
          No admin access to your data has been logged.
        </p>
      ) : (
        <div className="space-y-4">
          {auditLog.map((entry) => (
            <div key={entry._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{entry.action}</p>
                  <p className="text-sm text-muted-foreground">
                    by {entry.adminEmail}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="mt-2 text-sm">{entry.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Monthly Audit Review Process

### Automated Review Query

```typescript
// Get all logs from past month
const getMonthlyAuditReport = async () => {
  const allLogs = await ctx.db
    .query("adminAuditLog")
    .withIndex("by_timestamp")
    .order("desc")
    .take(1000);

  const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentLogs = allLogs.filter(log => log.timestamp >= monthAgo);

  // Group by admin
  const byAdmin = recentLogs.reduce((acc, log) => {
    acc[log.adminEmail] = (acc[log.adminEmail] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by action type
  const byAction = recentLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalAccesses: recentLogs.length,
    byAdmin,
    byAction,
    logs: recentLogs
  };
};
```

### Review Checklist

- [ ] Total number of admin accesses this month
- [ ] Most common access reasons
- [ ] Any accesses without proper ticket/issue references
- [ ] Any suspicious patterns (same user accessed repeatedly)
- [ ] All accesses have valid reasons
- [ ] No policy violations detected

---

## Troubleshooting

### "Not authenticated" Error

**Cause**: User not logged in or session expired

**Solution**: Ensure user is authenticated with Clerk before calling mutation

### "Unauthorized - admin access only" Error

**Cause**: User's email not in `ADMIN_EMAILS` array

**Solution**:
1. Update `convex/adminAudit.ts`
2. Add email to `ADMIN_EMAILS` array
3. Redeploy Convex functions

### Logs Not Appearing

**Cause**: Schema not deployed or index not created

**Solution**:
1. Run `npx convex dev` to deploy schema
2. Check Convex dashboard for `adminAuditLog` table
3. Verify indexes exist in dashboard

### Performance Issues with Large Log Volume

**Cause**: Querying thousands of logs at once

**Solution**:
1. Use pagination (`.take(N)`)
2. Filter by specific user or time range
3. Implement log archival for old entries

---

## Security Best Practices

1. **Always Log First**: Log access BEFORE viewing user data
2. **Be Specific**: Include ticket numbers, issue IDs, or case numbers
3. **Minimal Access**: Only access data necessary for the task
4. **Delete Local Copies**: Never store user data locally
5. **Monthly Reviews**: Regularly audit all access logs
6. **User Transparency**: Inform users they can request their audit log

---

## Configuration

### Adding Admin Emails

Edit `convex/adminAudit.ts`:

```typescript
const ADMIN_EMAILS = [
  "admin@noteflow.com",
  "security@noteflow.com",
  "legal@noteflow.com",
  "dev@noteflow.com",
  // Add new authorized emails here
];
```

**Important**: Redeploy after changes: `npx convex deploy`

---

## Contact

For questions about the audit logging system:
- **Security Team**: security@noteflow.com
- **Privacy Officer**: privacy@noteflow.com
- **Technical Support**: dev@noteflow.com

---

## Version History

- v1.0 (Nov 4, 2025): Initial audit logging system implementation
