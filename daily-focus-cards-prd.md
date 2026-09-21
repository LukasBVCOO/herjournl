# PRD: Daily Focus Cards

## 1. Overview

Daily Focus Cards are the core retention feature of the app.

Each day, the app uses the user's **fixed natal chart** together with the **current position of the Moon** to choose one area of life for the user to focus on.

The user should not need to understand houses, transits, degrees, or astrology terminology.

The experience should simply answer:

> **Where should I put my energy today?**

The card then gives the user one personalised statement and one prompt to write about.

---

## 2. Goal

The Daily Focus system must:

1. Calculate the current position of the Moon.
2. Determine which of the user's natal houses the Moon is currently moving through.
3. Translate that house into a simple life theme.
4. Use the user's natal Moon sign to personalise how that theme is framed.
5. Generate one Daily Focus Card.
6. Give the user one journaling prompt underneath it.
7. Keep the same card for the entire day.
8. Create a new card the following day.

The experience should feel:

> **“This was written for me today.”**

without exposing the complicated astrology underneath.

---

## 3. Core V1 Formula

The first version should use:

```text
Current Moon position
        +
User's natal house cusps
        ↓
Which natal house is active?
        +
User's natal Moon sign
        ↓
Daily Focus Card
```

Example:

```text
Current Moon = 194°

194° falls inside user's natal 10th house

10th house = Career & Direction

Natal Moon = Aquarius

↓
```

User sees:

> **Your direction**
>
> Today is a good day to look at where you're going, not just what needs doing right now. You tend to understand what you want by stepping back and seeing the bigger picture.
>
> **What is one move your future self would make today?**

The user does **not** see:

> Moon transiting your 10th house + Aquarius natal Moon.

---

## 4. Why the Moon Drives V1

Use the Moon as the primary daily signal because it:

- moves quickly enough to create changing focus areas,
- is strongly associated with emotions, attention and instinct in astrology,
- keeps the algorithm simple,
- allows the product concept to be tested before adding more complicated transits.

Do not initially score every planet.

V1:

```text
Moon → determines today's focus
```

Later:

```text
Moon
+
Mercury
Venus
Mars
Jupiter
Saturn
+
aspects
```

can add additional layers.

---

## 5. Fixed Natal Data Required

The onboarding flow should already have saved:

- Sun sign
- Moon sign
- Rising sign
- natal planet positions
- 12 natal house cusps

For Daily Focus V1, the essential fields are:

```text
natal_moon_sign
house_1_cusp
house_2_cusp
...
house_12_cusp
```

House cusps should preferably be stored as absolute zodiac longitude:

```text
0°–360°
```

Example:

```text
House 1 = 233.9°
House 2 = 267.1°
House 3 = 305.2°
...
```

This makes transit comparison much easier.

---

## 6. Current Transit Calculation

Use `circular-natal-horoscope-js` to calculate the current Moon position.

The result required is essentially:

```text
Moon ecliptic longitude = 194.2°
```

For V1, current user latitude / longitude is not required.

The user's natal houses were already calculated from their birthplace.

The current calculation only needs to determine where the Moon is in the zodiac at the selected daily reference time.

---

## 7. Defining "Today"

Use the user's **device timezone** to determine their local calendar day.

Store:

```text
current_timezone
```

Example:

```text
Europe/Vilnius
Europe/London
America/New_York
```

This can be obtained from the device/browser and does not require a geolocation API.

### V1 Daily Reference Time

Calculate the Moon position at:

> **08:00 user local time**

The card generated from that position remains the user's card for the entire day.

If the Moon moves into another natal house later that afternoon, do not change the card.

This prevents:

> morning card = Career  
> evening card = Relationships

The daily experience should remain stable.

---

## 8. Determining the Active House

Take:

```text
currentMoonLongitude
```

and compare it against the user's 12 saved natal house cusps.

Example:

```text
House 9 starts: 141°
House 10 starts: 170°
House 11 starts: 201°

Moon: 194°
```

Therefore:

```text
170° ≤ 194° < 201°
```

