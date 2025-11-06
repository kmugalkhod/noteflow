# Convex Schema Deployment Guide

**Last Updated**: November 4, 2025

## Overview

This guide covers deploying the Convex database schema, specifically focusing on the new `adminAuditLog` table added for security compliance.

## Schema Verification

### Admin Audit Log Table

The `adminAuditLog` table has been successfully added to `convex/schema.ts`:

**Location**: Lines 179-194 in `convex/schema.ts`

**Schema Definition**:
```typescript
adminAuditLog: defineTable({
  adminEmail: v.string(),        // Email of admin who accessed data
  adminClerkId: v.string(),      // Clerk ID of admin
  targetUserId: v.string(),      // User whose data was accessed
  action: v.string(),            // "viewed_notes", "exported_data", etc.
  reason: v.string(),            // "Support ticket #123", etc.
  metadata: v.optional(v.any()), // Additional context
  timestamp: v.number(),         // Unix timestamp
  ipAddress: v.optional(v.string()), // IP address of admin access
})
  .index("by_target_user", ["targetUserId"])   // Users see who accessed their data
  .index("by_admin", ["adminClerkId"])         // Track all actions by admin
  .index("by_timestamp", ["timestamp"])        // Sort by time
  .index("by_action", ["action"]),             // Filter by action type
```

### All Schema Tables

The complete schema includes:

1. **users** - User accounts and preferences
2. **notes** - Note content and metadata
3. **folders** - Folder organization
4. **tags** - Tag definitions
5. **noteTags** - Note-tag relationships
6. **trashAuditLog** - Trash operations audit
7. **sharedNotes** - Public sharing feature
8. **files** - File uploads tracking
9. **drawings** - tldraw whiteboard data
10. **adminAuditLog** ✨ **NEW** - Admin access logging

## Deployment Steps

### Local Development

#### 1. Start Convex Dev Server

```bash
npx convex dev
```

**Expected Output**:
```
✔ Convex functions ready!
  https://your-project.convex.cloud

  Schema deployed:
  - users
  - notes
  - folders
  - tags
  - noteTags
  - trashAuditLog
  - sharedNotes
  - files
  - drawings
  - adminAuditLog ✨
```

#### 2. Verify Table Creation

**Option A: Convex Dashboard**
1. Open https://dashboard.convex.dev
2. Navigate to your project
3. Click "Data" tab
4. Look for `adminAuditLog` table
5. Verify indexes are created:
   - `by_target_user`
   - `by_admin`
   - `by_timestamp`
   - `by_action`

**Option B: Query in Dev Console**
```typescript
// In Convex dashboard query console
ctx.db.query("adminAuditLog").collect()
```

Should return: `[]` (empty array, table exists)

#### 3. Test Schema with Sample Data

```bash
# Open your app locally
npm run dev

# Navigate to admin panel or dev console
# Run test mutation (see AUDIT_LOGGING_GUIDE.md)
```

---

### Production Deployment

#### 1. Deploy to Convex Production

```bash
npx convex deploy
```

**Before deploying**:
- ✅ All changes committed to git
- ✅ Local testing completed
- ✅ Schema changes reviewed
- ✅ Indexes verified

**Expected Output**:
```
Deploying functions to production...
✔ Schema deployed successfully
✔ Functions deployed
✔ Indexes created

Production URL: https://your-project.convex.cloud
```

#### 2. Verify Production Deployment

1. **Check Dashboard**:
   - Login to https://dashboard.convex.dev
   - Switch to "Production" environment
   - Navigate to "Data" tab
   - Verify `adminAuditLog` table exists

2. **Test Production Functions**:
   ```bash
   # Use your production app
   # Test logging function with admin credentials
   ```

3. **Monitor Logs**:
   ```bash
   # In Convex dashboard
   # Navigate to "Logs" tab
   # Watch for any schema-related errors
   ```

#### 3. Update Environment Variables

Ensure production environment has:
```bash
CONVEX_DEPLOYMENT=prod:your-deployment-id
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

---

## Rollback Procedure

If deployment fails or issues are detected:

### Option 1: Rollback Schema

```bash
# Revert schema.ts to previous version
git checkout HEAD~1 convex/schema.ts

