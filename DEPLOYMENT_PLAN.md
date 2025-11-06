# NoteFlow Deployment Plan

## 📋 Summary

Your concern: **Data privacy** - You don't want to be able to see user data even though you control the database.

**Solution**: Deploy with **standard security + audit logging** now, add **end-to-end encryption** later as a premium feature.

---

## 🚀 Recommended Deployment Strategy

### **Option: Free-Tier Multi-Tenant (RECOMMENDED)**

```
┌─────────────────────────────────────────┐
│  Frontend: Vercel (Free Tier)          │
│  - Next.js 15 app                       │
│  - Global CDN                           │
│  - Automatic HTTPS                      │
│  - Cost: $0/month                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Backend: Convex (Free Tier)           │
│  - Single deployment for all users      │
│  - Row-level security (userId)          │
│  - 1M function calls/month FREE         │
│  - Cost: $0/month                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Auth: Clerk (Free Tier)                │
│  - 10,000 MAU FREE                      │
│  - Social login                         │
│  - Cost: $0/month                       │
└─────────────────────────────────────────┘

**Total Monthly Cost: $0**
```

---

## 🔒 Data Privacy Solution

### What You've Implemented:

1. **✅ Row-Level Security**
   - All tables have `userId` field
   - Convex queries filter by authenticated user
   - Users cannot access each other's data

2. **✅ Clerk Authentication**
   - Secure JWT tokens
   - No password management on your end
   - Industry-standard auth

3. **✅ Admin Audit Logging** (NEW)
   - File: `convex/adminAudit.ts`
   - Schema updated: `adminAuditLog` table
   - Any admin access to user data is logged
   - Users can see who accessed their data and when

4. **✅ Encryption Library** (NEW - Optional)
   - File: `lib/encryption.ts`
   - File: `hooks/useNoteEncryption.ts`
   - Ready to implement E2EE when needed

### What This Means:

**Standard Security (Current)**:
- ✅ Users cannot access each other's data
- ✅ All access is logged and auditable
- ⚠️ You (admin) CAN technically query database
- ✅ But you commit to NOT doing so (except for support)
- ✅ Any support access is logged in `adminAuditLog`

**Optional E2EE (Future)**:
- ✅ Library is ready (`lib/encryption.ts`)
- ✅ Notes encrypted before saving
- ✅ Even you cannot read encrypted notes
- ⏳ Implement when needed (premium feature)

---

## 📊 Cost Analysis

### Free Tier Limits:

| Service | Free Tier | When You Pay | Cost if Exceeded |
|---------|-----------|--------------|------------------|
| **Vercel** | 100GB bandwidth | >100GB/month | $20/month |
| **Convex** | 1M function calls | >1M/month | $25/month |
| **Clerk** | 10,000 MAU | >10K users | $25/month |

### What 1M Function Calls Means:

```
Assumptions:
- Average user: 20 notes
- Queries per visit: ~10 (list notes, get folders, get tags, etc.)
- Average visits: 3 times/day

Monthly usage per user:
3 visits × 10 queries × 30 days = 900 queries/user/month

Free tier supports:
1,000,000 ÷ 900 = ~1,111 active users

For 1,000 users: ~900K queries/month (within free tier)
```

**Bottom line**: Free until ~1,000+ active monthly users

---

## 🎯 Deployment Steps

### Phase 1: Production Deployment

1. **Deploy Convex Backend**:
   ```bash
   npx convex deploy --prod
   ```

   This creates:
   - Production Convex deployment
   - Generates `NEXT_PUBLIC_CONVEX_URL`
   - Generates `CONVEX_DEPLOYMENT`

2. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

3. **Set Environment Variables in Vercel**:
   - Go to Vercel dashboard → Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_CONVEX_URL` (from step 1)
     - `CONVEX_DEPLOYMENT` (from step 1)
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Phase 2: Domain & Branding

1. **Add Custom Domain** (Optional):
   - Vercel: Settings → Domains
   - Add your domain (e.g., noteflow.app)
   - Configure DNS

2. **Update Clerk URLs**:
   - Clerk dashboard → Settings → Paths
   - Set authorized domains
   - Update redirect URLs

### Phase 3: Monitoring

1. **Set up alerts**:
   - Convex dashboard → Usage
   - Set alert at 80% of free tier (800K queries)

2. **Monitor costs**:
   - Check weekly initially
   - Monthly after stable

---

## 🛡️ Privacy & Compliance

### Privacy Policy (Required):

Create `/public/privacy-policy.md`:

```markdown
# Privacy Policy

