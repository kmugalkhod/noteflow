# Vercel Production Deployment Guide

Complete step-by-step guide to deploy NoteFlow to Vercel with GitHub CI/CD pipeline and custom domain **noteflow.co.in**.

## ✅ Prerequisites Checklist

- [x] ✅ Convex deployed to production
- [x] ✅ Code pushed to GitHub: https://github.com/kmugalkhod/noteflow.git
- [x] ✅ Custom domain purchased: noteflow.co.in
- [ ] Clerk production keys ready
- [ ] Vercel account created

---

## 📋 What You'll Need

### 1. Convex Production URLs

```bash
CONVEX_DEPLOYMENT=prod:efficient-kookabura-904  # or similar
NEXT_PUBLIC_CONVEX_URL=https://efficient-kookabura-904.convex.cloud
```

**Where to find them:**
- Check terminal output from `npx convex deploy`
- Or: https://dashboard.convex.dev → Your Project → Settings

### 2. Clerk Production Keys

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
```

### 3. Domain Access

- Access to DNS settings for **noteflow.co.in**
- Domain registrar login credentials

---

## 🚀 Step-by-Step Deployment

### Step 1: Get Clerk Production Keys

**Create New Production Application:**

1. Go to https://dashboard.clerk.com
2. Click "Create application"
3. Name: "NoteFlow Production"
4. Enable providers:
   - ✅ Email
   - ✅ Google (optional)
   - ✅ GitHub (optional)
5. Click "Create application"
6. **Copy the keys** (start with `pk_live_` and `sk_live_`)

**Save these - you'll need them:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
```

---

### Step 2: Connect GitHub to Vercel

1. **Go to Vercel:**
   - Visit: https://vercel.com/new
   - Sign in with GitHub

2. **Import Repository:**
   - Click "Import Git Repository"
   - Search: `kmugalkhod/noteflow`
   - Click "Import"

3. **Configure Project:**
   - **Project Name:** noteflow
   - **Framework:** Next.js ✅ (auto-detected)
   - **Root Directory:** `./`
   - Keep all defaults

4. **DO NOT DEPLOY YET** - Add environment variables first

---

### Step 3: Add Environment Variables

Add these **9 variables** in Vercel:

#### Convex Configuration

```bash
CONVEX_DEPLOYMENT=prod:efficient-kookabura-904
NEXT_PUBLIC_CONVEX_URL=https://efficient-kookabura-904.convex.cloud
```

#### Clerk Configuration

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
```

#### Clerk URLs

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/workspace
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/workspace
```

#### Application URL

```bash
NEXT_PUBLIC_APP_URL=https://noteflow.co.in
```

**How to add:**
1. Enter variable name
2. Enter value
3. Select "Production" environment
4. Click "Add"
5. Repeat for all 9 variables

---

### Step 4: Initial Deployment

1. Click **"Deploy"**
2. Wait for build (2-5 minutes)
3. Note temporary URL: `noteflow-xxxx.vercel.app`

**Don't test yet - we'll add custom domain first**

---

### Step 5: Add Custom Domain (noteflow.co.in)

#### In Vercel Dashboard:

1. Go to your project → **Settings → Domains**
2. Click **"Add"**
3. Enter domain options:

   **Option A: With www (Recommended)**
   ```
   noteflow.co.in
   www.noteflow.co.in
   ```
   Add both, set `noteflow.co.in` as primary

   **Option B: Without www**
   ```
   noteflow.co.in
   ```

4. Click **"Add"**

#### Vercel will show DNS records to configure:

**For Root Domain (noteflow.co.in):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain (www.noteflow.co.in):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Keep this page open - you'll need these values**

---

### Step 6: Configure DNS at Your Domain Registrar

#### Where is noteflow.co.in registered?

**Common registrars:** GoDaddy, Namecheap, Google Domains, Hostinger, etc.

#### DNS Configuration Steps:

1. **Login to your domain registrar**
2. **Find DNS Settings:**
   - Look for: "DNS Management", "DNS Settings", or "Nameservers"
3. **Add DNS Records:**

   **Add A Record (for noteflow.co.in):**
   ```
   Type: A
   Host/Name: @ (or leave blank)
   Points to/Value: 76.76.21.21
   TTL: 3600 (or automatic)
   ```

   **Add CNAME Record (for www.noteflow.co.in):**
   ```
   Type: CNAME
   Host/Name: www
   Points to/Value: cname.vercel-dns.com
   TTL: 3600 (or automatic)
   ```

