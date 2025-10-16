import { NoteEditor } from "../components/note-editor";
import type { Id } from "@/convex/_generated/dataModel";

export function NoteEditorView({ noteId }: { noteId: string }) {
  return <NoteEditor noteId={noteId as Id<"notes">} />;
}
