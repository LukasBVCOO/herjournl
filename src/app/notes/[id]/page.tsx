import { EditNoteScreen } from "@/features/notes";

export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  return <EditNoteScreen id={id} />;
}
