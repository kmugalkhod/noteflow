"use client";

import { useSignUp, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { signUp, isLoaded } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleGoogleSignUp = async () => {
    if (!isLoaded || !signUp) return;

    try {
      setIsOAuthLoading(true);
      setError("");

      // Use Clerk's OAuth with proper redirect URLs
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: window.location.origin + "/sso-callback",
        redirectUrlComplete: window.location.origin + "/workspace",
      });
    } catch (err: any) {
      console.error("Google sign up error:", err);
      setError(err?.errors?.[0]?.message || "Failed to sign up with Google. Please try again.");
      setIsOAuthLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      setError("");

      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.name.split(" ")[0],
        lastName: data.name.split(" ").slice(1).join(" ") || undefined,
      });

      // Check if email verification is required
      if (result.status === "complete") {
        // No email verification required, sign in directly
        await setActive({ session: result.createdSessionId! });
        router.push("/workspace");
      } else if (result.status === "missing_requirements") {
        // Email verification required - prepare it
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

        // Show success message and redirect to verification page
        // For now, we'll just show an error asking user to check Clerk settings
        setError(
          "Email verification is required. Please disable email verification in Clerk Dashboard (User & Authentication → Email, Phone, Username → Email → Verification → Toggle OFF) for development, or implement a verification code page."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError((err as { errors?: Array<{ message: string }> })?.errors?.[0]?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Get started with NoteFlow today</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full mb-4"
          onClick={handleGoogleSignUp}
          disabled={isOAuthLoading || isLoading}
        >
          {isOAuthLoading ? (
            "Connecting to Google..."
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
