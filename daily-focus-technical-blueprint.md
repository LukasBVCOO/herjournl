# Daily Focus System — Technical Blueprint

## 1. Goal

Build a simple, deterministic Daily Focus engine that can answer:

> **Where should this user put their attention today?**

V1 uses:

```text
Today's Moon position
+
User's saved natal house cusps
+
User's natal Moon sign
↓
Daily Focus Card
```

The astrology logic should remain hidden from the user.

The user only sees:

- a focus area,
- a short personalised statement,
- one journaling prompt.

---

# 2. High-Level Architecture

```text
                     ONBOARDING
                         |
                         v
                SAVED NATAL PROFILE
              -----------------------
              natal Moon sign
              12 natal house cusps
              timezone / profile data
              -----------------------
                         |
                         |
                         v
USER OPENS APP / DAILY JOB RUNS
                         |
                         v
               DETERMINE LOCAL DATE
                         |
                         v
              DAILY REFERENCE INSTANT
                  08:00 local time
                         |
                         v
          CircularNatalHoroscopeJS
                         |
                         v
              CURRENT MOON LONGITUDE
                         |
                         v
        COMPARE WITH NATAL HOUSE CUSPS
                         |
                         v
                ACTIVE NATAL HOUSE
                         |
              +----------+----------+
              |                     |
              v                     v
       HOUSE CONTENT          MOON MODIFIER
       Career / Money /       Aquarius /
       Relationships / etc.   Cancer / etc.
              |                     |
              +----------+----------+
                         |
                         v
                CONTENT ASSEMBLER
                         |
                         v
                DAILY FOCUS CARD
                         |
                         v
                 SAVE TO DATABASE
                         |
                         v
                  DISPLAY TO USER
                         |
                         v
                    JOURNAL ENTRY
```

---

# 3. Core Principle

Do not recalculate the user's natal chart every day.

The user's natal chart is fixed.

Daily Focus should reuse the data created during onboarding.

### Fixed data

```text
natal_moon_sign
house_cusps
```

### Changing data

```text
current date
current Moon longitude
```

Everything else is content logic.

---

# 4. Required Data From Onboarding

The Daily Focus engine expects the user's profile to already contain:

```text
user_id
birth_time_known
natal_moon_sign
house_cusps
```

Recommended house-cusp format:

```json
{
  "1": 233.9,
  "2": 267.1,
  "3": 305.2,
  "4": 349.5,
  "5": 23.7,
  "6": 53.2,
  "7": 53.9,
  "8": 87.1,
  "9": 125.2,
  "10": 169.5,
  "11": 203.7,
  "12": 233.2
}
```

All values should be stored as absolute zodiac longitude:

```text
0° → 360°
```

Do not store only:

```text
Scorpio 23°
Aquarius 5°
```

Convert to absolute longitude once.

---

# 5. Zodiac Longitude Format

Use one consistent internal coordinate system.

```text
Aries       0°–29.999°
Taurus      30°–59.999°
Gemini      60°–89.999°
Cancer      90°–119.999°
Leo         120°–149.999°
Virgo       150°–179.999°
Libra       180°–209.999°
Scorpio     210°–239.999°
Sagittarius 240°–269.999°
Capricorn   270°–299.999°
Aquarius    300°–329.999°
Pisces      330°–359.999°
```

Example:

```text
14° Libra
=
180° + 14°
=
194°
```

Store:

```text
194
```

This makes house comparison simple.

---

# 6. Determine the User's Local Day

Daily Focus should be attached to a calendar date in the user's current timezone.

On the client:

```ts
Intl.DateTimeFormat().resolvedOptions().timeZone
```

might return:

```text
Europe/Vilnius
America/New_York
Europe/London
```

Send or store this timezone.

Do not require GPS.

---

# 7. Daily Reference Time

V1 uses:

```text
08:00 local time
```

for that user's local date.

Example:

```text
User timezone: Europe/Vilnius
Date: 2026-09-21
Reference: 2026-09-21 08:00 Europe/Vilnius
```

