import { NoteEditorView } from "@/modules/notes/views";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NoteEditorView noteId={id} />;
}