4. **Remove conflicting records:**
   - Delete any existing A records for `@` or `noteflow.co.in`
   - Delete any existing CNAME for `www`

5. **Save changes**

#### DNS Propagation:

- **Fast:** 5-10 minutes (common)
- **Typical:** 1-2 hours
- **Maximum:** 24-48 hours

**Check status:**
```bash
# In terminal
dig noteflow.co.in
dig www.noteflow.co.in
```

Or use: https://dnschecker.org

---

### Step 7: Verify Domain in Vercel

1. Wait 5-10 minutes after DNS changes
2. Go back to Vercel → Settings → Domains
3. Check domain status:
   - ✅ **Valid Configuration** - Domain is working!
   - ⏳ **Pending** - DNS not propagated yet
   - ❌ **Invalid** - Check DNS configuration

4. **HTTPS Certificate:**
   - Vercel automatically issues SSL certificate
   - Takes 1-2 minutes after domain verification
   - Your site will be accessible via `https://noteflow.co.in`

---

### Step 8: Update Clerk with Custom Domain

1. **Go to Clerk Dashboard:**
   - https://dashboard.clerk.com
   - Select production application

2. **Add Domain:**
   - Settings → Domains
   - Click "Add domain"
   - Enter: `noteflow.co.in`
   - Click "Add"
   - Also add: `www.noteflow.co.in` (if using)

3. **Verify Redirect URLs:**
   - Settings → Paths
   - Confirm:
     - Sign-in: `/login`
     - Sign-up: `/register`
     - After sign-in: `/workspace`
     - After sign-up: `/workspace`

4. **Save changes**

---

### Step 9: Test Production Site

Visit: **https://noteflow.co.in**

#### Test Checklist:

- [ ] Homepage loads (no errors)
- [ ] HTTPS working (padlock in browser)
- [ ] www.noteflow.co.in redirects to noteflow.co.in
- [ ] Navigate to /login
- [ ] Sign up with test account
- [ ] Email verification (if enabled)
- [ ] Create a note
- [ ] Edit note
- [ ] Create folder
- [ ] Add tags
- [ ] Test Excalidraw drawing
- [ ] Check /privacy, /terms, /security pages
- [ ] No console errors (F12)
- [ ] Test on mobile device

#### Browser Console Check:
1. Press F12
2. Go to Console tab
3. Should see no red errors

---

## 🔄 CI/CD Pipeline Active!

### Automatic Deployments

Every push to `main` branch auto-deploys:

```bash
git add .
git commit -m "feat: new feature"
git push origin main
```
→ Live on **noteflow.co.in** in ~3-5 minutes

### Preview Deployments

Pull requests get preview URLs:
```bash
git checkout -b feature/awesome
git push origin feature/awesome
# Create PR on GitHub
```
→ Get preview URL: `noteflow-git-feature-awesome-xxx.vercel.app`

---

## 🌐 Domain Configuration Details

### DNS Records Summary

**What you configured:**

| Type | Host | Value | Purpose |
|------|------|-------|---------|
| A | @ | 76.76.21.21 | Points noteflow.co.in to Vercel |
| CNAME | www | cname.vercel-dns.com | Points www to Vercel |

### How Domains Work:

- `noteflow.co.in` → Primary domain (A record)
- `www.noteflow.co.in` → Redirects to primary (CNAME)
- Vercel handles HTTPS automatically
- Global CDN for fast loading worldwide

### Subdomain Options (Future):

You can add subdomains later:
- `api.noteflow.co.in` - API server
- `docs.noteflow.co.in` - Documentation
- `blog.noteflow.co.in` - Blog

Add CNAME records for each:
```
Type: CNAME
Host: subdomain-name
Value: cname.vercel-dns.com
```

---

## 📊 Monitor Your Production Site

### Vercel Dashboard
https://vercel.com/dashboard

**Check:**
- Deployments (every git push)
- Analytics (traffic, performance)
- Logs (errors, functions)
- Bandwidth usage

### Convex Dashboard
https://dashboard.convex.dev

**Monitor:**
- Function calls (1M free/month)
- Database queries
- Usage alerts (set at 80%)

### Clerk Dashboard
https://dashboard.clerk.com

**Track:**
- User sign-ups
- Active users (10K free/month)
- Authentication logs

---

## 🛠️ Common Management Tasks

### Update Environment Variable

1. Vercel → Settings → Environment Variables
2. Edit variable → Save
3. Auto-redeploys

### Force Redeploy