Convert that to an actual UTC instant before calculating the Moon.

Conceptually:

```text
2026-09-21 08:00 Europe/Vilnius
↓
timezone conversion
↓
2026-09-21 05:00 UTC
```

The Moon position should be calculated for that instant.

---

# 8. Moon Position Service

Create one function:

```ts
getMoonLongitude(referenceInstant)
```

Input:

```text
UTC date/time
```

Output:

```text
0–360° Moon ecliptic longitude
```

Example:

```json
{
  "longitude": 194.2
}
```

Use `circular-natal-horoscope-js`.

For Daily Focus, only use the Moon's:

```text
ChartPosition.Ecliptic.DecimalDegrees
```

or the equivalent numeric ecliptic-longitude field returned by the installed version.

Do **not** use the transit chart's current house number.

The app needs to compare the Moon against the user's **natal house cusps**.

---

# 9. Important Current-Chart Rule

Today's Moon longitude is astronomical position data.

The user's current physical location should **not** determine which natal house the Moon is in.

The house layout comes from:

```text
the user's natal chart
```

not from a new chart created for their present location.

Therefore:

```text
Current Moon longitude
+
Natal house cusps
=
Transit through natal house
```

Do not calculate:

```text
today's Moon in today's local houses
```

That is a different chart.

---

# 10. Transit Caching

Users in the same timezone share the same:

```text
local date
+
08:00 local reference instant
```

Therefore Moon position can be cached by:

```text
timezone + local_date
```

Example cache key:

```text
Europe/Vilnius|2026-09-21
```

Cached result:

```json
{
  "reference_time": "2026-09-21T05:00:00Z",
  "moon_longitude": 194.2
}
```

This means:

```text
10,000 users
```

does not necessarily mean:

```text
10,000 Moon calculations
```

If they occupy 100 timezones, the system may only need roughly:

```text
100 daily Moon calculations
```

or even fewer depending on implementation.

---

# 11. Find Which Natal House Contains the Moon

Create a reusable helper:

```ts
findNatalHouse(
  moonLongitude,
  houseCusps
)
```

Output:

```text
1–12
```

### Normal case

```text
House 10 starts = 170°
House 11 starts = 201°
Moon = 194°

170 ≤ 194 < 201

→ House 10
```

---

# 12. Zodiac Wraparound

The helper must support boundaries crossing:

```text
360° → 0°
```

Example:

```text
House 12 starts = 350°
House 1 starts = 23°
Moon = 5°
```

The Moon is still inside the interval:

```text
350° → 23°
```

because that range wraps through 0°.

Conceptually:

```ts
function degreeIsBetween(
  value,
  start,
  end
) {
  if (start < end) {
    return value >= start && value < end;
  }

  return value >= start || value < end;
}
```

Do not assume:

```text
start < end
```

for every house.

---

# 13. House Theme Configuration

Create a static content file.

Example:

```ts
export const HOUSE_THEMES = {
  1: {
    key: "self",
    label: "Self & Confidence"
  },

  2: {
    key: "money",
    label: "Money & Self-Worth"
  },

  3: {
    key: "mind",
    label: "Mind & Communication"
  },

  4: {
    key: "home",
    label: "Home & Security"
  },

  5: {
    key: "creativity",
    label: "Creativity & Joy"
  },

  6: {
    key: "routine",
    label: "Routine & Wellbeing"
  },

  7: {
    key: "relationships",
    label: "Relationships"
  },

  8: {
    key: "transformation",
    label: "Transformation"
  },

  9: {
    key: "growth",
    label: "Growth & Expansion"
  },

  10: {
    key: "career",
    label: "Career & Direction"
  },

  11: {
    key: "future",
    label: "Future & Community"
  },

  12: {
    key: "inner_world",
    label: "Inner World & Rest"
  }
};
```

This should be product-owned content.

No API is required.

---

# 14. House Content Structure

Each house should have:

```text
key
label
titles[]
base_statements[]
prompts[]
```

Example:

