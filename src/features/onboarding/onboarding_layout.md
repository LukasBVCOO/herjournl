# Onboarding

The short set of screens a new user goes through once, right after she creates
her account. It asks for her name, birth date, birth time and birthplace, works
out her birth chart, shows her Sun, Moon and Rising, and lands her on her first
daily focus. Her answers and her chart are saved to her profile at the end.

The product thinking behind it lives in three documents at the top of the
project: `onboarding_PRD.md` (what it should feel like), `onboarding_technical_blueprint.md`
(how it should work) and `onboarding-build-checklist.md` (what is built).

Where the places list and the astrology come from, how the historical time zone
is worked out, and their licences and limits, is in **`DATA-SOURCES.md`** next to
this file.

---

## The journey

Every screen has its own web address, so the phone's back button steps back
through them one at a time.

| # | Screen | Address | File | What happens |
|---|---|---|---|---|
| 1 | Welcome | `/onboarding` | `questions/welcome-screen.tsx` | What the app is for. "Get started". |
| 2 | Name | `/onboarding/name` | `questions/name-screen.tsx` | Required. Extra spaces tidied, accents and any language allowed. |
| 3 | Birthday | `/onboarding/birthday` | `questions/birthday-screen.tsx` | Day / month / year. Must be a real date, not in the future, and she must be 16 or older. |
| 4 | Birth time | `/onboarding/birth-time` | `questions/birth-time-screen.tsx` | Uses the phone's own time picker (12 or 24 hour, however her phone is set). |
| 5 | Birthplace | `/onboarding/birthplace` | `questions/birthplace-screen.tsx` | Search as she types. She must pick a place from the list. |
| 6 | Mapping your chart | `/onboarding/mapping` | `reveal/mapping-screen.tsx` | Makes the chart while a quiet animation plays (at least 2.6 seconds). Moves on by itself. If it fails: "We couldn't create your chart just yet" and **Try again**, with her answers kept. |
| 7 | Reveal | `/onboarding/reveal` | `reveal/reveal-screen.tsx` | Her Sun, Moon and Rising. **See today's focus** saves everything (which is what completes onboarding), then opens her first real daily focus card. |
| 8 | First daily focus card | `/focus` | `src/features/daily-focus/` | Not part of this folder. The daily focus feature makes her first card from the chart just saved. She reveals it, writes under it and taps **Done**, which turns her answer into her first note. Daily cards are only made once onboarding is complete. |

The first four questions show a thin progress bar (there is no "Step 3 of 7" on
purpose). If she lands on a screen without the earlier answers (for example,
after refreshing the page), `data/steps.ts` sends her back to the first
question that is missing.

---

## The folders

Files are grouped by what they do. Each file has one job.

### `onboarding-flow.tsx` (top level)
Lists every screen and its web address (the table above). To add a screen, add
it here.

### `questions/`: the screens she answers
`welcome-screen`, `name-screen`, `birthday-screen`, `birth-time-screen`,
`birthplace-screen`.

### `reveal/`: making the chart and showing it
- `mapping-screen.tsx`: the "Mapping your chart ✦" screen.
- `constellation.tsx`: its animation, a thin circle with points that appear and
  a line that slowly draws between them. With reduced motion switched on it just
  shows the finished picture.
- `reveal-screen.tsx`: the three placement cards and the button that saves.
- `placement-card.tsx`: one of those cards.
- `placement-content.ts`: the words that go with each placement, **36 in
  total**: 12 for the Sun, 12 for the Moon, 12 for the Rising. It is a fixed
  library, not generated, so it costs nothing per user and reads the same for
  everyone. Edit the wording here.

### Where onboarding ends
There is no `focus/` folder any more. The old stand-in card with example words
was removed. Onboarding now ends on the real first daily focus card, which lives
in `src/features/daily-focus/` and opens at `/focus`.

### `chart/`: working out her chart
- `natal-chart.ts`: the real calculation, done by the `circular-natal-horoscope-js`
  library (public domain, no outside service or key). It is only loaded when a
  chart is made, so it doesn't slow the rest of the app. It works out her Sun,
  Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rising and all 12 house cusps
  (Placidus). It also works out the time zone of her birthplace and the clock
  offset that applied on her birthday, including summer time and old rule
  changes, and records what it used. **Every value the library returns is
  checked**, and anything unexpected counts as a failure rather than being saved.
- `chart.ts`: the bridge that turns her answers into a request for that
  calculation. Also holds a testing switch (see below).

### `places/`: the birthplace search
`places.ts`. Asks the `search_places` function in the database, which searches
the `worldmap` table (about 45,000 cities and towns, each with coordinates and a
time zone). It ignores accents and capitals, understands "paris, texas", and
returns the 6 best matches, biggest places first.

### `validation/`: small checks
- `birth-date.ts`: is this a real date, not in the future, and is she 16 or older?
- `birth-time.ts`: reads the time picker's value as an hour and a minute.

### `data/`: what she has answered, and saving it
- `answers-store.ts`: her answers so far, held in memory so they are still there
  when she goes back a screen. If she changes a birth detail, the chart is thrown
  away so it is made again from the new details. Cleared on log out.
