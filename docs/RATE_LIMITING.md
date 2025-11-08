# Rate Limiting Guide

**Purpose**: Protect NoteFlow from DoS attacks, view count manipulation, and API abuse.

---

## Overview

The rate limiting system provides:
- ✅ Time-window based throttling (requests per minute)
- ✅ Per-identifier limits (shareId, IP, userId)
- ✅ Automatic violation logging
- ✅ Admin monitoring dashboard
- ✅ Automatic cleanup of expired records

---

## Current Rate Limits

| Endpoint | Identifier | Limit | Window | Purpose |
|----------|------------|-------|--------|---------|
| `incrementShareView` | shareId | 10 req | 1 min | Prevent view count inflation |
| `getSharedNote` | shareId | 30 req | 1 min | Prevent DoS on public shares |
| Default | any | 100 req | 1 min | General protection |

### Why These Limits?

**`incrementShareView` (10/min)**:
- Normal user views note once
- Allows for page refreshes and back/forward navigation
- Blocks automated view count inflation scripts

**`getSharedNote` (30/min)**:
- Higher limit for content fetching
- Allows for legitimate multiple accesses
- Still blocks high-volume scraping

---

## How It Works

### 1. Time Window Algorithm

```typescript
// Example: 10 requests per minute

Time:     0s    10s    20s    30s    40s    50s    60s    70s
Requests: |--1---|--2---|--3---|--..--|--10-|  ❌   |  ✅   |
          [------------- Window 1 ------------][--- Window 2 --]
                                              ^       ^
                                         Limit hit  New window
```

**Behavior**:
- First request starts a 60-second window
- Counter increments with each request
- After 10 requests, all further requests blocked
- After 60 seconds, window resets and requests allowed again

### 2. Enforcement Flow

```
Client Request
      ↓
Check Rate Limit
      ↓
├─→ Within Limit?
│   ├─ YES → Allow Request + Increment Counter
│   └─ NO  → Block Request + Log Violation
      ↓
Return Response or Error
```

### 3. Automatic Cleanup

**Hourly Job** (runs at :15 past each hour):
- Deletes rate limit records older than 1 hour
- Deletes violation logs older than 7 days
- Prevents database bloat

---

## Usage

### For Developers

#### Protect a Mutation

```typescript
import { enforceRateLimit } from "./rateLimit";

export const myMutation = mutation({
  args: { someId: v.string() },
  handler: async (ctx, { someId }) => {
    // Enforce rate limit (throws error if exceeded)
    await enforceRateLimit(ctx, someId, "myAction");

    // Your mutation logic here
    // ...
  },
});
```

#### Protect a Query

```typescript
// Note: Queries can't use enforceRateLimit (no mutations allowed)
// Use checkRateLimit mutation first, then call query

export const myQuery = query({
  handler: async (ctx) => {
    // For queries, implement rate limiting at the API layer
    // or use Vercel/Cloudflare edge rate limiting
  },
});
```

#### Add Custom Rate Limit

```typescript
// In rateLimit.ts, add to RATE_LIMITS:

export const RATE_LIMITS = {
  // ... existing limits

  myCustomAction: {
    maxRequests: 50,   // 50 requests
    windowMs: 300000,  // per 5 minutes (300,000 ms)
  },
};
```

### For Admins

#### View Rate Limit Violations

```typescript
// Get recent violations
const violations = await convex.query(api.rateLimit.getViolations, {
  limit: 100
});

// Filter by identifier (find abusive users)
const userViolations = await convex.query(api.rateLimit.getViolations, {
  identifier: "share-id-xyz",
  limit: 50
});

// Filter by action
const shareViewAbuse = await convex.query(api.rateLimit.getViolations, {
  action: "shareView",
  limit: 100
});
```

#### Check Rate Limit Status

