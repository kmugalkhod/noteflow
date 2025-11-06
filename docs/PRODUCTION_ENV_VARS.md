# Production Environment Variables Quick Reference

## Required for Vercel Deployment

Copy these environment variables to Vercel dashboard (Settings → Environment Variables):

### 1. Convex Backend (from `npx convex deploy --prod`)

```bash
CONVEX_DEPLOYMENT=prod:xxx-xxx-xxx
NEXT_PUBLIC_CONVEX_URL=https://xxx-xxx-xxx.convex.cloud
```

### 2. Clerk Authentication (from Clerk production dashboard)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
```

### 3. Clerk URLs (keep these values)

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/workspace
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/workspace
```

### 4. Application URL

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## Step-by-Step Setup

### Step 1: Deploy Convex to Production

```bash
npx convex deploy --prod
```

**Save these from output:**
- `CONVEX_DEPLOYMENT=prod:xxx-xxx-xxx`
- `NEXT_PUBLIC_CONVEX_URL=https://xxx-xxx-xxx.convex.cloud`

### Step 2: Get Clerk Production Keys

1. Go to https://dashboard.clerk.com
2. Create new production application (or use existing)
3. Copy keys from Dashboard → API Keys → Quick Copy
4. Save:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Step 3: Add to Vercel

1. Deploy to Vercel: `vercel --prod`
2. Note your production URL (e.g., `noteflow.vercel.app`)
3. Go to Vercel dashboard → Settings → Environment Variables
4. Add all 8 variables listed above
5. Set environment to: **Production**
6. Save changes

### Step 4: Update Clerk Domain

1. Go to Clerk dashboard → Settings → Domains
2. Add your Vercel production URL
3. Update authorized redirect URLs

### Step 5: Redeploy

```bash
vercel --prod
```

---

## Verification Checklist

- [ ] Convex dashboard shows production deployment
- [ ] All 8 environment variables added to Vercel
- [ ] Clerk dashboard has production domain configured
- [ ] Vercel deployment successful
- [ ] Can access production site and sign in
- [ ] No console errors in production

---

## Important Notes

⚠️ **Self-Hosted Convex**: Currently using self-hosted Convex for development. For production, you MUST switch to Convex Cloud (free tier supports ~1,000 active users).

⚠️ **Clerk Keys**: Use different keys for development and production. Never use test keys in production.

⚠️ **Admin Emails**: Update `ADMIN_EMAILS` array in `convex/adminAudit.ts` before deploying to production.

---

## Cost

All services offer generous free tiers:

- **Convex**: 1M function calls/month FREE
- **Vercel**: 100GB bandwidth/month FREE
- **Clerk**: 10,000 monthly active users FREE

**Total: $0/month** until you exceed these limits.

---

For detailed deployment instructions, see: [DEPLOYMENT_PLAN.md](../DEPLOYMENT_PLAN.md)
