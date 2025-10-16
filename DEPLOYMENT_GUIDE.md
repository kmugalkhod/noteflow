# 🚀 NoteFlow Deployment Guide

## Prerequisites Checklist

Before deploying, ensure you have:
- ✅ Build passes locally (`npm run build`)
- ✅ All features working in development
- ✅ Git repository initialized
- ⏳ Vercel account (create at [vercel.com](https://vercel.com))
- ⏳ Convex production deployment
- ⏳ Clerk production instance

---

## Step 1: Prepare for Deployment

### 1.1 Commit Your Changes

```bash
# Stage all files
git add -A

# Create commit
git commit -m "feat: complete NoteFlow app with authentication and note management

✨ Features:
- Clerk authentication with login/register
- Convex backend with notes, folders, tags
- Rich text note editor with auto-save
- Folder organization system
- Responsive dashboard UI
- Protected routes with middleware

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub (if you have a remote)
git push origin main
```

### 1.2 Create GitHub Repository (if not done)

If you haven't pushed to GitHub yet:

```bash
# Create a new repo on GitHub: https://github.com/new
# Then:
git remote add origin https://github.com/YOUR_USERNAME/noteflow.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up Convex Production

### 2.1 Deploy Convex Backend

```bash
# Deploy to production
npx convex deploy --prod
```

This will:
- Create a production Convex deployment
- Give you a production URL: `https://your-deployment.convex.cloud`
- Automatically push your schema and functions

### 2.2 Save Convex Production URL

Copy the production URL displayed. You'll need it for Vercel environment variables.

**Example:**
```
CONVEX_DEPLOYMENT=prod:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## Step 3: Set Up Clerk Production

### 3.1 Create Production Application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Click **"Create Application"** or use your existing one
3. Select **Production** environment
4. Configure:
   - **Application name:** NoteFlow
   - **Sign-in options:** Email + Password
   - **Disable email verification** (optional for MVP)

### 3.2 Get Production API Keys

1. In Clerk Dashboard → **API Keys**
2. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_...`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_...`)

### 3.3 Configure Production URLs

In Clerk Dashboard → **Paths**:

```
Sign-in path: /login
Sign-up path: /register
Home URL: /workspace
Sign-in fallback redirect: /workspace
Sign-up fallback redirect: /workspace
```

### 3.4 Add Production Domain

After deploying to Vercel, add your domain:

1. Clerk Dashboard → **Domains**
2. Click **"Add domain"**
3. Enter your Vercel URL: `https://your-app.vercel.app`
4. Click **"Add domain"**

---

## Step 4: Deploy to Vercel

### 4.1 Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 4.2 Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. Click **"Add New Project"**
3. **Import your GitHub repository**
4. **Configure project:**
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Add Environment Variables:**

   Click **"Environment Variables"** and add:

   ```env
   # Convex Production
   CONVEX_DEPLOYMENT=prod:your-deployment-name
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

   # Clerk Production
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...

   # Clerk URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/workspace
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/workspace
   ```

6. **Click "Deploy"**

### 4.3 Deploy via Vercel CLI (Alternative)

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? noteflow
# - Directory? ./
# - Override settings? No
```

After deployment, add environment variables:

```bash
# Add Convex variables
vercel env add CONVEX_DEPLOYMENT production
vercel env add NEXT_PUBLIC_CONVEX_URL production

# Add Clerk variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production

# Redeploy with new env vars
vercel --prod
```

---

## Step 5: Configure Clerk with Vercel Domain

After Vercel deployment completes:

1. **Copy your Vercel URL:** `https://your-app.vercel.app`
2. **Go to Clerk Dashboard → Domains**
3. **Add your production domain**
4. **Configure JWT template (for Convex):**
   - Go to **JWT Templates** → **Convex**
   - Click **"Apply"**

---

## Step 6: Connect Convex to Clerk

### 6.1 Add Clerk to Convex

```bash
# In your terminal
npx convex deploy --prod
```

### 6.2 Configure Clerk in Convex Dashboard

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your production deployment
3. Go to **Settings → Authentication**
4. Click **"Add Provider"** → **Clerk**
5. Enter your Clerk **Domain** (from Clerk dashboard)
6. Save

---

## Step 7: Test Production Deployment

### 7.1 Visit Your App

```
https://your-app.vercel.app
```

### 7.2 Test Authentication Flow

1. **Visit homepage** → Should redirect to `/login`
2. **Register a new account**
3. **Verify redirect to `/workspace`**
4. **Create a new note**
5. **Create a folder**
6. **Test auto-save**
7. **Logout and login again**

### 7.3 Check Logs

**Vercel Logs:**
- Vercel Dashboard → Your Project → Deployments → View Function Logs

**Convex Logs:**
- Convex Dashboard → Your Deployment → Logs

**Clerk Logs:**
- Clerk Dashboard → Logs

---

## Step 8: Custom Domain (Optional)

### 8.1 Add Custom Domain in Vercel

1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `noteflow.com`
4. Follow DNS configuration instructions

### 8.2 Update Clerk Domain

1. Clerk Dashboard → **Domains**
2. **Add your custom domain**
3. Update production URLs

### 8.3 Update Environment Variables

```env
NEXT_PUBLIC_APP_URL=https://noteflow.com
```

---

## Troubleshooting

### Issue: "Invalid publishable key"

**Solution:**
- Check you're using `pk_live_...` (not `pk_test_...`)
- Verify environment variables in Vercel
- Redeploy after adding variables

### Issue: "Convex function not found"

**Solution:**
```bash
npx convex deploy --prod
```

### Issue: "Unauthorized" when creating notes

**Solution:**
- Check Clerk JWT template is configured for Convex
- Verify Clerk domain is added in Convex dashboard
- Check Convex authentication provider is set up

### Issue: Authentication redirects not working

**Solution:**
- Verify Clerk paths are configured correctly
- Check environment variables for Clerk URLs
- Add production domain in Clerk dashboard

### Issue: Build fails on Vercel

**Solution:**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check Vercel build logs for specific error
```

---

## Environment Variables Summary

### Required for Production

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `CONVEX_DEPLOYMENT` | `prod:amazing-animal-123` | Convex Dashboard |
| `NEXT_PUBLIC_CONVEX_URL` | `https://amazing-animal-123.convex.cloud` | Convex Dashboard |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | `sk_live_...` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` | Static |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/register` | Static |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/workspace` | Static |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/workspace` | Static |

---

## Quick Deployment Checklist

- [ ] Run `npm run build` locally (must pass)
- [ ] Commit all changes to git
- [ ] Push to GitHub
- [ ] Deploy Convex: `npx convex deploy --prod`
- [ ] Create Clerk production app
- [ ] Deploy to Vercel (add env vars)
- [ ] Add Vercel domain to Clerk
- [ ] Configure Clerk in Convex dashboard
- [ ] Test authentication flow
- [ ] Test note creation
- [ ] Test folder creation
- [ ] Check all pages load correctly

---

## Post-Deployment

### Monitoring

- **Vercel Analytics:** Enable in project settings
- **Convex Metrics:** Check dashboard for function performance
- **Clerk Analytics:** Monitor sign-ups and active users

### Continuous Deployment

After initial deployment, any push to `main` branch will automatically deploy to Vercel.

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel automatically deploys
```

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Convex Production Deployment](https://docs.convex.dev/production)
- [Clerk Production Checklist](https://clerk.com/docs/deployments/production-checklist)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Status:** Ready to Deploy ✅

Your app is production-ready. Follow the steps above to deploy! 🚀