so:

```text
active_house = 10
```

The calculation must also correctly handle houses crossing:

```text
359° → 0°
```

---

## 9. The 12 Daily Focus Areas

The astrology terminology should be translated into understandable life areas.

| Natal House | Internal Meaning | User-Facing Focus |
|---|---|---|
| 1 | self / identity | **Self & Confidence** |
| 2 | money / value | **Money & Self-Worth** |
| 3 | communication / learning | **Mind & Communication** |
| 4 | home / roots | **Home & Security** |
| 5 | creativity / romance | **Creativity & Joy** |
| 6 | habits / health | **Routine & Wellbeing** |
| 7 | partnerships | **Relationships** |
| 8 | intimacy / transformation | **Transformation** |
| 9 | learning / beliefs / travel | **Growth & Expansion** |
| 10 | career / reputation | **Career & Direction** |
| 11 | community / aspirations | **Future & Community** |
| 12 | subconscious / solitude | **Inner World & Rest** |

The user should see these themes.

They should not need to see:

```text
House 10
House 7
House 2
```

---

## 10. Natal Moon Personalisation

The active house answers:

> **What area should I focus on?**

The user's natal Moon answers:

> **How might this person naturally experience it?**

Create one internal personality modifier for each Moon sign.

```text
Aries Moon
→ instinctive, direct, action-oriented

Taurus Moon
→ seeks stability, comfort and consistency

Gemini Moon
→ processes emotions through ideas and conversation

Cancer Moon
→ sensitive to emotional security and connection

Leo Moon
→ wants expression, warmth and recognition

Virgo Moon
→ processes feelings through analysis and improvement

Libra Moon
→ seeks harmony, balance and connection

Scorpio Moon
→ experiences feelings deeply and privately

Sagittarius Moon
→ seeks perspective, freedom and possibility

Capricorn Moon
→ tends toward control, responsibility and practicality

Aquarius Moon
→ processes feelings through distance and perspective

Pisces Moon
→ intuitive, imaginative and emotionally receptive
```

These are internal writing guides.

They do not need to appear word-for-word.

---

## 11. Daily Card Structure

Each Daily Focus Card contains three core pieces.

### 1. Focus title

Short.

Prefer 2–5 words.

Example:

> **Your direction**

### 2. Personalised statement

Maximum approximately 2–3 short sentences.

Example:

> Today is a good day to look at where you're going, not just what needs doing right now. You tend to understand what you want by stepping back and seeing the bigger picture.

### 3. Writing prompt

One clear question.

Example:

> **What is one move your future self would make today?**

Underneath:

```text
Start writing...
```

---

## 12. Card Example: Money

Internal astrology:

```text
Moon → user's 2nd house
Natal Moon → Cancer
```

User sees:

### Money & Self-Worth

> Security may be taking up more of your attention today. Because feeling safe matters deeply to you, notice where fear of losing stability might be shaping your choices.

**What would feeling financially secure actually look like for you?**

`Start writing...`

---

## 13. Card Example: Relationships

Internal astrology:

```text
Moon → user's 7th house
Natal Moon → Aquarius
```

User sees:

### Relationships

> Today puts more attention on the people closest to you. You often need some distance to understand how you really feel, so give yourself enough space to notice what you actually want from a relationship.

**What do you need more of from the people closest to you?**

`Start writing...`

---

## 14. Card Example: Career

Internal astrology:

```text
Moon → user's 10th house
Natal Moon → Aries
```

User sees:

### Your direction

> Your ambition deserves some attention today. You naturally respond well when you can move rather than overthink.

**What could you act on today instead of thinking about for another week?**

`Start writing...`

---

## 15. Content Generation Strategy

V1 should **not require AI**.

Use a controlled content system.

Create:

### House content

For each of the 12 houses:

- theme
- possible titles
- base interpretation
- 3–5 writing prompts

### Moon content

For each of the 12 Moon signs:

- emotional tendency
- personalisation sentence / modifier

The application combines them.

Conceptually:

