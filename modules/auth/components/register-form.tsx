"use client";

import { useSignUp, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { signUp, isLoaded } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

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

          {/* Clerk CAPTCHA container */}
          <div id="clerk-captcha"></div>

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
