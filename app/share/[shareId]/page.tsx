import { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { PublicNoteView } from "@/components/share/PublicNoteView";
import { ShieldOff, AlertCircle } from "lucide-react";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface SharePageParams {
  shareId: string;
}

interface SharePageProps {
  params: Promise<SharePageParams>;
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { shareId } = await params;

  try {
    const note = await convex.query(api.publicShare.getSharedNote, {
      shareId,
    });

    if (!note) {
      return {
        title: "Note Not Found",
        description: "This shared note is no longer available.",
      };
    }

    const description = note.content.substring(0, 160);

    return {
      title: note.title || "Shared Note",
      description,
      openGraph: {
        title: note.title || "Shared Note",
        description,
        images: note.coverImage ? [note.coverImage] : [],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: note.title || "Shared Note",
        description,
        images: note.coverImage ? [note.coverImage] : [],
      },
    };
  } catch (error) {
    return {
      title: "Note Not Found",
      description: "This shared note is no longer available.",
    };
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params;

  try {
    const note = await convex.query(api.publicShare.getSharedNote, {
      shareId,
    });

    if (!note) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="text-center max-w-md px-6">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
              <ShieldOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-3 text-foreground">
              Note Not Available
            </h1>
            <p className="text-muted-foreground text-lg mb-2">
              This note is no longer shared or may have been deleted.
            </p>
            <p className="text-sm text-muted-foreground">
              If you're the owner, you can create a new share link from your
              notes.
            </p>
          </div>
        </div>
      );
    }

    return <PublicNoteView note={note} shareId={shareId} />;
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="text-center max-w-md px-6">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-foreground">
            Error Loading Note
          </h1>
          <p className="text-muted-foreground text-lg">
            Unable to load the shared note. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
