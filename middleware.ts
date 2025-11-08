import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/register(.*)",
  "/sso-callback(.*)",
  "/share(.*)", // Public share links - no authentication required
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  // Only apply strict CSP in production, use permissive policy in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    // Content-Security-Policy: Prevent XSS attacks (Production only)
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.clerk.accounts.dev https://*.convex.cloud https://*.clerk.com https://clerk.noteflow.co.in",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://*.convex.cloud https://img.clerk.com https://*.clerk.com https://clerk.noteflow.co.in",
      "connect-src 'self' https://*.clerk.accounts.dev https://*.convex.cloud https://*.clerk.com https://clerk.noteflow.co.in wss://*.convex.cloud wss://*.clerk.com",
      "frame-src 'self' https://*.clerk.com https://clerk.noteflow.co.in", // Allow Clerk iframes
      "frame-ancestors 'none'", // Prevent clickjacking
      "base-uri 'self'", // Prevent base tag injection
      "form-action 'self'", // Only allow forms to submit to same origin
    ].join('; ');

    response.headers.set('Content-Security-Policy', cspHeader);
  }

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
  response.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
  response.headers.set('X-XSS-Protection', '1; mode=block'); // Legacy XSS protection
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin'); // Control referrer info
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()'); // Restrict browser features

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
