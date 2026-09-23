# Daily Focus System — Build Checklist

## 1. Confirm Required Natal Data

- [x] Confirm onboarding saves `natal_moon_sign` — saved inside her chart (`placements.moon.sign`), not as its own column
- [x] Confirm onboarding saves all 12 natal house cusps — all 12 saved as a sign and degree inside `placements.houseCusps`
- [x] Confirm house cusps are stored as absolute zodiac longitude `0–360` — saved as sign + degree; turned into 0–360 when read (`longitudeOf`), checked to be equivalent
- [x] Confirm `birth_time_known` is saved
- [x] Confirm users without reliable house data are identifiable — `birth_time_known` false means no reliable houses
- [x] Confirm natal chart data is not recalculated every day — the saved chart is reused; only the Moon is worked out each day

---

## 2. Create Astrology Utility Structure

- [ ] Create `astrology/` module or folder — our structure instead: `src/features/onboarding/chart/` and `src/features/transits/`
- [x] Create `daily-focus/` module or folder — `src/features/daily-focus/`
- [x] Separate astrology calculations from content generation
- [x] Create shared astrology types — `Chart` in onboarding, `Transits` in transits
- [x] Create shared Daily Focus types — `daily-focus/types.ts`

Suggested structure:

```text
src/
  astrology/
    calculateMoon.ts
    findNatalHouse.ts
    zodiac.ts

  daily-focus/
    generateDailyFocus.ts
    deterministicSeed.ts

    content/
      houses.ts
      moonModifiers.ts

  types/
    astrology.ts
    dailyFocus.ts
```

---

## 3. Build Zodiac Longitude Helpers

- [ ] Create helper to normalise degrees into `0–360`
- [x] Create helper to convert sign + degree into absolute longitude if needed — `longitudeOf` in transits
- [ ] Test Aries conversion
- [ ] Test Cancer conversion
- [ ] Test Libra conversion
- [ ] Test Capricorn conversion
- [ ] Test values near `0°`
- [ ] Test values near `360°`

Example:

```text
14° Libra
→ 180 + 14
→ 194°
```

---

## 4. Build Local Day Handling

> Changed 2026-09-22 (founder): the card day runs from 08:00 to 08:00 in her time zone, not midnight to midnight. At 03:00 on the 22nd she is still on the 21st's card; the 22nd's card begins at 08:00. Built as `cardDayIn` in `daily-focus/local-day.ts` and checked against moment-timezone for 24 zones over all of 2026. The card is made when she opens the app after 08:00, so nothing is reset each morning: "no card for today's card day yet" is what makes a new one due. A server job that makes cards without her opening the app comes with the morning notification (section 28).

- [x] Detect user's current IANA timezone
- [x] Use device/browser timezone where available
- [ ] Store or send current timezone to backend — not yet; needed when cards are saved (step 14)
- [x] Determine user's current local date
- [x] Create daily reference time at `08:00` local
- [x] Convert local `08:00` reference time into UTC
- [x] Test Europe/Vilnius
- [x] Test Europe/London
- [x] Test America/New_York
- [x] Test daylight-saving transitions

---

## 5. Build Current Moon Calculation

- [x] Create `getMoonLongitude(referenceInstant)` — built as `readMoon` in `daily-focus/active-house.ts`
- [x] Use `circular-natal-horoscope-js`
- [x] Calculate Moon position for the reference instant
- [x] Extract Moon ecliptic longitude
- [x] Normalise Moon longitude to `0–360`
- [x] Return only the numeric longitude needed by Daily Focus
- [x] Handle library calculation errors
- [ ] Add development logging for longitude

Expected output:

```json
{
  "longitude": 194.2
}
```

---

## 6. Validate Moon Position Accuracy

- [x] Compare Moon longitude against a trusted chart / ephemeris source — founder checked 5 values online on 2026-09-21: all match
- [x] Test at least 5 different dates
- [x] Test at least 3 different timezones — Vilnius, London, New York, Tokyo
- [x] Confirm timezone conversion is not shifting the Moon incorrectly — checked against moment-timezone's own time zone rules: 43,800 comparisons over 2026 in 30 zones, none differ
- [x] Confirm local `08:00` maps to the correct UTC instant — same check, and every result read back as 08:00 on its own day
- [x] Record acceptable tolerance — 0.1 degree