## Data We Collect
- Email address (for authentication)
- Notes and content you create
- Usage analytics (optional)

## How We Use It
- To provide the NoteFlow service
- To improve the product
- To provide customer support

## Data Security
- All data is encrypted in transit (HTTPS)
- Database access is logged and restricted
- We do NOT read your notes except when:
  - You explicitly request support
  - Required by law enforcement with valid warrant
- All admin access is logged in audit trails

## Your Rights
- Export your data anytime
- Delete your account and all data
- Request audit log of who accessed your data

## Third-Party Services
- Clerk (authentication)
- Convex (database hosting)
- Vercel (hosting)

See their privacy policies for details.

## Contact
- Email: privacy@noteflow.com
```

### Internal Policy (For You):

**Admin Access Policy**:

```markdown
# Internal Admin Access Policy

## When Admin Can Access User Data:

1. ✅ User explicitly requests support (logged)
2. ✅ Bug investigation with user permission (logged)
3. ✅ Legal/law enforcement (logged + documented)
4. ❌ NEVER for curiosity
5. ❌ NEVER for personal benefit
6. ❌ NEVER shared with third parties

## Logging Requirement:

Every access must use:
```typescript
await logAdminAccess({
  adminEmail: "your@email.com",
  targetUserId: "user_123",
  action: "viewed_notes",
  reason: "Support ticket #456"
});
```

## Audit:
- Review audit logs monthly
- Users can request their audit log anytime
```

---

## 💡 Recommendations

### For Launch (Now):

1. ✅ Deploy with standard security
2. ✅ Add privacy policy
3. ✅ Use audit logging
4. ✅ Don't access user data unless necessary
5. ✅ Be transparent about security model

### For Growth (3-6 months):

1. Add E2EE as premium feature ($5/month)
2. Market as "zero-knowledge encryption"
3. Competitive advantage

### For Scale (6-12 months):

1. Offer enterprise features:
   - SOC 2 compliance
   - Custom data retention
   - Advanced audit logs
2. Charge $10-20/month for business plan

---

## ❓ FAQ

### Q: Can you read my notes?
**A**: Technically yes (database admin access), but:
- We have strict internal policies against it
- All access is logged
- We only access data for support or legal requirements
- You can request your audit log anytime

### Q: What if I want guaranteed privacy?
**A**: We're building end-to-end encryption feature where even we cannot read your notes. Coming in v2.0. Join waitlist!

### Q: How is this different from Notion?
**A**: Same security model. Notion, Evernote, Google Docs all use this approach. It's industry standard.

### Q: What about encryption at rest?
**A**: Convex encrypts all data at rest automatically. This protects against server breaches, but we (admin) can still decrypt with proper access.

### Q: Can I host my own database?
**A**: Not currently. For self-hosting, use our "Deploy to Vercel" button (coming soon) to run your own instance.

---

## 🎉 Bottom Line

### Your Deployment Path:

1. **Deploy now** with standard security ✅
   - Cost: $0/month
   - Secure enough for 99% of users
   - Same as Notion, Evernote, etc.

2. **Add E2EE later** as differentiator ✨
   - Premium feature
   - Marketing advantage
   - True zero-knowledge

3. **Monitor growth** 📊
   - Free until 1K+ users
   - Then monetize or upgrade

### What You Get:

- ✅ Free hosting for small-medium scale
- ✅ Professional security (industry standard)
- ✅ Audit logging (transparency)
- ✅ Path to E2EE (future)
- ✅ No database costs initially
- ✅ Scalable architecture

---

## 🚦 Next Steps

**Ready to deploy?**

1. Run: `npx convex deploy --prod`
2. Run: `vercel --prod`
3. Set environment variables
4. Test production site
5. Add privacy policy
6. Launch! 🎉

**Questions?**

Let me know which step you want help with!