- `use-answers.ts`: how a screen reads them.
- `steps.ts`: which questions are answered (the "send her back" check above).
- `save-profile.ts`: writes everything to her profile in the database.

### `fields/`: the inputs the questions are built from
- `birth-date-fields.tsx`: the day / month / year boxes (numbers only; a full
  day or month moves on to the next box).
- `birth-time-field.tsx`: the phone's time picker.
- `place-search.tsx`: the birthplace search box and its suggestions.

The **Profile screen** (`src/features/profile/`) uses these same three pieces, and
the chart calculation, the checks and the descriptions too, so changing her birth
details there works exactly the way answering them here did. It reaches them only
through `index.ts`, which exports them for that reason. Nothing was moved out of
this folder for it.

### `layout/`: shared frame
- `step-frame.tsx`: the back arrow and progress bar around each question.
- `progress-bar.tsx`: the thin bar.

### `testing/`: for testing only
`onboarding-shortcut.tsx` is the small sparkle icon in the notes list header. It
clears any earlier answers and opens the welcome screen, so onboarding can be
tried again and again. **Delete this folder, its export in `index.ts`, and its
one line in the notes list header before launch.**

### `index.ts`
The only thing the rest of the app is allowed to use. It exports the whole flow
and the testing shortcut. Nothing outside this folder reaches into it any other
way.

---

## How the pieces connect

```
what she types
   → data/answers-store.ts         (kept in memory)
   → chart/chart.ts                (when she taps "Create my chart")
   → chart/natal-chart.ts          (the library works out the chart)
   → data/answers-store.ts         (the chart is held with her answers)
   → reveal/reveal-screen.tsx      (shows Sun, Moon, Rising + descriptions)
   → data/save-profile.ts          (when she taps "See today's focus")
   → Supabase `profiles` table
```

Nothing is written to the database until she taps **See today's focus**. If that
save fails she sees "We couldn't save your details" and can try again; her
answers are still there.

---

## What is saved, and where

**In `profiles`** (one row per person, only she can read or change it):

| Column | Holds |
|---|---|
| `name`, `date_of_birth` | her name and birth date |
| `birth_time`, `birth_time_known` | hour and minute (unknown-time path not built yet) |
| `birth_place`, `birth_city`, `birth_country` | the place, as she saw it and split out |
| `birth_latitude`, `birth_longitude` | the coordinates from the places table |
| `birth_timezone_name`, `birth_utc_offset_minutes` | the zone and offset **the chart used** |
| `placements` | the whole chart as JSON: 7 planets (sign, degree, house), Rising, the 12 house cusps |
| `onboarding_completed_at` | when she finished (empty means she hasn't) |

**In `worldmap`**: the places list. It is read-only reference data: signed-in
users may read it and nothing else. **If this table is ever replaced or
re-imported, it comes back open to writes.** Run the first block of
`supabase/migrations/20260921140000_worldmap_relock_and_timezone_search.sql`
again straight afterwards.

The database changes are recorded in `supabase/migrations/`
(`20260921120000_profile_birth_details.sql`,
`20260921140000_worldmap_relock_and_timezone_search.sql`,
`20260921150000_profiles_placements_describe_chart.sql`). The `…130000…` file is
kept only as history.

---

## Testing helpers

- **The sparkle icon** in the notes list header (see `testing/`).
- **`?fail`**: add it to the address of the mapping screen
  (`/onboarding/mapping?fail`) to see the "couldn't create your chart" screen.
  It lives in `chart/chart.ts` and is marked testing-only.
- **A known profile to check against:** Lukas, 18/07/2000, 16:00, Marijampolė.
  The chart should show **Cancer Sun, Aquarius Moon, Scorpio Rising**, in
  time zone `Europe/Vilnius` at UTC+2. Changing the time to 17:00 should change
  the Rising to Sagittarius.

---

## Not built yet

- The **"I don't know my birth time"** option. Everything is built assuming she
  knows it; without it there is no exact Rising sign or houses.
- **Making onboarding required.** A logged-in user who hasn't finished it still
  lands on her notes, and Google sign-ups skip it. The profile records
  completion, so this can be added.
- ~~Editing birth details later~~ is **built**: the Profile screen (person icon in
  the notes header) lets her change her name, birth date, time and birthplace.
  Changing a birth detail asks first, shows a loading screen, recalculates the
  chart and replaces the old one.
- **Icons** for the Sun, Moon and Rising cards.
- **Analytics** for the onboarding funnel.
- **The real Daily Focus card** (built from her chart and the day's sky).
- **Moving the chart calculation to a server.** It runs on her phone for now.
  Later the same code can move into a Supabase Edge Function, after which the
  phone should no longer be allowed to write `placements` itself.

---

## Adding to it

- Put a new file in the folder for its **job**, and keep one job per file.
- A new screen goes in `questions/` (or `reveal/` if it is part of the chart
  moment); then add its address to `onboarding-flow.tsx`.
- Anything outside this folder should only ever import from `index.ts`.
- Copy is warm, direct and aspirational. Onboarding mentions only the **Sun,
  Moon and Rising**: never houses, aspects, degrees, transits or retrogrades.
