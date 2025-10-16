import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useConvexUser() {
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.users.getCurrentUser,
    clerkUser ? { clerkUserId: clerkUser.id } : "skip"
  );
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  // Sync Clerk user to Convex
  useEffect(() => {
    if (!clerkUser) return;

    const syncUser = async () => {
      await createOrUpdateUser({
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.fullName || undefined,
        imageUrl: clerkUser.imageUrl,
      });
    };

    syncUser();
  }, [clerkUser, createOrUpdateUser]);

  return convexUser;
}
