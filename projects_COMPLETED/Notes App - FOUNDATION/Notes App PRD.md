# Notes App PRD

2026-09-20 · @Someone

## Goal

Build a notes app that opens like a blank page. She opens it, writes anything, and it saves. No forms, no required fields, no setup. It should feel calm, quick and private.

This is the base for the manifestation app. Daily entries, focus cards and reminders are added on top of it in later releases.

## User

Women who follow manifestation and star signs and want to build a successful life. They love a clean, minimal look and use their phone for almost everything.

What she does in the app:

- Writes intentions, scripts, to-do lists and thoughts
- Opens it in the morning and in the evening, often for a few minutes
- Comes back to older notes to see what she wrote and what changed

## Principles

Every screen follows these rules.

1. **Start writing fast.** From opening the app to typing takes two taps or less.
2. **Saves by itself.** She never taps a save button.
3. **Total freedom.** No required title, no fixed fields, no forced template.
4. **One hand use.** Main buttons sit where a thumb reaches.
5. **Calm screens.** Few buttons, lots of space, one thing in focus.
6. **Never lose text.** If the connection drops, her words stay on the phone and save when it returns.

## Must-have features

| Feature | What it means |
| --- | --- |
| New note | One tap from the notes list. Opens ready to type. |
| Open text writing | A blank page with basic formatting: headings, bold, bullet lists, numbered lists and tick box lists. |
| Automatic title | The first line becomes the title. No separate title box. |
| Autosave | Saves while she types. A small "Saved" note shows it worked. |
| Notes list | Newest first. Each note shows title, a short preview and the date. |
| Search | Finds any word across all notes. |
| Pin | Pinned notes stay at the top of the list. |
| Delete with undo | Deleted notes go to Recently deleted for 30 days, then are removed. |
| Works on bad connection | Text is kept on the phone and saved when the connection returns. |
| Same notes everywhere | After login, her notes appear on any device. |

## Writing experience

The editor is the most important screen. It must feel effortless.

- Full screen and blank. The cursor is already active when a new note opens.
- Placeholder text in the manifestation language she uses: "Write your intention, a script, or anything on your mind."
- A small formatting bar sits above the keyboard: heading, bold, bullet list, numbered list, tick box list.
- Typing shortcuts work too. Typing "- " starts a bullet list, "\[\] " starts a tick box list, "# " starts a heading.
- Pressing enter in a list continues the list. Pressing enter on an empty item ends it.
- Undo and redo are always available.
- The keyboard never covers the line she is typing on.
- Pasted text keeps clean formatting, matching the rest of the note.
- A back arrow returns to the list. The note is already saved, so nothing is asked.

## Screens

| Screen | What it does |
| --- | --- |
| Login | Email and Google sign in. Built in the previous step. |
| Notes list | Home screen. Pinned notes first, then newest. Round new note button at the bottom right. |
| Note editor | Full screen writing page described above. |
| Search | One search box. Results update as she types. |
| Recently deleted | Lists deleted notes for 30 days. Restore or delete forever. |
| Settings | Log out only for now. |

The bottom bar has two tabs: Notes and Search.

## Look and feel

Clean girl aesthetic: quiet, soft and minimal.

| Element | Rule |
| --- | --- |
| Background | Off-white, #FAF7F2 |
| Cards and surfaces | Warm beige, #EFE6DA |
| Text | Soft dark brown, #3A3531. Secondary text #8A8178. |
| Accent | One muted rose taupe, #C4A69B. Used only for the new note button and active states. |
| Headings and note titles | Elegant serif font |
| Body text | Simple clean sans font |
| Shapes | Soft rounded corners on cards and buttons |
| Borders | None or very thin. Light shadows only. |
| Spacing | Generous. Nothing crowded. |
| Icons | Thin line icons |
| Motion | Small, slow fades. No bouncing. |
| Empty screens | One calm line, for example "Start with a thought." |

Each note card in the list keeps a space at the top for a minimal artistic image. Images are added later with the focus cards.

Dark mode is not in this release.

## Data and privacy

Every note belongs to one user and only that user can see it. This is enforced in the database, not only on screen.

Each note stores:

- Owner
- Title, taken from the first line
- Content
- Date created and date last edited
- Pinned or not
- Date deleted, if it is in Recently deleted

No sharing in this release. Notes are private.

## Built to grow

The notes app must be built so later features slot in without rebuilding it.

- **Note types.** Every note has a type. Today all notes are plain. Later, a type called daily entry is added.
- **Sections.** The editor must allow fixed sections inside a note later: focus card, to-do list, limiting beliefs, end of day journal.
- **Dates.** Every note has a date it belongs to, ready for one entry per day.
- **Flexible storage.** Note content is stored so new elements, such as cards and images, can be added without changing old notes.
- **Profile.** A separate place for user details is prepared for name, birth details and placements.
- **Space at the top.** The note layout leaves room for a focus card.

## Not in this release

- Astrology, placements and transits
- Focus cards and daily prompts
- Onboarding and profile details
- Push notifications
- Folders, tags and sharing
- Images and voice notes inside notes
- Dark mode
- Export

## Done test

The notes app is ready when all of these are true on a real phone:

- [ ] I can sign up, write a note, close the app, reopen it and find the note
- [ ] From opening the app to typing takes two taps or less
- [ ] Turning off the connection while typing loses nothing after it comes back
- [ ] A second account cannot see the first account's notes
- [ ] Search finds a word from an old note in under a second
- [ ] The app installs to the home screen and opens full screen
- [ ] Three women from the target audience call it clean and say they would write in it daily
