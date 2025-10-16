"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, Settings, User, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useTheme } from "@/modules/shared/components";

export function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { setTheme } = useTheme();

  if (!user) return null;

  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.emailAddresses[0].emailAddress[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent/50 transition-colors">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.imageUrl} alt={user.firstName || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-sidebar-foreground">
              {user.firstName || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.emailAddresses[0].emailAddress}
            </p>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="w-4 h-4 mr-2" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut(() => router.push("/login"))}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