```typescript
// Check current status for an identifier
const status = await convex.query(api.rateLimit.getRateLimitStatus, {
  identifier: "share-id-xyz",
  action: "shareView"
});

console.log(status);
// {
//   allowed: false,
//   remaining: 0,
//   resetAt: 1699234567890,
//   currentCount: 10
// }
```

#### Reset Rate Limit (Emergency)

```typescript
// Admin only: Reset rate limit for a specific identifier
await convex.mutation(api.rateLimit.resetRateLimit, {
  identifier: "share-id-xyz",
  action: "shareView"
});

// Use cases:
// - Legitimate user hit limit due to bot
// - Testing and debugging
// - False positive from shared network
```

---

## Monitoring & Alerting

### Key Metrics to Track

1. **Violation Rate**
   - Alert if >100 violations per hour
   - Indicates potential attack

2. **Top Violators**
   - Identify repeat offenders
   - Block at infrastructure level if needed

3. **Action Distribution**
   - Which endpoints are being abused?
   - Adjust limits if needed

### Recommended Monitoring

```typescript
// Weekly security review query

// 1. Top 10 violators this week
SELECT identifier, COUNT(*) as violation_count
FROM rateLimitViolations
WHERE timestamp > (now - 7 days)
GROUP BY identifier
ORDER BY violation_count DESC
LIMIT 10;

// 2. Violation trend
SELECT DATE(timestamp) as date, COUNT(*) as violations
FROM rateLimitViolations
GROUP BY date
ORDER BY date DESC;

// 3. Most abused endpoints
SELECT action, COUNT(*) as violations
FROM rateLimitViolations
WHERE timestamp > (now - 7 days)
GROUP BY action
ORDER BY violations DESC;
```

---

## Attack Scenarios & Defenses

### Scenario 1: View Count Inflation

**Attack**:
```bash
# Automated script trying to inflate views
for i in {1..1000}; do
  curl -X POST "https://api.convex.dev/incrementShareView" \
    -d '{"shareId":"abc123"}'
done
```

**Defense**:
- ✅ Rate limit: 10 requests per minute
- ✅ After 10 requests, returns error: "Rate limit exceeded"
- ✅ Violation logged for monitoring
- ✅ Attacker must wait 60 seconds before trying again

### Scenario 2: Distributed DoS

**Attack**:
```bash
# Multiple IPs attacking same shareId
# 100 bots × 10 req/min = 1,000 req/min
```

**Defense**:
- ✅ Per-shareId limit still applies
- ✅ Each shareId can only receive 10 req/min total
- ⚠️ But: Multiple shareIds can still cause load
- 🛡️ **Additional Protection Needed**: Cloudflare/Vercel edge rate limiting

### Scenario 3: Slow Brute Force

**Attack**:
```bash
# Try to find valid shareIds slowly
# 9 requests per minute to stay under limit
while true; do
  try_random_share_id()
  sleep 7  # 9 requests per minute
done
```

**Defense**:
- ⚠️ Rate limiting alone won't stop this
- 🛡️ **Additional Protection Needed**:
  - Longer shareIds (16 → 24 characters)
  - CAPTCHA after failed attempts
  - IP-based blocking for suspicious patterns

---

## Adjusting Rate Limits

### When to Increase Limits

✅ **Increase if**:
- Legitimate users consistently hitting limits
- High false positive rate
- Business requirement for higher throughput

### When to Decrease Limits

❌ **Decrease if**:
- Frequent abuse/violations
- Server load issues
- DoS attacks observed

### How to Adjust

```typescript
// In convex/rateLimit.ts

export const RATE_LIMITS = {
  shareView: {
    maxRequests: 20,   // Increased from 10
    windowMs: 60000,   // Keep window at 1 minute
  },
};

// Then redeploy: npx convex deploy
```

**Testing After Changes**:
```bash
# Load test with Artillery
artillery quick --count 50 --num 20 \
  https://noteflow.app/api/share/test-id

# Expected: 10 success, 40 rate limited (if limit is 10)
```

---

## Best Practices

### For Backend Development

