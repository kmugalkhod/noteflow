"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { PublicNoteData } from "@/modules/types/share";
import { deserializeBlocks, type Block } from "@/modules/notes/types/blocks";
import { Check, Square } from "lucide-react";

interface PublicNoteViewProps {
  note: PublicNoteData;
  shareId: string;
}

// Block renderer component for clean public display
function BlockRenderer({ block }: { block: Block }) {
  const getContent = () => {
    if (typeof block.content === "string") {
      return block.content;
    }
    // Format text segments if content is an array
    return block.content.map((segment, i) => {
      let className = "";
      if (segment.bold) className += " font-semibold";
      if (segment.italic) className += " italic";
      if (segment.underline) className += " underline";
      if (segment.strikethrough) className += " line-through";
      if (segment.code)
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono"
          >
            {segment.text}
          </code>
        );
      return (
        <span key={i} className={className}>
          {segment.text}
        </span>
      );
    });
  };

  switch (block.type) {
    case "heading1":
      return (
        <h2 className="text-3xl font-bold mt-8 mb-4 text-foreground tracking-tight">
          {getContent()}
        </h2>
      );
    case "heading2":
      return (
        <h3 className="text-2xl font-semibold mt-6 mb-3 text-foreground">
          {getContent()}
        </h3>
      );
    case "heading3":
      return (
        <h4 className="text-xl font-semibold mt-5 mb-2 text-foreground">
          {getContent()}
        </h4>
      );
    case "bulletList":
      return (
        <li className="ml-6 mb-2 list-disc text-foreground leading-relaxed">
          {getContent()}
        </li>
      );
    case "numberedList":
      return (
        <li className="ml-6 mb-2 list-decimal text-foreground leading-relaxed">
          {getContent()}
        </li>
      );
    case "todo":
      const checked = block.properties?.checked || false;
      return (
        <div className="flex items-start gap-2 mb-2">
          {checked ? (
            <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          ) : (
            <Square className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          )}
          <span
            className={`leading-relaxed ${
              checked ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {getContent()}
          </span>
        </div>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-4 italic text-muted-foreground bg-muted/30 rounded-r">
          {getContent()}
        </blockquote>
      );
    case "code":
      return (
        <pre className="bg-muted p-4 rounded-lg my-4 overflow-x-auto">
          <code className="text-sm font-mono text-foreground">
            {typeof block.content === "string" ? block.content : ""}
          </code>
        </pre>
      );
    case "divider":
      return <hr className="my-8 border-t border-border" />;
    case "callout":
      return (
        <div className="flex gap-3 p-4 my-4 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-2xl flex-shrink-0">
            {block.properties?.icon || "💡"}
          </span>
          <div className="flex-1 text-foreground leading-relaxed">
            {getContent()}
          </div>
        </div>
      );
    case "image":
      return (
        <figure className="my-6 relative w-full h-96">
          <Image
            src={block.properties?.url || ""}
            alt={block.properties?.alt || ""}
            fill
            className="object-contain rounded-lg shadow-sm"
          />
          {block.properties?.caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {block.properties.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return (
        <p className="mb-3 text-foreground leading-relaxed">{getContent()}</p>
      );
  }
}

export function PublicNoteView({ note, shareId }: PublicNoteViewProps) {
  const { title, content, coverImage, contentType, blocks } = note;
  const incrementView = useMutation(api.publicShare.incrementShareView);

  // Increment view count when component mounts
  useEffect(() => {
    incrementView({ shareId }).catch((error) => {
      // Silently fail - view counting is not critical
      console.error("Failed to increment view count:", error);
    });
  }, [shareId, incrementView]);

  // Parse blocks for rich content
  const parsedBlocks =
    contentType === "rich" && blocks ? deserializeBlocks(blocks) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cover Image */}
        {coverImage && (
          <div className="mb-10 -mx-4 sm:mx-0 relative w-full h-72 sm:h-96">
            <Image
              src={coverImage}
              alt=""
              fill
              className="object-cover sm:rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Title */}
        <header className="mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
            {title || "Untitled"}
          </h1>
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {parsedBlocks ? (
            // Render rich content from blocks
            <div className="space-y-1">
              {parsedBlocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>
          ) : (
            // Fallback to plain text
            <div className="whitespace-pre-wrap leading-relaxed text-foreground text-lg">
              {content}
            </div>
          )}
        </div>

        {/* Footer Branding */}
        <footer className="mt-20 pt-10 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Created with{" "}
              <a
                href="/"
                className="text-primary hover:underline font-medium transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                NoteFlow
              </a>
            </p>
          </div>
        </footer>
      </article>
    </div>
  );
}