```text
houseContent[10]
+
moonModifier["Aquarius"]
+
promptVariant
```

This gives the feeling of:

```text
12 houses × 12 Moon signs
= 144 combinations
```

without manually writing 144 complete cards.

---

## 16. Prompt Variation

Do not show exactly the same writing question every time a house becomes active.

Each house should initially have approximately:

```text
3–5 prompts
```

Example for Career & Direction:

```text
What is one move your future self would make today?

Where are you waiting to feel ready before taking action?

What would meaningful progress look like today?

What deserves more ambition from you right now?

What are you building toward?
```

Select the prompt deterministically using the date.

For example:

```text
user_id + date + active_house
↓
prompt index
```

This ensures:

- the card remains the same if refreshed,
- different users can receive different variants,
- users don't repeatedly receive identical prompts.

---

## 17. Tone Rules

Daily Focus copy should use manifestation language lightly.

Preferred vocabulary:

- intention
- alignment
- energy
- becoming
- abundance
- future self
- make space
- move toward
- let go
- choose
- focus

Avoid making supernatural guarantees.

Avoid:

> Money is coming your way today.

Prefer:

> Money and your sense of value deserve more attention today.

Avoid:

> The universe wants you to quit your job.

Prefer:

> Today is a useful moment to reflect on where your work is taking you.

The app should guide reflection, not make absolute predictions.

---

## 18. Astrology Terminology Rules

Do not show by default:

- natal
- transit
- house numbers
- degrees
- cusp
- sextile
- trine
- conjunction
- opposition

The user sees:

> **Career & Direction**

rather than:

> **Moon transiting the 10th house**

A future optional:

**Why this focus?**

could expose more astrology to interested users.

That is out of scope for V1.

---

## 19. Daily Card Generation Flow

```text
User opens app / daily generation job runs
↓
Determine user's local date
↓
Set reference time to 08:00 local
↓
Calculate current Moon longitude
↓
Load user's natal house cusps
↓
Determine active natal house
↓
Translate house → life focus
↓
Load user's natal Moon sign
↓
Load Moon personality modifier
↓
Select daily prompt variant
↓
Build Daily Focus Card
↓
Save card
↓
Display to user
```

---

## 20. Database Structure

### `daily_focus_cards`

Suggested fields:

```text
id
user_id

local_date
timezone

transit_moon_longitude
active_house
natal_moon_sign

focus_category
focus_title
focus_statement
journal_prompt

created_at
```

Example:

```json
{
  "local_date": "2026-09-21",
  "transit_moon_longitude": 194.2,
  "active_house": 10,
  "natal_moon_sign": "Aquarius",
  "focus_category": "career",
  "focus_title": "Your direction",
  "focus_statement": "...",
  "journal_prompt": "What is one move your future self would make today?"
}
```

---

## 21. One Card Per Day

A user must not receive a different card every time they reload.

Before generating:

```text
Does daily_focus_card exist for user + local_date?
```

If:

```text
YES
→ return existing card
```

If:

```text
NO
→ generate + save card
```

This makes the card feel like:

> **Today's focus**

rather than randomly generated content.

---

## 22. Connection to Journaling

Selecting the Daily Focus Card should start that day's journal entry.

Initial V1 journal section:

### Today's Focus

Card displayed.

### Your intention

Prompt:

> What are you choosing to move toward today?

### Write

The Daily Focus question appears above an open text area.

Later this can connect to:

- to-do list,
- limiting beliefs,
- evening reflection.

The focus card should remain attached to that day's journal entry permanently.

---

## 23. Morning Notification

V1 notification:

> **Your focus for today is ready ✦**

Tapping it opens today's card.

Later notifications may use the focus itself:

> **Today's focus: Your direction ✦**

Push notifications are a separate delivery system but should link directly to:

```text
/daily/{today}
```

or the equivalent app route.

---

## 24. Empty / Failure States

If current Moon calculation fails:

Do not create fake astrology data.

Show:

> **Your focus is still aligning.**
>
> We couldn't prepare today's card yet.

CTA:

**Try again**