# Redeploy
npx convex deploy
```

### Option 2: Manual Intervention

1. Contact Convex support if table can't be dropped
2. Use Convex dashboard to manually delete table
3. Redeploy corrected schema

**Important**: Convex automatically handles schema migrations. Dropping a table deletes all data permanently.

---

## Schema Migration Best Practices

### Adding New Tables

✅ **DO**:
- Add table definition to `convex/schema.ts`
- Include necessary indexes
- Test locally before production
- Document table purpose

❌ **DON'T**:
- Deploy untested schema changes
- Remove indexes that queries depend on
- Delete tables without backup

### Adding Indexes

✅ **DO**:
- Add indexes for all query patterns
- Use composite indexes for common filters
- Test query performance with indexes

❌ **DON'T**:
- Add too many indexes (impacts write performance)
- Remove indexes without checking queries

### Modifying Fields

✅ **DO**:
- Use `v.optional()` for new fields
- Provide default values
- Test with existing data

❌ **DON'T**:
- Change field types (breaks existing data)
- Remove required fields

---

## Verification Checklist

After deployment, verify:

- [ ] `adminAuditLog` table visible in dashboard
- [ ] All 4 indexes created successfully
- [ ] `logAdminAccess` mutation works
- [ ] `getUserAuditLog` query works
- [ ] `getAllAuditLogs` query works (admin only)
- [ ] No errors in Convex logs
- [ ] No console errors in app
- [ ] Production environment updated

---

## Monitoring

### Check Schema Health

```bash
# Monitor Convex dashboard
# "System" > "Health"
# Look for:
- Schema version number
- Last deployment time
- Any migration errors
```

### Query Performance

```typescript
// Test query performance in dashboard
const start = Date.now();
const logs = await ctx.db
  .query("adminAuditLog")
  .withIndex("by_timestamp")
  .order("desc")
  .take(100);
const elapsed = Date.now() - start;
console.log(`Query took ${elapsed}ms`);
```

**Expected**: < 100ms for indexed queries

---

## Troubleshooting

### "Table not found: adminAuditLog"

**Cause**: Schema not deployed

**Solution**:
```bash
npx convex dev  # or npx convex deploy
```

### "Index not found: by_target_user"

**Cause**: Index not created or still building

**Solution**:
1. Check Convex dashboard for index status
2. Wait for index to build (usually < 1 minute)
3. Redeploy if index missing

### "Query taking too long"

**Cause**: Missing index or scanning full table

**Solution**:
1. Check query uses `.withIndex()`
2. Verify index exists in schema
3. Add missing indexes if needed

### Schema Version Mismatch

**Cause**: Local dev out of sync with deployed version

**Solution**:
```bash
# Pull latest schema
npx convex dev

# If issues persist, clear local state
rm -rf .convex
npx convex dev
```

---

## Schema Documentation

### adminAuditLog Table

**Purpose**: Track all admin access to user data for transparency and accountability

**Access Patterns**:

1. **User viewing own logs**:
   ```typescript
   .withIndex("by_target_user", q => q.eq("targetUserId", userId))
   .order("desc")
   ```

2. **Admin viewing all their actions**:
   ```typescript
   .withIndex("by_admin", q => q.eq("adminClerkId", adminId))
   .order("desc")
   ```

3. **Monthly audit review**:
   ```typescript
   .withIndex("by_timestamp")
   .order("desc")
   .take(1000)
   ```

4. **Filter by action type**:
   ```typescript
   .withIndex("by_action", q => q.eq("action", "viewed_notes"))
   ```

**Retention**: Logs stored indefinitely (consider archival after 1+ years)

**Privacy**: Logs contain admin actions, not user note content

---

## Related Documentation

- **Usage Guide**: [AUDIT_LOGGING_GUIDE.md](./AUDIT_LOGGING_GUIDE.md)
- **Admin Policy**: [ADMIN_ACCESS_POLICY.md](./ADMIN_ACCESS_POLICY.md)
- **Security Overview**: [../SECURITY.md](../SECURITY.md)
- **Convex Docs**: https://docs.convex.dev/database/schemas

---

## Contact

For deployment issues:
- **Technical Support**: dev@noteflow.com
- **Convex Support**: https://docs.convex.dev/support
- **Security Questions**: security@noteflow.com

---

## Version History

- v1.0 (Nov 4, 2025): Initial schema deployment for adminAuditLog table
