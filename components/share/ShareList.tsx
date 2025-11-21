"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FileText, ExternalLink, Eye, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShareButton } from "./ShareButton";
import Link from "next/link";
import { buildShareUrl } from "@/lib/shareUtils";

/**
 * ShareList component displays all shared notes for the authenticated user
 * Shows active and inactive shares with analytics and quick actions
 */
export function ShareList() {
  const myShares = useQuery(api.sharedNotes.getMySharedNotes);

  // Loading state
  if (myShares === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (myShares.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Shared Notes</h2>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t shared any notes yet. Create a share link from any note
            to see it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Shared Notes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your public share links and view analytics
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {myShares.filter((s: typeof myShares[0]) => s.isActive).length} Active
        </Badge>
      </div>

      <div className="grid gap-4">
        {myShares.map((share: typeof myShares[0]) => {
          // Build share URL client-side from shareId
          const shareUrl = buildShareUrl(share.shareId);

          return (
            <Card
              key={share._id}
              className={`p-4 transition-all hover:shadow-md ${
                !share.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Note Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      href={`/notes/${share.noteId}`}
                      className="font-semibold text-lg hover:underline truncate"
                    >
                      {share.noteTitle}
                    </Link>
                    {!share.isActive && (
                      <Badge variant="destructive" className="text-xs">
                        Revoked
                      </Badge>
                    )}
                    {share.noteIsDeleted && (
                      <Badge variant="outline" className="text-xs">
                        Note Deleted
                      </Badge>
                    )}
                  </div>

                  {/* Share URL */}
                  {share.isActive && (
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-2 py-1 text-xs bg-muted rounded border text-muted-foreground font-mono"
                        onClick={(e) => e.currentTarget.select()}
                      />
                    </div>
                  )}

                  {/* Analytics */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{share.viewCount} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Created {new Date(share.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {share.lastAccessedAt && (
                      <div className="flex items-center gap-1">
                        <span>
                          Last viewed{" "}
                          {new Date(share.lastAccessedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {share.isActive && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        window.open(shareUrl, "_blank", "noopener,noreferrer")
                      }
                      title="Preview shared note"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                  {!share.noteIsDeleted && (
                    <ShareButton
                      noteId={share.noteId}
                      noteTitle={share.noteTitle}
                      variant="ghost"
                      size="icon-sm"
                    />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
