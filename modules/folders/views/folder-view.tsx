"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { NoteList } from "@/modules/notes/components/note-list";
import { Loader2, Folder, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";

export function FolderView({ folderId }: { folderId: string }) {
  const convexUser = useConvexUser();
  const router = useRouter();
  
  const folder = useQuery(
    api.folders.getFolder,
    { folderId: folderId as Id<"folders"> }
  );

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (folder === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (folder === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Folder className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Folder not found</h2>
        <p className="text-muted-foreground mb-4">
          This folder doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => router.push("/workspace")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-8 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            onClick={() => router.push("/workspace")} 
            variant="ghost" 
            size="sm"
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Folder 
            className="w-6 h-6" 
            style={{ color: folder.color || undefined }}
          />
          <h1 className="text-2xl font-bold">{folder.name}</h1>
        </div>
      </div>

      {/* Notes in this folder */}
      <div className="flex-1 overflow-auto">
        <NoteList
          folderId={folderId as Id<"folders">}
        />
        {/* Debug info */}
        <div className="p-4 text-xs text-muted-foreground">
          Debug: Folder ID = {folderId}
        </div>
      </div>
    </div>
  );
}
