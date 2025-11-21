# AI Features Deployment Guide for Vercel

This guide explains how to deploy the whitelabeled AI system to Vercel.

## How It Works

The AI system has two parts:
1. **Next.js API Routes** (`/api/ai/*`) - Running on Vercel (your Next.js app)
2. **Convex Actions** (`convex/ai.ts`) - Running on Convex Cloud

When a user triggers an AI feature:
1. Frontend calls Convex action (e.g., `generateContent`)
2. Convex action fetches the Next.js API route
3. Next.js API route decrypts the user's API key and calls their chosen AI provider
4. Response flows back to the frontend

## Deployment Steps

### 1. Deploy to Vercel

```bash
# Push your code to GitHub
git add .
git commit -m "feat: add whitelabeled AI system"
git push

# Deploy via Vercel Dashboard or CLI
vercel --prod
```

After deployment, Vercel will give you a URL like: `https://noteflow-xyz.vercel.app`

### 2. Configure Convex Environment Variables

The Convex actions need to know your production URL. Set the `SITE_URL` environment variable in Convex:

```bash
# For production deployment
npx convex env set SITE_URL https://noteflow-xyz.vercel.app --prod

# For development (already works with localhost:3001)
# npx convex env set SITE_URL http://localhost:3001 --dev
```

**Important:** Replace `https://noteflow-xyz.vercel.app` with your actual Vercel deployment URL.

### 3. Verify Convex Deployment

```bash
# Deploy Convex functions to production
npx convex deploy --prod
```

### 4. Set Encryption Key in Vercel

Make sure your Vercel project has the encryption key environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `ENCRYPTION_KEY` with a 64-character hex string (same as in `.env.local`)

You can generate a new one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Environment Variables Summary

### Convex Environment Variables (via `npx convex env`)
```bash
SITE_URL=https://your-app.vercel.app  # Production URL
```

### Vercel Environment Variables (via Vercel Dashboard)
```bash
ENCRYPTION_KEY=your-64-character-hex-string
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
# ... other Clerk, database vars
```

### Local Development (.env.local)
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Not used by Convex, only for Next.js
ENCRYPTION_KEY=your-64-character-hex-string
CONVEX_DEPLOYMENT=dev:your-dev-deployment
```

## How It Handles Different Environments

The code in `convex/ai.ts` automatically handles all three environments:

```typescript
const siteUrl = process.env.SITE_URL || "http://host.docker.internal:3000";
```

- **Local Development (Docker-based Convex):** Uses fallback `http://host.docker.internal:3000`
  - `host.docker.internal` is a special DNS name that Docker provides to access the host machine
  - This allows Convex running in Docker to reach Next.js on your host machine
- **Local Development (Cloud Convex):** Set `SITE_URL` to your local IP: `npx convex env set SITE_URL http://192.168.1.10:3000`
- **Production:** Uses Convex env var `SITE_URL` (set via `npx convex env set SITE_URL https://your-app.vercel.app --prod`)

## Testing in Production

1. Deploy to Vercel
2. Set `SITE_URL` in Convex
3. Go to your production app
4. Navigate to Settings
5. Configure your AI provider and API key
6. Test "Ask AI", "Summarize", or "Continue Writing" features

## Troubleshooting

### Error: "Connection refused" in production
- Check that `SITE_URL` is set correctly in Convex: `npx convex env get SITE_URL --prod`
- Verify your Vercel deployment is live and accessible

### Error: "Connection refused" in local development
- **If using Docker-based Convex:** Make sure Next.js is running on port 3000 (should work with `host.docker.internal:3000`)
- **If using Convex Cloud in dev:** Set your local network IP: `npx convex env set SITE_URL http://192.168.1.X:3000`
- Check that Next.js dev server is actually running: `lsof -i :3000`

### Error: "AI not configured"
- User needs to go to Settings and configure their AI provider/key first

### Error: "Failed to generate content"
- Check user's API key is valid for their chosen provider
- Check Vercel logs for API route errors
- Check Convex logs for action errors

## Security Notes

- API keys are encrypted with AES-256-GCM before storage
- Encryption happens server-side (Next.js server action)
- Decryption happens server-side (API routes)
- API keys never exposed to client
- Each user uses their own API key (not shared)
