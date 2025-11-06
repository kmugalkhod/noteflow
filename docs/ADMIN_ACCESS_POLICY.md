# Admin Access Policy

**Internal Team Document - Confidential**

**Last Updated**: November 4, 2025

## Purpose

This policy defines when and how administrators may access user data in NoteFlow, ensuring user privacy is protected while allowing necessary operational activities.

## Core Principles

1. **Privacy First**: User notes are private by default
2. **Minimal Access**: Only access data when absolutely necessary
3. **Always Log**: Every access must be logged in the audit system
4. **User Rights**: Users can request their audit logs at any time
5. **Transparency**: We are transparent about what we access and why

## Authorized Access Scenarios

### ✅ PERMITTED: User Support Requests

**When**: User explicitly requests help via support ticket or email

**Requirements**:
- User must provide explicit permission
- Log access with ticket number as reason
- Only access data necessary to resolve the issue
- Delete any local copies after resolution

**Example**:
```typescript
await logAdminAccess({
  adminEmail: "admin@noteflow.com",
  targetUserId: "user_123",
  action: "viewed_notes",
  reason: "Support ticket #456 - User reported missing notes",
  metadata: { ticketId: "456", requestedBy: "user@example.com" }
});
```

### ✅ PERMITTED: Bug Investigation

**When**: Investigating reported bugs that affect a specific user's account

**Requirements**:
- Must be in response to a bug report
- Log with bug ID/issue number
- Minimize data exposure
- Report findings to user

**Example**:
```typescript
await logAdminAccess({
  adminEmail: "dev@noteflow.com",
  targetUserId: "user_789",
  action: "debugged_issue",
  reason: "GitHub issue #123 - Note sync failure investigation",
  metadata: { issueNumber: "123", githubUrl: "..." }
});
```

### ✅ PERMITTED: Legal Requirements

**When**: Valid court order, subpoena, or legal process requires data access

**Requirements**:
- Must have valid legal documentation
- Consult with legal counsel
- Log with case number
- Comply with data minimization

**Example**:
```typescript
await logAdminAccess({
  adminEmail: "legal@noteflow.com",
  targetUserId: "user_456",
  action: "legal_compliance",
  reason: "Court order case #789 - Data preservation request",
  metadata: { caseNumber: "789", court: "District Court" }
});
```

### ✅ PERMITTED: Security Incident Response

**When**: Investigating security breaches, unauthorized access, or malicious activity

**Requirements**:
- Must be part of active security incident
- Log with incident ID
- Follow incident response protocol
- Inform affected users after resolution

**Example**:
```typescript
await logAdminAccess({
  adminEmail: "security@noteflow.com",
  targetUserId: "user_101",
  action: "security_investigation",
  reason: "Incident #SEC-2025-01 - Suspected unauthorized access",
  metadata: { incidentId: "SEC-2025-01", severity: "high" }
});
```

---

## ❌ PROHIBITED: Unauthorized Access

### NEVER Access Data For:

1. **Curiosity or Interest**
   - ❌ Reading user notes out of personal interest
   - ❌ Browsing user data without purpose
   - ❌ "Checking out" what users are writing about

2. **Marketing or Analytics** (without explicit consent)
   - ❌ Mining user content for marketing insights
   - ❌ Analyzing note patterns without permission
   - ❌ Creating user profiles from note content

3. **Training AI/ML Models** (without explicit consent)
   - ❌ Using user notes to train language models
   - ❌ Feeding content into analytics without permission
   - ❌ Any AI/ML usage without user opt-in

4. **Third-Party Sharing**
   - ❌ Sharing data with partners
   - ❌ Selling user data
   - ❌ Providing data to affiliates

5. **Personal Benefit**
   - ❌ Using insights from user data for personal projects
   - ❌ Competitive intelligence gathering
   - ❌ Any access that benefits the admin personally

---

## Required Logging Procedure

### Every Access Must Be Logged

Use the `logAdminAccess` mutation from `convex/adminAudit.ts`:

```typescript
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

// Log admin access
const logAccess = useMutation(api.adminAudit.logAdminAccess);

await logAccess({
  adminEmail: "your-email@noteflow.com",
  targetUserId: "user_id_here",
  action: "action_type",  // viewed_notes, exported_data, debugged_issue, etc.
  reason: "Detailed reason with ticket/issue number",
  metadata: {
    // Additional context
    ticketId: "123",
    timestamp: Date.now(),
    // ... any other relevant info
  }
});
```

### Log Fields Explanation