Do not continue until Moon calculation is reliable.

---

## 7. Build `findNatalHouse()`

- [x] Create helper that accepts Moon longitude
- [x] Accept all 12 natal house cusps
- [x] Return active house number `1–12`
- [x] Handle normal house ranges
- [x] Handle zodiac wraparound through `360° → 0°`
- [x] Return a clear error if house data is invalid

Concept:

```ts
findNatalHouse(
  moonLongitude,
  houseCusps
)
```

Expected output:

```text
10
```

---

## 8. Test House Assignment Thoroughly

- [x] Test Moon inside House 1
- [x] Test Moon inside House 2
- [x] Test Moon inside House 3
- [x] Test Moon inside House 4
- [x] Test Moon inside House 5
- [x] Test Moon inside House 6
- [x] Test Moon inside House 7
- [x] Test Moon inside House 8
- [x] Test Moon inside House 9
- [x] Test Moon inside House 10
- [x] Test Moon inside House 11
- [x] Test Moon inside House 12
- [x] Test exact cusp boundary behaviour
- [x] Test wraparound house ranges
- [x] Test malformed cusp data

Example:

```text
House 10 starts = 170°
House 11 starts = 201°
Moon = 194°

Expected = House 10
```

Wraparound example:

```text
House 12 starts = 350°
House 1 starts = 23°
Moon = 5°

Expected = House 12
```

---

## 9. Create House Theme Content

Create one config entry for each house.

- [x] House 1 → Self & Confidence
- [x] House 2 → Money & Self-Worth
- [x] House 3 → Mind & Communication
- [x] House 4 → Home & Security
- [x] House 5 → Creativity & Joy
- [x] House 6 → Routine & Wellbeing
- [x] House 7 → Relationships
- [x] House 8 → Transformation
- [x] House 9 → Growth & Expansion
- [x] House 10 → Career & Direction
- [x] House 11 → Future & Community
- [x] House 12 → Inner World & Rest

Each house should contain:

- [x] internal key
- [x] user-facing label
- [x] 2–3 title variants
- [x] 2–3 base statement variants
- [x] 3–5 journal prompts
- [x] default fallback title — only used if a list were ever empty: the area's own name
- [x] default fallback statement — only used if a list were ever empty: "<area> is in focus today."
- [x] default fallback prompt — only used if a list were ever empty: "What deserves your attention today?"

---

## 10. Create Natal Moon Modifiers

Create one content entry for each Moon sign.

- [x] Aries Moon
- [x] Taurus Moon
- [x] Gemini Moon
- [x] Cancer Moon
- [x] Leo Moon
- [x] Virgo Moon
- [x] Libra Moon
- [x] Scorpio Moon
- [x] Sagittarius Moon
- [x] Capricorn Moon
- [x] Aquarius Moon
- [x] Pisces Moon

Each sign should contain:

- [x] internal trait
- [x] 2–3 modifier lines
- [ ] simple language
- [x] no astrology jargon in user-facing copy — checked by a script over every line; founder still to approve the tone
- [ ] no deterministic or supernatural claims

---

## 11. Build Deterministic Variation

- [x] Create seed from `user_id + local_date + active_house`
- [x] Hash the seed consistently
- [x] Use seed to choose title variant
- [x] Use seed to choose base statement variant
- [x] Use seed to choose Moon modifier variant
- [x] Use seed to choose prompt variant
- [x] Confirm refresh returns identical content
- [x] Confirm next day can return different content
- [x] Confirm different users can receive different variants

---

## 12. Build Content Assembler

- [x] Create `assembleDailyFocusCard()` — `daily-focus/assemble-card.ts`
- [x] Accept active house
- [x] Accept natal Moon sign
- [x] Accept deterministic seed — takes the person's id and the day, and builds the seed itself
- [x] Load house title
- [x] Load house base statement
- [x] Load Moon modifier
- [x] Load journal prompt
- [x] Combine into one final card
- [x] Keep statement concise — every statement is exactly 2 sentences, at most 270 characters
- [ ] Ensure grammar works across combinations
- [x] Add safe fallback if content is missing

Final structure:

```text
Focus title

House statement + Moon modifier

Journal prompt
```

---

## 13. Review All Content Combinations