```ts
10: {
  key: "career",
  label: "Career & Direction",

  titles: [
    "Your direction",
    "Where you're going",
    "Your next move"
  ],

  baseStatements: [
    "Today puts more attention on where you're going and what progress means to you.",
    "Your ambitions deserve a little more attention today.",
    "Today is a useful moment to look beyond the urgent and toward what you're building."
  ],

  prompts: [
    "What is one move your future self would make today?",
    "What would meaningful progress look like today?",
    "Where are you waiting to feel ready before taking action?",
    "What are you building toward?",
    "What deserves more ambition from you right now?"
  ]
}
```

---

# 15. Natal Moon Modifier Configuration

Create a second static content file:

```ts
export const MOON_MODIFIERS = {
  Aries: {
    trait: "action-oriented",
    lines: [...]
  },

  Taurus: {
    trait: "stability-seeking",
    lines: [...]
  },

  ...
};
```

Each sign should contain:

```text
trait
modifier_lines[]
```

Example:

```ts
Aquarius: {
  trait: "perspective",
  lines: [
    "You often understand what you want by stepping back and seeing the bigger picture.",
    "Giving yourself some mental space can make your feelings easier to understand.",
    "You tend to find clarity when you can look at things from a little distance."
  ]
}
```

Again:

```text
No AI required.
```

---

# 16. Content Assembly

The card does not need to be one giant manually written template.

Build it from:

```text
House title
+
House base statement
+
Natal Moon modifier
+
House journal prompt
```

Example:

```text
House 10
→ "Your direction"

House base
→ "Today puts more attention on where you're going and what progress means to you."

Aquarius Moon
→ "You often understand what you want by stepping back and seeing the bigger picture."

Prompt
→ "What is one move your future self would make today?"
```

Final card:

> **Your direction**
>
> Today puts more attention on where you're going and what progress means to you. You often understand what you want by stepping back and seeing the bigger picture.
>
> **What is one move your future self would make today?**

---

# 17. Deterministic Variation

A user should not receive random copy every time the page loads.

Use a deterministic seed based on:

```text
user_id
+
local_date
+
active_house
```

Example:

```text
abc123|2026-09-21|10
```

Hash that value.

Use the resulting number to choose:

```text
title index
base statement index
Moon modifier index
prompt index
```

This creates variation while keeping today's card stable.

---

# 18. Avoid Repetition

Store previous cards.

When generating a new card, optionally check the user's recent history.

Avoid repeating the same:

```text
prompt
title
```

within a small recent window where possible.

Example:

```text
last 5 Daily Focus cards
```

This does not mean analysing journal content.

It only prevents repetitive product copy.

---

# 19. Main Generation Function

Conceptual function:

```ts
generateDailyFocus(user, localDate, timezone)
```

Flow:

```text
1. Check if card already exists.
2. If yes → return it.
3. Validate natal Moon + house cusps.
4. Resolve 08:00 local date → UTC.
5. Get cached Moon longitude or calculate it.
6. Determine active natal house.
7. Load house content.
8. Load natal Moon modifier.
9. Generate deterministic content indexes.
10. Assemble card.
11. Save card.
12. Return card.
```

---

# 20. Recommended Function Structure

```text
getUserLocalDate()

getDailyReferenceInstant()

getMoonLongitude()

findNatalHouse()

getHouseTheme()

getMoonModifier()

createDeterministicSeed()

selectContentVariant()

assembleDailyFocusCard()

saveDailyFocusCard()

getOrCreateDailyFocusCard()
```

Keep astrology calculation separate from content generation.

---

# 21. Database Structure

## `daily_focus_cards`

```text
id
user_id

local_date
timezone
reference_instant

moon_longitude
active_house
natal_moon_sign

focus_category
focus_title
focus_statement
journal_prompt

title_variant
statement_variant
moon_modifier_variant
prompt_variant

created_at
```

Add a unique constraint:

```text
user_id + local_date
```

This guarantees only one card exists per user per day.

---

# 22. Transit Cache Table

