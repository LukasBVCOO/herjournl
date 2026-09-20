"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { consumeNotesChanged } from "@/lib/notes-client";

// The list can appear from memory when she swipes back from a note. If she
// changed something in the editor, this fetches the list again, once.
export default function ListRefresh() {
  const router = useRouter();

  useEffect(() => {
    if (consumeNotesChanged()) router.refresh();
  }, [router]);

  return null;
}
