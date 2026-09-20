"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import {
  BoldIcon,
  BulletListIcon,
  HeadingIcon,
  NumberedListIcon,
  TickBoxIcon,
} from "./format-icons";
import { useKeyboardOffset } from "./use-keyboard-offset";

// Slim bar pinned just above the keyboard.
export default function FormatBar({ editor }: { editor: Editor }) {
  const keyboardOffset = useKeyboardOffset();
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      heading: editor.isActive("heading"),
      bold: editor.isActive("bold"),
      bullet: editor.isActive("bulletList"),
      numbered: editor.isActive("orderedList"),
      tick: editor.isActive("taskList"),
    }),
  });

  const buttons = [
    {
      label: "Heading",
      on: active.heading,
      icon: <HeadingIcon />,
      run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Bold",
      on: active.bold,
      icon: <BoldIcon />,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Bullet list",
      on: active.bullet,
      icon: <BulletListIcon />,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      on: active.numbered,
      icon: <NumberedListIcon />,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Tick box list",
      on: active.tick,
      icon: <TickBoxIcon />,
      run: () => editor.chain().focus().toggleTaskList().run(),
    },
  ];

  return (
    <div
      className="fixed inset-x-0 z-20 border-t border-line bg-paper"
      style={{
        bottom: keyboardOffset,
        paddingBottom: keyboardOffset ? 0 : "env(safe-area-inset-bottom)",
      }}
    >
      <div
        role="toolbar"
        aria-label="Formatting"
        className="mx-auto flex h-12 w-full max-w-md items-center justify-between px-3"
      >
        {buttons.map((button) => (
          <button
            key={button.label}
            type="button"
            aria-label={button.label}
            aria-pressed={button.on}
            // Keep the cursor in the note so the keyboard stays open.
            onMouseDown={(event) => event.preventDefault()}
            onClick={button.run}
            className={`flex h-10 w-12 items-center justify-center rounded-full transition-colors duration-200 ${
              button.on ? "bg-card text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {button.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