If natal house data is missing:

```text
Do not generate Daily Focus
↓
Ask user to review birth details
```

---

## 25. Users Without Exact Birth Time

Without birth time, natal houses cannot be reliably calculated.

Therefore the V1 house-based Daily Focus system should require:

```text
birth_time_known = true
```

For users without birth time:

### Option A — recommended for first release

Tell them:

> Daily Focus works best with your birth time because it allows us to personalise the areas of life your chart connects to.

Provide instructions to add it later.

### Option B — later

Provide a reduced system based on:

```text
current Moon sign
+
natal Sun
+
natal Moon
```

but do not pretend house-based guidance is accurate.

---

## 26. Analytics

Track:

```text
daily_focus_generated
daily_focus_viewed
daily_focus_prompt_started
daily_focus_prompt_completed
daily_focus_notification_opened
```

Useful properties:

```text
active_house
focus_category
natal_moon_sign
local_date
```

Do not send full journal content into analytics.

---

## 27. Core Product Metrics

### Daily Focus open rate

> % of active users who view their card each day.

### Prompt engagement

> % who begin writing after viewing.

### Prompt completion

> % who save a response.

### Day 7 retention

> Do users still come back for their focus after one week?

### Day 30 retention

> Does the Daily Focus mechanic create an actual habit?

---

## 28. Out of Scope for V1

Do not initially add:

- Mercury transits
- Venus transits
- Mars transits
- Jupiter transits
- Saturn transits
- Uranus / Neptune / Pluto
- aspects
- retrograde interpretation
- multiple competing daily themes
- AI analysis of journal history
- personalised predictions
- compatibility
- transit explanations
- full horoscope paragraphs

V1 should answer one thing well:

> **What should I focus on today?**

---

## 29. Future V2

Once the Moon-only system has proven useful, extend:

```text
CURRENT MOON
→ primary life area

MARS
→ action modifier

VENUS
→ relationship/value modifier

MERCURY
→ thought/communication modifier

JUPITER
→ growth modifier

SATURN
→ responsibility modifier
```

Then score the strongest signals instead of automatically letting the Moon choose the card.

Later still:

```text
current planets
+
natal planets
+
aspects
+
houses
```

can produce much deeper personalisation.

But none of this is required to validate the product.

---

## 30. V1 Technical Flow

```text
                    SAVED AT ONBOARDING
                           |
                           v
                 User's natal house cusps
                 User's natal Moon sign
                           |
                           |
TODAY'S DATE              |
     |                     |
     v                     |
CircularNatalHoroscopeJS   |
     |                     |
     v                     |
Current Moon longitude ----+
             |
             v
      Find active house
             |
             v
      House theme lookup
             +
      Natal Moon modifier
             +
      Prompt variation
             |
             v
       DAILY FOCUS CARD
             |
             v
         JOURNAL ENTRY
```

---

## 31. First Technical Milestone

Before building notifications, journaling, or additional planets, prove this flow works:

```text
Load user natal chart
↓
Calculate current Moon
↓
Correctly identify natal house
↓
Map house to focus category
↓
Add natal Moon modifier
↓
Display card
```

Test against several different birth profiles.

Manually verify that the current Moon is being assigned to the correct natal house.

---

## 32. Definition of Done

Daily Focus V1 is complete when:

- [ ] Current Moon longitude can be calculated locally.
- [ ] The system correctly determines which natal house contains it.
- [ ] Every house maps to a user-friendly focus category.
- [ ] Every natal Moon sign has a personalisation modifier.
- [ ] Every house has multiple journaling prompts.
- [ ] One stable card is generated per user per local day.
- [ ] Astrology terminology remains hidden from the main experience.
- [ ] The card links into a journal response.
- [ ] Cards do not regenerate on refresh.
- [ ] Users without reliable house data are handled correctly.
- [ ] Analytics measure viewing and writing behaviour.

The core system should remain:

> **Today's Moon tells us where to look.  
> Your natal Moon helps us understand how you may experience it.  
> The prompt turns that focus into reflection and action.**