| Field | Description | Example |
|-------|-------------|---------|
| `adminEmail` | Your official company email | `admin@noteflow.com` |
| `targetUserId` | Clerk user ID of affected user | `user_2abc...` |
| `action` | Type of access performed | `viewed_notes`, `exported_data` |
| `reason` | Detailed explanation with reference | `Support ticket #456 - User requested data export` |
| `metadata` | Additional structured context | `{ ticketId: "456", type: "export" }` |

### Standard Action Types

- `viewed_notes` - Read user's notes
- `exported_data` - Exported user's data
- `debugged_issue` - Investigated technical problem
- `legal_compliance` - Legal requirement access
- `security_investigation` - Security incident response
- `account_recovery` - Helped user recover account
- `data_migration` - Migrated user's data

---

## Audit Log Review Process

### Monthly Audit

**Responsibility**: Security team or designated administrator

**Process**:
1. Review all admin access logs from past month
2. Verify each access had valid reason
3. Check for any suspicious patterns
4. Document findings in security review meeting
5. Report any policy violations to management

**Query to Review Logs**:
```typescript
// Get all logs for review
const allLogs = await ctx.db
  .query("adminAuditLog")
  .withIndex("by_timestamp")
  .order("desc")
  .take(1000);

// Filter by time period
const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
const recentLogs = allLogs.filter(log => log.timestamp >= monthAgo);
```

### User Requests for Audit Logs

**When**: User requests to see who accessed their data

**Process**:
1. Verify user's identity
2. Query their specific audit logs
3. Provide clear, readable format
4. Answer any questions about entries

**Query**:
```typescript
// Get user's audit log
const userLogs = await ctx.db
  .query("adminAuditLog")
  .withIndex("by_target_user", (q) => q.eq("targetUserId", userId))
  .collect();
```

---

## Data Minimization

When accessing user data:

1. **Access Only What's Needed**
   - If debugging a note issue, view only affected notes
   - Don't browse entire account unnecessarily

2. **Time Limits**
   - Access data for minimum time required
   - Close sessions immediately after task completion

3. **Local Copies**
   - Avoid downloading/copying user data locally
   - If necessary, delete immediately after use
   - Never store in personal devices

4. **Screen Sharing**
   - Never share screen showing user data in public calls
   - Redact sensitive information in screenshots
   - Only share with authorized personnel

---

## Consequences of Policy Violation

Violations of this policy may result in:

1. **Minor Violation** (accidental, first-time):
   - Verbal warning
   - Additional training
   - Closer supervision

2. **Moderate Violation** (negligent):
   - Written warning
   - Temporary suspension of admin privileges
   - Mandatory retraining

3. **Major Violation** (intentional, malicious):
   - Immediate termination
   - Revocation of all access
   - Possible legal action
   - Report to authorities if criminal

---

## Admin Authorization

### Who Can Access User Data

Only these roles are authorized:
- **Admin** (with valid support@noteflow.com email)
- **Security Team** (security@noteflow.com)
- **Legal Team** (legal@noteflow.com)
- **Authorized Developers** (dev@noteflow.com, for debugging only)

### Onboarding Process

New admins must:
1. Read and sign this policy
2. Complete privacy training
3. Be added to authorized admin list in code
4. Have email verified

**Code Implementation**:
```typescript
// In convex/adminAudit.ts
const ADMIN_EMAILS = [
  "admin@noteflow.com",
  "security@noteflow.com",
  "legal@noteflow.com",
  // Add authorized emails here
];
```

---

## Emergency Access

### Data Breach Response

In case of confirmed data breach:

1. **Immediate Actions**:
   - Notify security team
   - Log all investigative access
   - Preserve evidence
   - Follow incident response plan

2. **User Notification**:
   - Notify affected users within 72 hours
   - Provide details of breach
   - Offer remediation steps
   - Include access logs if requested

---

## Policy Updates

This policy will be reviewed:
- **Quarterly**: Every 3 months
- **After incidents**: Following any security event
- **Regulatory changes**: When laws/regulations change

**Version History**:
- v1.0 (Nov 4, 2025): Initial policy creation

---

## Contact

For questions about this policy:
- **Security Team**: security@noteflow.com
- **Privacy Officer**: privacy@noteflow.com
- **Legal Team**: legal@noteflow.com

---

## Acknowledgment

All administrators must acknowledge:

> "I have read, understood, and agree to comply with the Admin Access Policy. I understand that user privacy is paramount and that violations of this policy may result in termination and legal action."

**Signed**: ____________________
**Date**: ____________________
**Email**: ____________________

---

**Remember**: When in doubt, DON'T access. Ask your supervisor first.