Optional but useful:

## `daily_transit_cache`

```text
id

local_date
timezone
reference_instant

moon_longitude

created_at
```

Unique:

```text
local_date + timezone
```

Flow:

```text
Need Moon position
↓
Check transit cache
↓
Exists?
    YES → use it
    NO → calculate → save → use
```

---

# 23. Daily Card API / Backend Route

Example:

```text
GET /api/daily-focus
```

Backend:

```text
Authenticate user
↓
Get user's timezone
↓
Determine local date
↓
Find existing card
↓
If missing → generate
↓
Return card
```

Example response:

```json
{
  "date": "2026-09-21",
  "focus": {
    "category": "career",
    "title": "Your direction",
    "statement": "Today puts more attention on where you're going and what progress means to you. You often understand what you want by stepping back and seeing the bigger picture.",
    "prompt": "What is one move your future self would make today?"
  }
}
```

Do not need to send astrology internals to the UI.

---

# 24. Internal Debug Response

During development, allow a debug mode that shows:

```json
{
  "moon_longitude": 194.2,
  "active_house": 10,
  "natal_moon": "Aquarius",
  "reference_instant": "2026-09-21T05:00:00Z"
}
```

This makes validation much easier.

Remove or hide it from normal users.

---

# 25. Frontend Responsibilities

The frontend should:

- request today's card,
- render it,
- provide the writing input,
- show loading state,
- show failure state,
- prevent duplicate journal creation.

The frontend should **not**:

- determine houses,
- interpret astrology,
- choose random prompts,
- trust locally modified natal data.

Keep core logic in one reliable service layer.

---

# 26. Daily Focus UI Data

The UI only needs:

```text
date
focus_category
focus_title
focus_statement
journal_prompt
```

Example:

```text
TODAY'S FOCUS

Your direction

Today puts more attention on where you're going and what
progress means to you. You often understand what you want
by stepping back and seeing the bigger picture.

What is one move your future self would make today?

[ Start writing... ]
```

---

# 27. Journal Connection

When the user begins writing, create or update:

## `journal_entries`

```text
id
user_id
daily_focus_card_id
local_date

focus_response
created_at
updated_at
```

Later extend with:

```text
intention
tasks
limiting_belief
evening_reflection
```

Keep the Daily Focus Card linked by:

```text
daily_focus_card_id
```

so the user can always see what prompted that day's writing.

---

# 28. Morning Notification Flow

Later:

```text
Morning notification scheduler
↓
User timezone
↓
Today's Daily Focus exists?
↓
Generate if necessary
↓
Send:
"Your focus for today is ready ✦"
↓
Deep link to Daily Focus
```

The notification should not need to recalculate astrology independently.

It should use the same:

```text
getOrCreateDailyFocusCard()
```

function as the app.

---

# 29. Failure Handling

## Missing natal house cusps

```text
Do not guess.
```

Return:

```text
daily_focus_unavailable
reason: missing_birth_time_or_chart
```

---

## Moon calculation fails

```text
Do not fabricate longitude.
```

Return temporary error:

> Your focus is still aligning. Try again shortly.

---

## Content configuration missing

Fallback to the house's default:

```text
label
base statement
default prompt
```

Do not crash the entire card.

---

# 30. User Changes Birth Data

If the user edits:

```text
birth date
birth time
birthplace
```

recalculate the natal chart.

Then:

```text
future Daily Focus cards
→ use the new chart
```

Do not rewrite historical cards.

Historical cards should remain attached to the natal data that existed when they were created.

---

# 31. User Changes Current Timezone

Current timezone affects:

```text
local date
08:00 reference instant
notification timing
```

It does **not** change:

```text
natal chart
natal house cusps
natal Moon
```

If the user travels from:

```text
Europe/Vilnius
→ America/New_York
```

future cards use the new local-day boundary.

---

# 32. Content Folder Structure

Recommended:

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

If backend logic is separate:

```text
server/
  astrology/
  daily-focus/
```

The exact folder names can vary.

