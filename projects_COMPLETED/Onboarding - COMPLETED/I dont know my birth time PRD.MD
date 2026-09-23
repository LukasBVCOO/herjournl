# PRD: Unknown Birth Time Flow

## 1. Overview

The app must support users who know their date and place of birth but **do not know their exact birth time**.

Unknown birth time should not block onboarding or prevent the user from receiving Daily Focus Cards.

Instead, the app provides a **reduced-personalisation mode** using only astrology data that can be calculated reliably without an exact birth time.

The experience should communicate:

> **You can still use the app. Adding your birth time later simply unlocks another layer of personalisation.**

The app must never invent or assume an exact birth time without clearly labeling it as an approximation.

---

# 2. Goal

The unknown-birth-time flow must:

1. Allow the user to continue onboarding without entering a birth time.
2. Save that the birth time is unknown.
3. Calculate only reliable natal placements.
4. Exclude Rising sign and natal houses.
5. Determine whether the natal Moon sign is reliable for that birth date.
6. Provide an alternative Daily Focus system.
7. Allow the user to add their birth time later.
8. Automatically upgrade future Daily Focus Cards once a birth time is provided.

---

# 3. Entry Point

On the Birth Time onboarding screen, show:

**What time were you born?**

`HH : MM`

Secondary action:

> **I don't know my birth time**

When selected, show a short explanation:

> **No worries.**
> We can still personalise your daily guidance using your birth date and place. Your Rising sign and house-based insights need an exact birth time, so we'll leave those out for now.

CTA:

**Continue**

---

# 4. Data Model

When the user chooses this option, save:

```text
birth_time_known = false
birth_hour = null
birth_minute = null
personalisation_level = "reduced"
```

Do not silently insert:

```text
12:00
00:00
06:00
```

as though it were their real birth time.

If an internal reference time is ever required for calculations, it must never be treated as confirmed natal data.

---

# 5. What Can Be Used Without Birth Time

Potentially usable natal placements include:

* Sun
* Mercury
* Venus
* Mars
* Jupiter
* Saturn
* Uranus
* Neptune
* Pluto

However, the system should verify that a placement does not meaningfully change during the user's birth date before treating it as exact.

The Moon requires special handling because it moves much faster.

---

# 6. What Must Not Be Used

Without a reliable birth time, do not present:

* Rising / Ascendant
* Midheaven
* natal house cusps
* natal planet houses
* Moon transiting natal houses
* house-based Daily Focus
* interpretations that depend on an exact Ascendant

The app should not show a guessed Rising sign.

---

# 7. Reliable Placement Calculation

For users without a birth time, calculate planetary positions across the full possible birth-day window.

Conceptually:

```text
Birth date + birthplace
↓
start of local birth day
↓
end of local birth day
↓
calculate planetary positions at both points
```

For each natal planet, determine whether its placement is stable enough to use.

Example:

```text
Moon at start of day:
28° Capricorn

Moon at end of day:
11° Aquarius
```

The Moon crossed signs.

Therefore:

```text
natal_moon_sign_reliable = false
```

Do not tell the user:

> Aquarius Moon

or:

> Capricorn Moon

as a confirmed placement.

---

# 8. Reliable Moon Sign

If the Moon stays in the same zodiac sign for the entire possible birth window:

```text
start = 4° Aquarius
end = 17° Aquarius
```

then:

```text
natal_moon_sign = Aquarius
natal_moon_sign_reliable = true
```

The app may display:

> **Aquarius Moon**

If it crosses a sign boundary:

```text
natal_moon_sign_reliable = false
```

The onboarding reveal should omit the Moon or explain that the exact Moon placement depends on birth time.

---

# 9. Onboarding Reveal: Unknown Time

For a full-profile user:

```text
Sun
Moon
Rising
```

For an unknown-time user, dynamically show only reliable placements.

Example:

### Your chart starts here

☀ **Cancer Sun**
Your core energy

☿ **Cancer Mercury**
How you think and communicate

♀ **Leo Venus**
What you value and connect with

Supporting text:

> There's more we can unlock if you find your birth time later.

CTA:

**See today's focus**

Do not leave an empty Rising card.

---

# 10. Personalisation Levels

Internally support two profile states.

## Full

```text
birth_time_known = true
```

Can use:

* Sun
* Moon
* Rising
* natal houses
* natal house cusps
* current Moon through natal houses
* transit-to-natal aspects

---

## Reduced

```text
birth_time_known = false
```

Can use:

* reliable natal planet signs
* reliable natal planet longitudes/ranges
* current planetary positions
* current Moon sign
* reliable transit-to-natal aspects

