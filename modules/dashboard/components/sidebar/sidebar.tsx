"use client";

import { useRef } from "react";
import { Home, FileText, Users, PenTool, Paintbrush, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FolderTree, type FolderTreeRef } from "../folder-tree";
import { WritingStats } from "../writing-stats";
import { UserMenu } from "../user-menu";
import { CreateFolderButton } from "@/modules/folders/components";
import { SearchBar } from "@/modules/search/components";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { ThemeToggle } from "@/modules/shared/components";

const navigation = [
  { name: "Workspace", href: "/workspace", icon: Home },
  { name: "All stories", href: "/stories", icon: FileText },
  { name: "Drawing", href: "/drawing", icon: Paintbrush },
  { name: "Shared", href: "/shared", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onOpenCommandPalette: () => void;
}

export function Sidebar({ onOpenCommandPalette }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const convexUser = useConvexUser();
  const createNote = useMutation(api.notes.createNote);
  const folderTreeRef = useRef<FolderTreeRef>(null);

  const handleNewStory = async () => {
    if (!convexUser) return;

    try {
      const noteId = await createNote({
        
        title: "Untitled",
        content: "",
      });

      router.push(`/note/${noteId}`);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleNewFolder = () => {
    folderTreeRef.current?.startCreatingFolder();
  };

  const handleNewDrawing = () => {
    router.push('/drawing');
  };

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header - Consistent 16px padding */}
      <div className="p-4 border-b border-sidebar-border space-y-3">
        <h1 className="text-xl font-bold text-sidebar-foreground">noteflow</h1>

        <SearchBar
          onOpenCommandPalette={onOpenCommandPalette}
          placeholder="Search notes..."
        />

        <div className="flex gap-2">
          <Button
            onClick={handleNewStory}
            className="flex-1 bg-black hover:bg-gray-800 text-white rounded-lg h-9"
          >
            New story
          </Button>
          <Button
            onClick={handleNewDrawing}
            variant="outline"
            className="flex-1 rounded-lg h-9"
          >
            <Paintbrush className="w-4 h-4 mr-1" />
            Drawing
          </Button>
        </div>
      </div>

      {/* Navigation - 12px horizontal padding, 16px vertical */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm
                transition-all duration-200
                ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}

        {/* Favorites Section - 24px top spacing */}
        <div className="pt-6">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Favorites
          </h3>
          <p className="px-3 text-xs text-muted-foreground">
            No favorite folders or stories
          </p>
        </div>

        {/* Folders Section - 24px top spacing */}
        <div className="pt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Folders
            </h3>
          </div>
          <FolderTree ref={folderTreeRef} />
          <div className="mt-2">
            <CreateFolderButton onClick={handleNewFolder} />
          </div>
        </div>
      </nav>

      {/* Footer - Consistent 16px padding, 12px gap */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <WritingStats />
        <div className="flex items-center justify-between gap-2">
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