The important part is separation of concerns.

---

# 33. Data Flow Example

User:

```text
Natal Moon = Aquarius
```

Natal cusps:

```text
House 10 = 170°
House 11 = 201°
```

Today:

```text
Moon = 194.2°
```

Engine:

```text
194.2° falls between 170° and 201°
↓
House 10
↓
Career & Direction
```

Content:

```text
House title
→ Your direction

House statement
→ Today puts more attention on where you're going...

Aquarius modifier
→ You often understand what you want by stepping back...

Prompt
→ What is one move your future self would make today?
```

Output:

```text
Your direction

Today puts more attention on where you're going and what
progress means to you. You often understand what you want
by stepping back and seeing the bigger picture.

What is one move your future self would make today?
```

---

# 34. Testing Strategy

Create test fixtures with known:

```text
house cusps
Moon longitude
expected house
```

Examples:

```text
Moon = 194°
House 10 = 170°
House 11 = 201°

Expected = 10
```

Also test wraparound:

```text
House 12 = 350°
House 1 = 23°
Moon = 5°

Expected = 12
```

Test all 12 houses.

---

# 35. Astrology Validation

Before launch, compare your calculated Moon longitude against at least one trusted ephemeris/chart calculator across multiple dates.

Also verify:

```text
Moon longitude
+
saved natal cusps
=
expected natal transit house
```

for several known birth charts.

The biggest risk is not content generation.

It is:

```text
incorrect longitude
incorrect timezone conversion
incorrect wraparound logic
```

Validate those first.

---

# 36. Performance

The system should be lightweight.

Per Daily Focus request:

```text
1 database lookup for existing card
```

If card exists:

```text
return immediately
```

If missing:

```text
1 natal-profile lookup
1 transit-cache lookup
possibly 1 local Moon calculation
1 insert
```

No paid astrology API is required.

No LLM call is required.

---

# 37. Analytics

Track:

```text
daily_focus_generated
daily_focus_viewed
daily_focus_prompt_started
daily_focus_prompt_saved
```

Properties can include:

```text
active_house
focus_category
natal_moon_sign
local_date
```

Never put the user's journal text into analytics.

---

# 38. V1 Build Order

Build in this order:

```text
1. Read saved natal house cusps
2. Calculate current Moon longitude
3. Build findNatalHouse()
4. Verify all 12-house calculations
5. Create house theme config
6. Create Moon modifier config
7. Create deterministic content selection
8. Assemble one Daily Focus card
9. Save one card per user/date
10. Render card in UI
11. Connect journal response
12. Add analytics
13. Add notifications later
```

Do not start with notifications or AI.

First prove:

```text
Moon → correct natal house → correct focus
```

---

# 39. First Technical Milestone

The milestone is complete when this works:

```text
User natal chart exists
↓
Today's Moon calculated
↓
Moon assigned to correct natal house
↓
House mapped to correct theme
↓
Natal Moon modifier added
↓
Stable card generated
↓
Card persists after refresh
```

---

# 40. V1 System Boundary

## Build now

```text
Current Moon calculation
Natal-house matching
12 house focus themes
12 natal Moon modifiers
Prompt library
Deterministic variation
Daily card storage
Daily card UI
Journal response
```

## Build later

```text
Mercury transits
Venus transits
Mars transits
Jupiter transits
Saturn transits
Transit-to-natal aspects
Retrogrades
Transit scoring
AI-generated copy
Long-term astrology themes
Journal-history personalisation
Advanced predictions
```

---

# 41. Blueprint Summary

The entire Daily Focus system is:

```text
TODAY
↓
Calculate Moon longitude
↓
Compare with user's saved natal house cusps
↓
Find active house
↓
Map house to life area
↓
Add user's natal Moon style
↓
Choose deterministic content variants
↓
Save one card for the day
↓
Ask one strong question
↓
User writes
```

The key principle is:

> **Astrology decides the focus.  
> Natal personality changes how it is framed.  
> The prompt turns it into something the user can actually act on.**