- [ ] Generate all `12 × 12 = 144` house/Moon combinations
- [ ] Review for awkward grammar
- [ ] Review for contradictory language
- [ ] Review for repetitive phrasing
- [ ] Review for overly negative wording
- [ ] Review for vague horoscope-style copy
- [ ] Review for jargon leakage
- [ ] Review manifestation language for restraint
- [ ] Confirm every combination makes sense without astrology knowledge

---

## 14. Create `daily_focus_cards` Table

> Added 2026-09-22 (founder's idea): two more yes/no columns, `opened` and `done`. Opened means she has seen the card (it stays revealed from then on); done means she answered it and it is now a note (it leaves the top of her list, and the next card comes at 08:00). Both only ever move forward, enforced by the database. The app may change only these two columns, and only on her own cards.

Suggested fields:

- [x] `id`
- [x] `user_id`
- [x] `local_date`
- [x] `timezone`
- [x] `reference_instant`
- [x] `moon_longitude`
- [x] `active_house`
- [x] `natal_moon_sign`
- [x] `focus_category`
- [x] `focus_title`
- [x] `focus_statement`
- [x] `journal_prompt`
- [x] `title_variant`
- [x] `statement_variant`
- [x] `moon_modifier_variant`
- [x] `prompt_variant`
- [x] `created_at`

Database rules:

- [x] Add unique constraint on `user_id + local_date`
- [x] Add index for `user_id` — the unique index on `user_id + local_date` already serves this
- [ ] Add index for `local_date` — not created: nothing looks cards up by date alone

---


> **REPLACED 2026-09-22 (founder's own design):** instead of a fixed natal Moon-sign line, the "how to approach it" half of the statement now comes from the Moon's closest angle to one of her 7 natal planets today (real astrology, worked out fresh from the sky, not picked from a hash). This is what stops the same card repeating while the house stays the same for two or three days. Built as `moon-aspect.ts` (closestMoonAspect) and `content/moon-aspects.ts` (35 lines: 7 planets x 5 angles). Proven on the spec profile: every run where the house stayed the same for 2-4 days in a row, the card differed every day. `content/moon-modifiers.ts` (12 Moon signs) is kept, tone-approved, but no longer used by the default card.
## 15. Create Optional Transit Cache

Create `daily_transit_cache` if useful.

Fields:

- [ ] `id`
- [ ] `local_date`
- [ ] `timezone`
- [ ] `reference_instant`
- [ ] `moon_longitude`
- [ ] `created_at`

Rules:

- [ ] Unique `local_date + timezone`
- [ ] Check cache before recalculating Moon
- [ ] Save calculated Moon longitude when cache miss occurs

---

## 16. Build `getOrCreateDailyFocusCard()`

> Added 2026-09-22: cards are only made once onboarding is finished (`profiles.onboarding_completed_at` is set). Onboarding now ends by opening the real first card at `/focus`; the old stand-in card with example words is gone.

- [x] Authenticate user — the signed-in session's id
- [x] Determine user's local date
- [x] Check if today's card already exists
- [x] Return existing card if found
- [x] Validate natal Moon sign — read from the saved chart, which is checked when read
- [x] Validate natal house cusps
- [x] Validate `birth_time_known`
- [x] Determine daily reference instant
- [x] Get cached Moon longitude or calculate it — calculated on her phone (about 5 ms), so nothing to cache
- [x] Determine active natal house
- [x] Generate deterministic content
- [x] Assemble Daily Focus Card
- [x] Save card — one per day, enforced by the database
- [x] Return card — `getTodaysFocus()` in `daily-focus/today.ts`

---

## 17. Build Daily Focus Backend Route

> Not needed: the card is made on her phone (decided 2026-09-21), so there is no backend route. `getTodaysFocus()` does this job and returns only what the screen needs.

Example:

```text
GET /api/daily-focus
```

- [ ] Require authenticated user
- [ ] Call `getOrCreateDailyFocusCard()`
- [ ] Return clean user-facing response
- [ ] Do not expose unnecessary astrology internals
- [ ] Add temporary debug mode for development

Normal response:

```json
{
  "date": "2026-09-21",
  "focus": {
    "category": "career",
    "title": "Your direction",
    "statement": "...",
    "prompt": "What is one move your future self would make today?"
  }
}
```

---

## 18. Add Internal Debug Mode

During development, optionally return:

- [ ] Moon longitude
- [ ] Active house
- [ ] Natal Moon sign
- [ ] Reference instant
- [ ] Timezone
- [ ] Selected content variant IDs

Example:

```json
{
  "moon_longitude": 194.2,
  "active_house": 10,
  "natal_moon": "Aquarius",
  "reference_instant": "2026-09-21T05:00:00Z"
}
```

- [ ] Hide debug data in production UI

---

## 19. Build Daily Focus UI

> Built as: a card on her notes list (below the search bar) and a `/focus` screen. Before she opens it, the list card is a teaser that shows none of the card's words. After she opens it, the card stays at the top, ready to answer, until she writes today's note. Only today's card is ever there. "Ensure layout works on mobile" is left unticked: it has not been checked in a browser at phone width yet.

- [x] Create Today's Focus section
- [x] Display focus title
- [x] Display personalised statement
- [x] Display journal prompt
- [x] Add `Start writing...` input
- [x] Add loading state
- [x] Add error state
- [x] Ensure card remains stable after refresh
- [ ] Ensure layout works on mobile
- [x] Keep astrology terminology hidden

---

## 20. Connect Daily Focus to Journal Entries

> Decided differently (2026-09-21): there is no separate `journal_entries` table. Her answer becomes an ordinary note (marked `daily_entry`) that keeps its own copy of the card in `notes.focus_card`. The question shows in small type above her writing, and a corner tooltip shows the date and the card's words. The field list below is for the table we are not building.

Create / update `journal_entries`.

Suggested fields:

- [ ] `id`
- [ ] `user_id`
- [ ] `daily_focus_card_id`
- [ ] `local_date`
- [ ] `focus_response`
- [ ] `created_at`
- [ ] `updated_at`

Flow:

- [x] User starts typing — a draft is kept on her phone as she types
- [x] Create or load today's journal entry — Done makes today's note; the list card and the focus screen find it again
- [x] Link it to `daily_focus_card_id` — the note keeps a copy of the card instead of a link
- [x] Save response — Done saves it as a note, on her phone at once and to the database in the background
- [x] Restore saved response on reopen — the draft comes back until she taps Done; after that it is the note

---

## 21. Add Autosave

- [ ] Debounce journal input
- [ ] Save after short idle period
- [ ] Save when input loses focus
- [x] Save before navigating away where possible — the draft is saved on every keystroke
- [ ] Show subtle saved state
- [x] Prevent duplicate journal rows — once today's note exists the writing box is replaced by a link to it

---

## 22. Handle Users Without Exact Birth Time

> Built and tested in the logic, but nobody can reach it yet: onboarding has no "I don't know my birth time" option, so every profile saves a real birth time.

- [x] Check `birth_time_known`
- [x] If false, do not pretend natal houses are accurate
- [x] Do not generate normal house-based Daily Focus
- [x] Show reduced-personalisation message
- [x] Add CTA to update birth time
- [x] Do not silently invent noon or another default time

Suggested message:

> Daily Focus works best with your birth time because it helps us personalise the areas of life your chart connects to.

---

## 23. Build Failure States

### Missing natal chart

- [x] Detect missing chart — result `no-chart`
- [x] Prompt user to review birth details — "Review birth details" leads to her profile

### Invalid house cusps

- [x] Detect invalid cusp data — result `no-chart`
- [ ] Log error
- [ ] Do not fabricate active house

### Moon calculation error

- [x] Return temporary failure — result `unavailable` (and `offline` when there is no internet: the card is made when the connection is back)
- [x] Show retry CTA — "Try again"

Suggested copy:

> **Your focus is still aligning.**
>
> We couldn't prepare today's card yet.

### Content missing

- [x] Use house fallback content
- [ ] Avoid blank cards

---

## 24. Handle Birth Data Changes

When user changes:

- [ ] date of birth
- [ ] birth time
- [ ] birthplace

Then:

- [ ] recalculate natal chart
- [ ] update future Daily Focus logic
- [ ] do not rewrite historical cards
- [ ] do not rewrite historical journal entries

---

## 25. Handle Current Timezone Changes

- [ ] Detect device timezone change
- [ ] Use new timezone for future local dates
- [ ] Use new timezone for future 08:00 reference times
- [ ] Do not alter natal chart
- [ ] Do not alter natal house cusps
- [ ] Do not alter natal Moon sign

---

## 26. Prevent Repetitive Copy

Optional V1 polish:

- [ ] Load last 5 Daily Focus cards
- [ ] Avoid same title if alternatives exist
- [ ] Avoid same prompt if alternatives exist
- [ ] Do not analyse journal text
- [ ] Keep selection deterministic after final variant is chosen

---

## 27. Add Analytics Events

- [ ] `daily_focus_generated`
- [ ] `daily_focus_viewed`
- [ ] `daily_focus_prompt_started`
- [ ] `daily_focus_prompt_saved`

Useful event properties:

- [ ] `active_house`
- [ ] `focus_category`
- [ ] `natal_moon_sign`
- [ ] `local_date`

Do not send:

- [ ] journal response text
- [ ] sensitive birth details unless strictly necessary

---

## 28. Add Morning Notification Later

Do this only after Daily Focus itself works.

- [ ] Create notification scheduler
- [ ] Respect user timezone
- [ ] Call the same `getOrCreateDailyFocusCard()`
- [ ] Generate card before sending notification if missing
- [ ] Send `Your focus for today is ready ✦`
- [ ] Deep-link to today's Daily Focus
- [ ] Track notification opens

---

## 29. Test Full Example

Test profile:

```text
Natal Moon = Aquarius
House 10 starts = 170°
House 11 starts = 201°
Current Moon = 194.2°
```

Expected:

```text
Active House = 10
Focus Category = Career & Direction
Moon Modifier = Aquarius
```

Expected card shape:

```text
Your direction

Today puts more attention on where you're going and what
progress means to you. You often understand what you want
by stepping back and seeing the bigger picture.

What is one move your future self would make today?
```

- [ ] Verify active house
- [ ] Verify correct content lookup
- [ ] Verify card saves
- [ ] Refresh page
- [ ] Verify same card returns
- [ ] Verify next local day can generate a new card

---

## 30. Test Multiple Natal Profiles

- [ ] Test different Rising signs
- [ ] Test different natal Moon signs
- [ ] Test all 12 active houses
- [ ] Test houses of unequal size
- [ ] Test wraparound houses
- [ ] Test different timezones
- [ ] Test DST changes
- [ ] Test user travelling between timezones
- [ ] Test missing birth time
- [ ] Test corrupted house data

---

## 31. Performance Checks

- [ ] Existing card returns with minimal database work
- [ ] Moon calculation is cached where useful
- [ ] No astrology API call is required
- [ ] No AI call is required
- [ ] Content configs load efficiently
- [ ] Daily generation does not block UI unnecessarily

---

# First Technical Milestone

Do not build notifications, extra planets, or AI until this works:

- [ ] Load user's natal house cusps
- [ ] Load user's natal Moon sign
- [ ] Calculate today's Moon longitude
- [ ] Correctly identify active natal house
- [ ] Map house to life theme
- [ ] Add natal Moon modifier
- [ ] Generate one stable card
- [ ] Save it
- [ ] Reload page and receive the same card

The milestone is complete when:

```text
Moon
→ correct natal house
→ correct focus
→ personalised statement
→ prompt
```

works reliably.

---

# V1 Definition of Done

- [ ] Moon longitude calculation is validated
- [ ] Natal house assignment is validated
- [ ] All 12 house themes exist
- [ ] All 12 Moon modifiers exist
- [ ] Each house has multiple prompts
- [ ] Deterministic variation works
- [ ] One card exists per user per local day
- [ ] Cards persist after refresh
- [ ] Daily Focus UI is complete
- [ ] Journal response is connected
- [ ] Users without birth time are handled honestly
- [ ] Errors do not fabricate astrology data
- [ ] Analytics are implemented
- [ ] No paid astrology API is required
- [ ] No LLM call is required

---

# Build Order Summary

```text
1. Natal data validation
2. Zodiac helpers
3. Timezone / local-day logic
4. Moon calculation
5. Moon accuracy validation
6. House matching
7. House matching tests
8. House content
9. Moon modifiers
10. Deterministic variation
11. Card assembler
12. Database table
13. getOrCreateDailyFocusCard()
14. Backend route
15. Daily Focus UI
16. Journal connection
17. Failure states
18. Analytics
19. Notifications later
```

The key implementation rule is:

> **Prove the astrology calculation first. Then build the content experience on top of it.**