**Option 1:** Vercel dashboard → Deployments → "Redeploy"

**Option 2:** Push empty commit
```bash
git commit --allow-empty -m "chore: redeploy"
git push origin main
```

### Rollback Deployment

1. Vercel → Deployments
2. Find working deployment
3. "..." → "Promote to Production"

### View Logs

- **Build logs:** Vercel → Deployments → Click deployment
- **Runtime logs:** Vercel → Logs tab
- **Function logs:** Convex → Functions tab

---

## 🐛 Troubleshooting

### Domain Not Working

**Symptoms:**
- `noteflow.co.in` doesn't load
- Shows old site or parking page
- SSL errors

**Check:**
1. DNS propagation: https://dnschecker.org
2. Vercel domain status (should be ✅ Valid)
3. Clear browser cache (Ctrl+Shift+R)
4. Try incognito mode

**Fix:**
- Wait for DNS propagation (up to 48 hours)
- Verify DNS records match Vercel's instructions
- Check no old A/CNAME records conflict

### SSL Certificate Issues

**Symptoms:**
- "Not Secure" warning
- Certificate error

**Fix:**
- Vercel auto-issues certificates
- Can take 1-2 minutes after domain verification
- Try: Vercel → Domains → "Renew Certificate"

### Authentication Errors

**Symptoms:**
- Can't login
- "Invalid domain" error
- Redirect loops

**Fix:**
1. Clerk dashboard → Domains
2. Ensure `noteflow.co.in` is listed
3. Check both `noteflow.co.in` and `www.noteflow.co.in`
4. Verify production keys (not test keys)

### Build Failures

**Check:**
- Vercel → Deployments → Build logs
- All 9 environment variables set
- `npm run build` works locally

### Convex Connection Errors

**Fix:**
- Verify `NEXT_PUBLIC_CONVEX_URL` in Vercel
- Should be `https://xxx.convex.cloud` (not localhost)
- Check Convex dashboard shows active deployment

---

## 💰 Cost & Scaling

### Current Setup: $0/month

| Service | Free Tier | Limit |
|---------|-----------|-------|
| Convex | 1M calls/month | ~1,000 users |
| Vercel | 100GB bandwidth | ~10K visitors |
| Clerk | 10K MAU | 10,000 users |
| Domain | ~$10-15/year | noteflow.co.in |

### When to Upgrade:

**Convex ($25/month):**
- After 1M function calls
- ~1,000 active users

**Vercel ($20/month):**
- After 100GB bandwidth
- ~10,000 monthly visitors

**Clerk ($25/month):**
- After 10,000 monthly active users

### Set Alerts:

1. Convex: Alert at 800K calls (80%)
2. Vercel: Monitor weekly
3. Clerk: Check MAU monthly

---

## ✅ Final Checklist

- [ ] ✅ Vercel deployment successful
- [ ] ✅ Custom domain noteflow.co.in working
- [ ] ✅ HTTPS enabled (SSL certificate)
- [ ] ✅ www redirect working
- [ ] ✅ All features tested
- [ ] ✅ Clerk authentication working
- [ ] ✅ Convex connection successful
- [ ] ✅ No console errors
- [ ] ✅ Mobile responsive
- [ ] ✅ Legal pages accessible
- [ ] ✅ CI/CD pipeline active
- [ ] ✅ Usage monitoring configured

---

## 🎉 Success!

Your NoteFlow app is live at:

🌐 **https://noteflow.co.in**

**What you have:**
- ✅ Custom domain with HTTPS
- ✅ Automatic deployments from GitHub
- ✅ Free hosting (scalable to 1K users)
- ✅ Preview deployments for PRs
- ✅ Global CDN
- ✅ Zero downtime deployments

---

## 🔗 Important Links

- **🌐 Production:** https://noteflow.co.in
- **📦 GitHub:** https://github.com/kmugalkhod/noteflow.git
- **☁️ Vercel:** https://vercel.com/dashboard
- **🗄️ Convex:** https://dashboard.convex.dev
- **🔐 Clerk:** https://dashboard.clerk.com
- **🌍 DNS Checker:** https://dnschecker.org

---

## 📚 Next Steps

1. ✅ Share noteflow.co.in with users
2. 📧 Set up email notifications
3. 📊 Add analytics (Google Analytics, PostHog)
4. 🎨 Create social share images
5. 📱 Submit to app stores (PWA)
6. 💌 Create marketing pages
7. 📈 Monitor growth and scale

**Ready to launch! 🚀**