Cannot use natal houses.

These labels are internal.

Do not show users:

> Basic account

or:

> Reduced astrology.

---

# 11. Daily Focus Logic: Full Profile

Normal system:

### System 1

```text
Current Moon
→ natal house
→ WHAT area of life is in focus
```

Example:

```text
10th house
→ Career & Direction
```

### System 2

```text
Current Moon
→ aspect to natal planet
→ WHAT TO DO / HOW TO APPROACH THE DAY
```

The app can alternate:

```text
Day 1 → System 1
Day 2 → System 2
Day 3 → System 1
Day 4 → System 2
```

---

# 12. Daily Focus Logic: Unknown Birth Time

Because natal houses are unavailable, replace System 1.

## Reduced System 1: Current Moon Theme

Use:

```text
Current Moon sign
+
reliable natal personality placement
```

The current Moon sign provides the day's broad theme or emotional atmosphere.

Example:

```text
Current Moon = Taurus
Natal Sun = Cancer
```

Possible card:

### Create some stability

Today is better suited to slowing things down and strengthening what already supports you.

**What could you simplify today to feel more grounded?**

---

# 13. Reduced System 2: Reliable Natal Aspect

Use:

```text
Current Moon
→ aspect to a reliable natal planet
```

Example:

```text
Current Moon
trine
Natal Mars
```

Becomes:

### Move it forward

Today supports action more than hesitation.

**What could you start before you feel completely ready?**

This system can be very similar to the full-profile System 2 because natal houses are not required.

---

# 14. Reduced Daily Sequence

For unknown-time users:

```text
Day 1
Current Moon sign
→ TODAY'S THEME

Day 2
Current Moon → reliable natal planet aspect
→ WHAT TO DO

Day 3
Current Moon sign
→ TODAY'S THEME

Day 4
Current Moon → reliable natal planet aspect
→ WHAT TO DO
```

This keeps the same alternating product rhythm:

> **Today, notice this.**
> **Tomorrow, do this.**

---

# 15. Aspect Reliability

Without exact birth time, natal planet degrees are not equally precise.

Before using a Moon-to-natal-planet aspect, verify that the aspect remains valid across the possible birth-time range.

Conceptually:

```text
Natal planet position at start of birth day
Natal planet position at end of birth day
↓
compare current Moon to both
```

If both remain within the same permitted aspect/orb:

```text
aspect_reliable = true
```

Use it.

If the aspect only exists for some possible birth times:

```text
aspect_reliable = false
```

Do not use it for the Daily Focus.

This prevents false precision.

---

# 16. Aspect Priority

When multiple reliable aspects exist, use the most exact one.

Primary aspects:

```text
0°   conjunction
60°  sextile
90°  square
120° trine
180° opposition
```

V1 suggested orb:

```text
±5°
```

Rank:

```text
smallest orb
→ strongest usable aspect
```

Later, planet weighting can be added if needed.

---

# 17. No Reliable Aspect Available

Some days may not have a strong reliable Moon-to-natal-planet aspect.

Do not force one.

Fallback options:

1. Use another current-Moon theme.
2. Use current Moon sign + reliable Sun placement.
3. Use a general reflection card derived from the current Moon sign.

Example:

### Slow the pace

Today supports patience more than pressure.

**What could improve if you stopped trying to rush it?**

The card should still feel complete.

---

# 18. Current Moon Content Library

Create content for all 12 current Moon signs.

Example structure:

```text
Aries
→ action, initiation, courage

Taurus
→ stability, grounding, consistency

Gemini
→ curiosity, conversation, ideas

Cancer
→ care, security, connection

Leo
→ expression, confidence, visibility

Virgo
→ organisation, improvement, routine

Libra
→ balance, relationships, harmony

Scorpio
→ depth, honesty, release

Sagittarius
→ possibility, exploration, perspective

Capricorn
→ responsibility, ambition, structure

Aquarius
→ independence, ideas, perspective

Pisces
→ intuition, imagination, rest
```

Each should contain:

* 2–3 titles
* 2–3 statements
* 3–5 prompts

---

# 19. User-Facing Language

Do not tell unknown-time users:

> We can't calculate your real chart.

Prefer:

> **You can still get personalised daily guidance.**

Then explain the additional benefit simply:

> Adding your birth time later lets us include your Rising sign and personalise which areas of life are being activated each day.

The missing birth time should feel like:

> **an optional extra layer**

rather than:

> **a broken account.**

---

# 20. Settings Upgrade Prompt

Inside Settings/Profile:

