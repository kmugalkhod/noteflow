# GitHub → Vercel CI/CD Pipeline Setup

Complete guide for setting up automatic deployments from GitHub to Vercel.

## 🎯 Overview

Once configured, every push to your `main` branch will automatically deploy to production. Pull requests get preview deployments.

---

## 📋 Prerequisites

- [x] GitHub repository: https://github.com/kmugalkhod/noteflow.git
- [ ] Convex production deployment
- [ ] Clerk production keys
- [ ] Vercel account

---

## 🚀 Step-by-Step Setup

### Step 1: Deploy Convex Backend to Production

This must be done first to get production URLs for Vercel configuration.

```bash
npx convex deploy --prod
```

**Save these values from output:**
```bash
CONVEX_DEPLOYMENT=prod:xxx-xxx-xxx
NEXT_PUBLIC_CONVEX_URL=https://xxx-xxx-xxx.convex.cloud
```

**Important Notes:**
- Currently using self-hosted Convex for development
- Production MUST use Convex Cloud (free tier: 1M calls/month)
- Update `ADMIN_EMAILS` in `convex/adminAudit.ts` before deploying

---

### Step 2: Get Clerk Production Keys

1. Go to https://dashboard.clerk.com
2. Create new production application (or switch to production mode)
3. Copy keys from Dashboard → API Keys → Quick Copy

**Save these values:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
```

**Note:** Use different keys than development. Production keys start with `pk_live_` and `sk_live_`.

---

### Step 3: Connect GitHub to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com/new
   - Sign in with GitHub account

2. **Import Repository:**
   - Click "Import Git Repository"
   - Select `kmugalkhod/noteflow`
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

4. **Environment Variables:**
   Click "Environment Variables" and add ALL of these:

   ```bash
   # Convex (from Step 1)
   CONVEX_DEPLOYMENT=prod:xxx-xxx-xxx
   NEXT_PUBLIC_CONVEX_URL=https://xxx-xxx-xxx.convex.cloud

   # Clerk (from Step 2)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
   CLERK_SECRET_KEY=sk_live_xxxxx

   # Clerk URLs (keep these values)
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/workspace
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/workspace

   # Application URL (update after deployment)
   NEXT_PUBLIC_APP_URL=https://noteflow.vercel.app
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Note your production URL (e.g., `noteflow.vercel.app`)

---

### Step 4: Update Clerk Authorized Domains

After first deployment:

1. Go to Clerk dashboard → Settings → Domains
2. Add your Vercel production URL: `noteflow.vercel.app`
3. Update authorized redirect URLs:
   - Sign-in URL: `https://noteflow.vercel.app/login`
   - Sign-up URL: `https://noteflow.vercel.app/register`
   - After sign-in: `https://noteflow.vercel.app/workspace`

---

### Step 5: Update Application URL

1. Go to Vercel dashboard → Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your production URL
3. Redeploy (Vercel will auto-redeploy on env var change)

---

## 🔄 How It Works

### Automatic Deployments

**Push to `main` branch:**
```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```
→ Vercel automatically deploys to production

**Create Pull Request:**
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR on GitHub
```
→ Vercel creates preview deployment with unique URL

**Merge PR:**
→ Vercel deploys to production automatically

---

## 🎛️ Vercel Dashboard Features

### Deployments Tab
- View all deployments (production + previews)
- Rollback to previous versions
- View build logs and errors

### Settings → Environment Variables
- Manage production/preview/development env vars
- Update environment variables (triggers redeploy)
- Secure secrets management

### Settings → Git
- Configure branches for auto-deploy
- Enable/disable preview deployments
- Set up deployment protection

### Settings → Domains
- Add custom domain (optional)
- Configure DNS
- Enable automatic HTTPS

---

## 📊 Monitoring & Alerts

### Convex Dashboard
- Monitor function call usage
- Set alerts at 80% of free tier (800K calls)
- View deployment logs

### Vercel Dashboard
- Monitor bandwidth usage
- View analytics and page performance
- Check build and runtime logs

### Recommended Alerts
1. Convex: Email alert at 800K function calls/month
2. Vercel: Monitor dashboard weekly for bandwidth
3. Clerk: Check usage monthly (10K MAU free tier)

---

## 🛠️ Common Tasks

### Update Environment Variable
1. Vercel dashboard → Settings → Environment Variables
2. Edit variable
3. Save (triggers automatic redeploy)

### Rollback Deployment
1. Vercel dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### View Build Logs
1. Vercel dashboard → Deployments
2. Click on deployment
3. View "Building" tab for logs

### Force Redeploy
1. Vercel dashboard → Deployments
2. Latest deployment → "..." → "Redeploy"
3. Or push empty commit:
   ```bash
   git commit --allow-empty -m "chore: trigger redeploy"
   git push origin main
   ```

---

## 🐛 Troubleshooting

### Build Fails
**Check:**
- Build logs in Vercel dashboard
- All environment variables are set
- `npm run build` works locally

**Common fixes:**
- Missing environment variables
- TypeScript errors
- Module resolution issues

### Runtime Errors
**Check:**
- Function logs in Vercel dashboard
- Browser console for client errors
- Convex dashboard for backend errors

**Common fixes:**
- Wrong Convex URL (dev vs prod)
- Clerk domain not authorized
- CORS issues

### Authentication Not Working
**Check:**
- Clerk production keys are correct
- Domain is authorized in Clerk dashboard
- Redirect URLs match production domain

---

## 🎉 Benefits of CI/CD

✅ **Automatic deployments** - No manual deploy commands
✅ **Preview deployments** - Test PRs before merging
✅ **Zero downtime** - Seamless deployments
✅ **Instant rollbacks** - Quick recovery from issues
✅ **Team collaboration** - Everyone can trigger deploys
✅ **Deployment history** - Track all changes
✅ **Environment isolation** - Separate dev/staging/prod

---

## 📝 Next Steps

After initial deployment:

1. ✅ Test production site end-to-end
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring alerts
4. ✅ Update README with production URL
5. ✅ Create deployment runbook for team

---

## 🔗 Useful Links

- **GitHub Repository:** https://github.com/kmugalkhod/noteflow.git
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Convex Dashboard:** https://dashboard.convex.dev
- **Clerk Dashboard:** https://dashboard.clerk.com

---

## 💰 Cost Estimate

All on free tier until you scale:

| Service | Free Tier | Supports | Cost After |
|---------|-----------|----------|------------|
| Convex | 1M calls/month | ~1,000 active users | $25/month |
| Vercel | 100GB bandwidth | ~10K visitors/month | $20/month |
| Clerk | 10K MAU | 10,000 active users | $25/month |

**Total: $0/month** for early stage, $70/month at scale.

---

For detailed environment variable reference, see: [PRODUCTION_ENV_VARS.md](./PRODUCTION_ENV_VARS.md)
