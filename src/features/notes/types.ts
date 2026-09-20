// What a note card shows.
export type NoteSummary = {
  id: string;
  title: string;
  preview: string;
  pinned: boolean;
  updatedAt: string;
};

// A note in the list, with all of its writing so the search box at the top can
// filter the list on her phone as she types.
export type ListedNote = NoteSummary & {
  text: string;
};

// What the Recently deleted screen needs to know about a note.
export type DeletedNoteSummary = {
  id: string;
  title: string;
  preview: string;
  daysLeft: number;
};