✅ **DO**:
- Rate limit all public endpoints
- Use descriptive action names ("shareView", not "action1")
- Log violations for security monitoring
- Set reasonable limits (not too strict)
- Test rate limits in staging

❌ **DON'T**:
- Rate limit authenticated admin actions (they're already protected)
- Use the same identifier for different users (use unique IDs)
- Set limits too low (frustrates users)
- Forget to monitor violations

### For Production

✅ **DO**:
- Monitor violation logs weekly
- Set up alerts for >100 violations/hour
- Review and adjust limits quarterly
- Test limits before major releases
- Document limit changes

❌ **DON'T**:
- Ignore repeated violations
- Set and forget (limits need tuning)
- Disable rate limiting "temporarily"

---

## Troubleshooting

### Error: "Rate limit exceeded"

**For Users**:
- Wait 60 seconds and try again
- If persistent, contact support

**For Admins**:
1. Check if user is legitimate:
   ```typescript
   const status = await convex.query(api.rateLimit.getRateLimitStatus, {
     identifier: "user-id",
     action: "shareView"
   });
   ```

2. Review violations:
   ```typescript
   const violations = await convex.query(api.rateLimit.getViolations, {
     identifier: "user-id"
   });
   ```

3. Reset if false positive:
   ```typescript
   await convex.mutation(api.rateLimit.resetRateLimit, {
     identifier: "user-id",
     action: "shareView"
   });
   ```

### Rate Limits Not Working

**Checklist**:
- [ ] Schema deployed (`npx convex deploy`)
- [ ] `rateLimits` table exists
- [ ] `enforceRateLimit` called in mutation
- [ ] Correct action name used
- [ ] No errors in Convex logs

---

## Performance Impact

### Database Load

**Per Request**:
- 1 read (check current count)
- 1 write (increment or insert)
- Minimal: <10ms overhead

**Cleanup Job**:
- Runs hourly
- Deletes expired records
- Typical: <1000 records deleted
- Duration: <5 seconds

### Scalability

**At Scale**:
- 1,000 req/sec → 1,000 DB ops/sec (manageable)
- 1M users → ~100k active rate limit records (small)
- Indexes ensure fast lookups (O(log n))

**Bottlenecks**:
- ⚠️ If >10k violations/hour, review and block at edge
- ⚠️ If rate limit table >1M records, increase cleanup frequency

---

## Security Considerations

### What Rate Limiting Protects

✅ **Protects Against**:
- View count manipulation
- API abuse and spam
- Basic DoS attacks
- Resource exhaustion

⚠️ **Does NOT Protect Against**:
- Distributed attacks from many IPs (need WAF)
- Application-layer exploits (need input validation)
- Zero-day vulnerabilities
- Sophisticated attackers

### Defense in Depth

Rate limiting is **one layer** of security. Also implement:
1. **Edge Protection**: Cloudflare/Vercel rate limiting
2. **Input Validation**: Sanitize all user input
3. **Authentication**: Clerk JWT verification
4. **Authorization**: Ownership checks
5. **Monitoring**: Violation alerts
6. **Incident Response**: Documented procedures

---

## API Reference

### Mutations

- `checkRateLimit({ identifier, action })` - Check and enforce limit
- `resetRateLimit({ identifier, action })` - Admin: Reset limit

### Queries

- `getRateLimitStatus({ identifier, action })` - Get current status
- `getViolations({ identifier?, action?, limit? })` - Admin: View violations

### Internal

- `cleanupExpiredRecords()` - Cron job: Cleanup old records

---

## Support

**Questions?**
- Security: security@noteflow.com
- Technical: engineering@noteflow.com

**Reporting Abuse**:
If you notice API abuse, email security@noteflow.com with:
- Timestamp of incident
- Affected shareId or endpoint
- Description of suspicious activity

---

**Created**: 2025-11-08
**Last Updated**: 2025-11-08
**Version**: 1.0.0