### Unlock another layer

> Add your birth time to include your Rising sign and more personalised daily focus areas.

CTA:

**Add birth time**

Do not over-show this prompt.

---

# 21. Adding Birth Time Later

When a user adds an exact birth time:

```text
birth_time_known
false → true
```

Then:

1. save the birth time,
2. recalculate the natal chart,
3. calculate Rising sign,
4. calculate 12 natal house cusps,
5. calculate exact natal planet positions,
6. set:

```text
personalisation_level = "full"
```

7. use the full Daily Focus system from the next card onward.

Do not rewrite historical Daily Focus Cards.

---

# 22. Upgrade Moment

After the chart recalculates, show a small reveal:

### Your chart just got more personal ✦

**Scorpio Rising**

How you move through the world.

Supporting text:

> Your future Daily Focus Cards can now include the areas of life your current astrology is activating.

CTA:

**Continue**

This creates a second personalisation moment.

---

# 23. Database Fields

Recommended additions:

```text
birth_time_known boolean

personalisation_level
"full" | "reduced"

natal_moon_sign
natal_moon_sign_reliable boolean

reliable_natal_planets jsonb
```

Example:

```json
{
  "sun": true,
  "moon": false,
  "mercury": true,
  "venus": true,
  "mars": true,
  "jupiter": true,
  "saturn": true
}
```

Optionally store possible longitude ranges:

```json
{
  "moon": {
    "start": 298.4,
    "end": 311.2
  }
}
```

---

# 24. Daily Focus Data

Store which system generated each card:

```text
generation_mode
```

Possible values:

```text
full_house
full_aspect
reduced_moon_sign
reduced_aspect
reduced_fallback
```

This is useful for debugging and analytics.

---

# 25. Analytics

Track:

```text
birth_time_unknown_selected
reduced_profile_created
birth_time_added_later
profile_upgraded_to_full
```

Daily Focus:

```text
daily_focus_generated
generation_mode
daily_focus_viewed
daily_focus_prompt_started
daily_focus_prompt_saved
```

Useful question:

> Do users without birth times retain meaningfully worse than full-profile users?

This will tell you whether the fallback system is strong enough.

---

# 26. Error and Edge Cases

Handle:

* Moon changes signs during birth date.
* Other natal planet crosses a sign boundary.
* Natal aspect cannot be determined reliably.
* Location/timezone resolution fails.
* User later remembers approximate but not exact birth time.
* User enters `"around 4 PM"`.

For V1, only support:

```text
exact known time
OR
unknown time
```

Do not pretend approximate times are exact.

Approximate-time support can be added later.

---

# 27. Out of Scope for V1

Do not initially add:

* birth-time rectification
* asking personality questions to guess Rising sign
* approximate-house calculations
* noon chart presented as exact
* multiple possible Rising signs
* advanced uncertainty probabilities
* progressed charts
* relocation astrology

---

# 28. Technical Flow

```text
USER DOESN'T KNOW BIRTH TIME
             |
             v
birth_time_known = false
             |
             v
Use birth date + birthplace
             |
             v
Calculate planet range across birth day
             |
             v
Determine reliable natal placements
             |
        +----+----+
        |         |
        v         v
 Current Moon   Reliable natal
    sign         planets
        |         |
        |         v
        |   Moon-to-natal aspects
        |         |
        +----+----+
             |
             v
       DAILY FOCUS
```

---

# 29. Daily Flow

```text
ODD / SYSTEM 1 DAY

Current Moon sign
↓
Moon-sign theme
↓
Optional reliable natal modifier
↓
Theme card


EVEN / SYSTEM 2 DAY

Current Moon longitude
↓
Compare with reliable natal planets
↓
Find strongest reliable aspect
↓
Action / approach card
```

---

# 30. Definition of Done

The unknown-birth-time flow is complete when:

* [ ] User can skip exact birth time.
* [ ] No fake birth time is stored.
* [ ] Rising sign is not guessed.
* [ ] Natal houses are not generated as exact.
* [ ] Moon-sign reliability is checked.
* [ ] Reliable natal placements are identified.
* [ ] Unknown-time users receive Daily Focus Cards.
* [ ] System 1 uses current Moon theme instead of natal houses.
* [ ] System 2 only uses reliable natal aspects.
* [ ] A fallback exists when no reliable aspect is available.
* [ ] User can add birth time later.
* [ ] Natal chart upgrades automatically.
* [ ] Future cards switch to the full system.
* [ ] Historical cards remain unchanged.

The core product rule is:

> **Unknown birth time should reduce precision, not remove the experience.**
