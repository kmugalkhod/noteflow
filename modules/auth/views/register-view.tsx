"use client";

import { SignUp } from "@clerk/nextjs";

export function RegisterView() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none border-0",
          },
        }}
        routing="hash"
        signInUrl="/login"
        fallbackRedirectUrl="/workspace"
      />
    </div>
  );
}
