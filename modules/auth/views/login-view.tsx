"use client";

import { SignIn } from "@clerk/nextjs";

export function LoginView() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none border-0",
          },
        }}
        routing="hash"
        signUpUrl="/register"
        fallbackRedirectUrl="/workspace"
      />
    </div>
  );
}
