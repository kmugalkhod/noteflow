# Admin Setup Guide

**CRITICAL**: This guide shows how to set up the new database-driven admin system that replaces hardcoded admin emails.

---

## Overview

The admin system now uses database records instead of hardcoded emails. This provides:
- ✅ Dynamic admin management (no code deployment required)
- ✅ Complete audit trail (who granted/revoked roles)
- ✅ Role-based access (admin vs superadmin)
- ✅ Secure revocation (soft delete with reason tracking)

---

## Initial Setup (One-Time Only)

### Step 1: Set Bootstrap Secret

Add this to your `.env.local`:

```bash
# Admin Bootstrap Secret (for creating first superadmin)
# CHANGE THIS IN PRODUCTION!
ADMIN_BOOTSTRAP_SECRET=your-secure-random-string-here
```

**Generate a secure secret**:
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 2: Create First Superadmin

**After** deploying the schema changes, create the first superadmin:

```typescript
// In your Convex dashboard or via API call

import { api } from "@/convex/_generated/api";

await convex.mutation(api.adminRoles.bootstrapFirstSuperadmin, {
  email: "your-email@noteflow.com", // Your actual email
  bootstrapSecret: "your-secure-random-string-here" // From .env
});
```

**Or via Convex CLI**:
```bash
npx convex run adminRoles:bootstrapFirstSuperadmin \
  '{"email":"your-email@noteflow.com","bootstrapSecret":"your-secret-here"}'
```

**Important**: This function can only be called ONCE. After the first superadmin is created, it will error if called again.

---

## Managing Admin Roles

### Grant Admin Role (Superadmin Only)

```typescript
// Promote user to admin
await convex.mutation(api.adminRoles.grantAdminRole, {
  targetUserId: "user_id_here",
  targetEmail: "newadmin@noteflow.com",
  role: "admin", // or "superadmin"
  reason: "Promoted to admin - Support team member"
});
```

**Roles**:
- `admin`: Can view audit logs, access user data (with logging)
- `superadmin`: Can grant/revoke admin roles + all admin privileges

### Revoke Admin Role (Superadmin Only)

```typescript
// Remove admin access
await convex.mutation(api.adminRoles.revokeAdminRole, {
  targetUserId: "user_id_here",
  reason: "Employee left company"
});
```

**Note**: Revocation is a soft delete - the record remains in the database with `revokedAt` timestamp for audit purposes.

### Check Admin Status

```typescript
// Check if user is admin
const adminRole = await convex.query(api.adminRoles.isAdmin, {
  email: "user@noteflow.com"
});

if (adminRole) {
  console.log(`User is ${adminRole.role}`);
} else {
  console.log('User is not an admin');
}
```

### List All Admins

```typescript
// List active admins only
const activeAdmins = await convex.query(api.adminRoles.listAdminRoles, {
  includeRevoked: false
});

// List all (including revoked)
const allAdmins = await convex.query(api.adminRoles.listAdminRoles, {
  includeRevoked: true
});
```

---

## Migration from Hardcoded Emails

If you had hardcoded admin emails before:

### Old Code (DO NOT USE):
```typescript
const ADMIN_EMAILS = [
  "admin1@noteflow.com",
  "admin2@noteflow.com",
];

if (!ADMIN_EMAILS.includes(userEmail)) {
  throw new Error("Unauthorized");
}
```

### New Code (REQUIRED):
```typescript
const adminRole = await ctx.db
  .query("adminRoles")
  .withIndex("by_email_active", (q) =>
    q.eq("email", userEmail).eq("revokedAt", undefined)
  )
  .first();

if (!adminRole) {
  throw new Error("Unauthorized - admin access only");
}
```

### Migration Steps:

1. **Deploy Schema Changes**
   ```bash
   npx convex dev # or npx convex deploy --prod
   ```

2. **Create First Superadmin** (see Step 2 above)

3. **Grant Roles to Existing Admins**
   For each previous hardcoded admin email:
   ```bash
   npx convex run adminRoles:grantAdminRole \
     '{"targetUserId":"user_id","targetEmail":"admin@noteflow.com","role":"admin"}'
   ```

4. **Verify All Admins Migrated**
   ```bash
   npx convex run adminRoles:listAdminRoles '{}'
   ```

5. **Remove Hardcoded Arrays** (already done in this PR)

---

## Security Best Practices

### Bootstrap Secret

❌ **NEVER**:
- Commit bootstrap secret to git
- Share bootstrap secret in Slack/email
- Use weak/guessable secrets

✅ **ALWAYS**:
- Generate cryptographically random secrets
- Store in environment variables
- Rotate after initial setup (optional)

### Admin Access

❌ **NEVER**:
- Grant superadmin to regular employees
- Share admin credentials
- Leave revoked admins with access

✅ **ALWAYS**:
- Grant minimum required role (admin vs superadmin)
- Revoke access immediately when employee leaves
- Review admin list quarterly
- Document reason for granting/revoking

### Audit Trail

✅ **ALWAYS**:
- Check audit logs monthly
- Investigate unexpected admin actions
- Keep audit logs for compliance (2+ years)

---

## Troubleshooting

### Error: "Superadmin already exists"

**Solution**: The bootstrap function has already been called. Use `grantAdminRole` mutation instead.

### Error: "Unauthorized - admin access only"

**Causes**:
1. User doesn't have an admin role in database
2. Admin role was revoked
3. Email mismatch (check Clerk email vs database email)

**Solution**:
```typescript
// Check user's admin status
const role = await convex.query(api.adminRoles.getAdminRole, {
  userId: currentUserId
});

console.log('Admin role:', role);
```

### Error: "Cannot revoke your own admin role"

**Solution**: This is a safety feature. Have another superadmin revoke your role, or create a new superadmin first.

### No Admins Can Access System

**Emergency Recovery**:

1. Check if any superadmins exist:
   ```bash
   npx convex run adminRoles:listAdminRoles '{"includeRevoked":false}'
   ```

2. If none exist, you may need to:
   - Re-run bootstrap (if it hasn't been used yet)
   - Or manually insert a superadmin record via Convex dashboard

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Bootstrap secret set in production environment variables
- [ ] First superadmin created
- [ ] All necessary admins granted roles
- [ ] Bootstrap function tested
- [ ] Grant/revoke tested
- [ ] List admins verified
- [ ] Old hardcoded emails removed from code
- [ ] Audit logs reviewed
- [ ] Documentation shared with team

---

## API Reference

### Queries

- `isAdmin({ email?, userId? })` - Check if user is admin
- `checkCurrentUserIsAdmin()` - Check current authenticated user
- `listAdminRoles({ includeRevoked? })` - List all admin roles
- `getAdminRole({ userId })` - Get specific user's role

### Mutations

- `bootstrapFirstSuperadmin({ email, bootstrapSecret })` - Create first superadmin (one-time)
- `grantAdminRole({ targetUserId, targetEmail, role, reason? })` - Grant admin role
- `revokeAdminRole({ targetUserId, reason? })` - Revoke admin role

---

## Support

For questions or issues:
- **Security concerns**: security@noteflow.com
- **Access requests**: admin@noteflow.com
- **Technical issues**: engineering@noteflow.com

---

**Created**: 2025-11-08
**Last Updated**: 2025-11-08
**Version**: 1.0.0
