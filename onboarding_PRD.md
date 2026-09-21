# PRD: Onboarding Flow

## 1. Overview

The onboarding flow collects the minimum information required to create a personalised natal chart and introduces the user to the product without overwhelming them with astrology terminology.

The user should feel that the app is learning who they are and preparing a personalised daily experience.

The onboarding should feel:

* calm
* premium
* feminine
* minimal
* personal
* simple
* non-technical

The user should not need prior astrology knowledge.

---

## 2. Goal

The onboarding must:

1. Collect the user's name.
2. Collect their date of birth.
3. Collect their exact birth time.
4. Collect their place of birth.
5. Convert birthplace into the location data required for astrology calculations.
6. Generate the user's natal chart.
7. Store the relevant natal information.
8. Reveal the user's Sun, Moon and Rising signs.
9. Transition the user into their first daily focus card.

The onboarding should create the feeling:

> “This app understands me personally.”

---

## 3. Required User Data

Store the following:

### User profile

* name
* date of birth
* birth hour
* birth minute
* birthplace display name
* birthplace country
* birth latitude
* birth longitude
* birth timezone

### Natal chart data

At minimum store:

* Sun sign
* Moon sign
* Rising sign / Ascendant
* 12 house cusps
* natal planet positions
* natal planet houses

Recommended planets:

* Sun
* Moon
* Mercury
* Venus
* Mars
* Jupiter
* Saturn

Additional planets can also be stored if returned by the astrology API.

Natal chart data is calculated once and reused later.

---

# 4. Onboarding Flow

## Screen 1: Welcome

### Purpose

Introduce the product benefit.

### Content

**Headline**

Your day, aligned to you.

**Supporting text**

Get a daily focus based on your birth chart, with prompts that turn intention into action.

**Primary CTA**

Get started

### Behaviour

Selecting the CTA takes the user to the name screen.

---

# 5. Screen 2: Name

### Headline

What should we call you?

### Supporting text

We'll use your name to personalise your experience.

### Input

Name

### CTA

Continue

### Validation

* required
* minimum 1 character
* trim unnecessary spaces
* allow accented characters and non-English names

### Store

`name`

---

# 6. Screen 3: Date of Birth

### Headline

When were you born?

### Supporting text

Your birth date helps us understand your personal placements.

### Input

Date selector

Preferred display:

DD / MM / YYYY

### CTA

Continue

### Validation

* required
* cannot be a future date
* user must satisfy the app's minimum age requirement

### Store

* day
* month
* year

---

# 7. Screen 4: Birth Time

### Headline

What time were you born?

### Supporting text

Your birth time helps us understand which areas of life your chart connects to.

### Input

Time selector

HH : MM

Use the user's preferred 12-hour or 24-hour display format.

Internally store hour and minute consistently.

### CTA

Continue

### Secondary option

Not sure of your birth time?

### V1 Recommendation

Allow the user to continue without knowing the exact time, but clearly explain:

> Without an exact birth time, your Rising sign and some personalised guidance may be less accurate.

If the user does not know their time, save:

`birth_time_known = false`

The product may provide reduced personalisation for these users.

### Store

* hour
* minute
* birth_time_known

---

# 8. Screen 5: Birthplace

### Headline

Where were you born?

### Supporting text

Your birthplace helps us create your personal birth chart.

### Input

Search field

Placeholder:

Country

Placeholder: 

City

### Search Behaviour

As the user types, show location suggestions.

Each result should show:

**City / town**
Region if relevant
Country

Example:

**Marijampolė**
Lithuania

### When User Selects Location

Retrieve and store:

* latitude
* longitude
* formatted location name
* country
* timezone information

### CTA

Create my chart

CTA remains disabled until a valid location has been selected.

---

# 9. Location Handling

A geocoding service should convert the selected birthplace into:

* latitude
* longitude

Example:

Marijampolė, Lithuania

becomes approximately:

* latitude
* longitude
* timezone

The user should never need to see these technical values.

### Caching

Locations should be cached internally.

If another user selects a birthplace already stored in the location database, reuse the existing location data rather than making another geocoding request.

---

# 10. Natal Chart Creation

After the user presses:

**Create my chart**

send the user's:

* birth date
* birth time
* birth latitude
* birth longitude
* historical timezone
* selected house system

to the astrology calculation service.

### House System

Use:

**Placidus**

for V1.

### Natal Calculation Must Return

At minimum:

* Sun sign
* Moon sign
* Ascendant / Rising
* planetary positions
* planetary houses
* 12 house cusps

Save the result to the user's profile.

The natal chart should not need to be recalculated unless the user changes their birth information.

---

# 11. Screen 6: Calculation State

### Purpose

Create anticipation while the natal chart is being created.

### Headline

Mapping your chart ✦

### Supporting text

Finding your Sun, Moon, Rising and the areas of life that are uniquely yours.

### Visual Direction

Use a subtle animation or artistic visual.

Possible concepts:

* slowly forming constellation
* orbiting points
* abstract celestial line art
* softly appearing stars
* minimal circular birth-chart animation

Avoid:

* complicated astrology diagrams
* spinning zodiac wheels
* dense technical information
* overly mystical visual clichés

### Behaviour

When chart generation completes, automatically transition to the chart reveal.

If calculation fails:

Show:

> We couldn't create your chart just yet.

CTA:

Try again

Do not lose the user's entered information.

---

# 12. Screen 7: Chart Reveal

### Purpose

Create the first personalisation moment.

### Headline

Your chart starts here

Show three large placement cards.

---

## Sun

Example:

☀

**Cancer Sun**

Your core energy

Optional short description:

You lead with feeling, intuition and what matters deeply to you.

---

## Moon

Example:

☾

**Aquarius Moon**

Your inner world

Optional short description:

You often understand your feelings by stepping back and looking at them from a different angle.

---

## Rising

Example:

↑

**Scorpio Rising**

How you move through the world

Optional short description:

You may come across as observant, private and more intense than you initially realise.

---

### Supporting text

These placements help shape how your daily focus is personalised to you.

### CTA

See today's focus

---

# 13. Astrology Terminology Rules

The onboarding should introduce only:

* Sun
* Moon
* Rising

Do not introduce:

* house cusps
* transits
* aspects
* conjunctions
* trines
* sextiles
* retrogrades
* degrees
* natal houses

These concepts may exist underneath the product but should not be required knowledge.

The user should not need to understand astrology to receive value from the app.

---

# 14. Personalisation Philosophy

The onboarding should establish:

> This experience is built around you.

It should not communicate:

> You need to learn astrology.

The astrology engine exists underneath the experience.

The user primarily sees understandable themes such as:

* career
* money
* relationships
* confidence
* wellbeing
* creativity
* growth
* inner world
* future

---

# 15. Transition Into Daily Experience

After selecting:

**See today's focus**

the user lands on their first Daily Focus Card.

Example:

### Today's focus

**Your direction**

Today brings more attention to where you're going and what you want to build next.

### Prompt

What would make today feel like real progress?

### Input

Start writing...

The onboarding is considered complete once the user reaches this screen.

---

# 16. Progress Indicator

Show a subtle progress indicator throughout onboarding.

Example:

`● ○ ○ ○`

or a thin progress bar.

Do not show:

> Step 3 of 7

unless testing shows users prefer it.

The experience should feel fluid rather than administrative.

---

# 17. Back Navigation

Users must be able to move backward and edit:

* name
* date
* birth time
* birthplace

If birth information changes after the chart has been calculated, the natal chart should be recalculated.

---

# 18. Editing Birth Information Later

Birth information should be editable from Settings.

Settings should contain:

**Birth details**

* Birth date
* Birth time
* Birthplace

Changing any of these values should:

1. display a confirmation
2. recalculate the natal chart
3. replace previous natal chart data
4. update future personalised daily cards

Historical journal entries do not need to be regenerated.

---

# 19. Error States

The following errors must be handled.

### Invalid birth date

Message:

Please enter a valid date.

### Future birth date

Message:

Your birth date can't be in the future.

### Unknown birthplace

Message:

We couldn't find that place. Try searching for the nearest city or town.

### Location service failure

Message:

We couldn't find your birthplace right now. Please try again.

### Astrology API failure

Message:

We couldn't create your chart right now. Your details have been saved, so you can try again.

---

# 20. Analytics

Track:

### Funnel

* onboarding_started
* name_completed
* dob_completed
* birth_time_completed
* birthplace_search_started
* birthplace_selected
* chart_generation_started
* chart_generation_success
* chart_generation_failed
* chart_reveal_viewed
* onboarding_completed

### Important Metrics

Primary:

**Onboarding completion rate**

Secondary:

* drop-off by screen
* % users who know exact birth time
* birthplace search failure rate
* natal chart API failure rate
* chart reveal → first daily card conversion

---

# 21. Design Direction

Overall aesthetic:

**Clean girl + modern editorial + subtle celestial influence**

The product should feel closer to:

* premium journaling
* wellness
* beauty/editorial
* quiet luxury

than:

* traditional horoscope websites
* tarot apps
* occult imagery
* neon purple astrology apps

### Visual Characteristics

Use:

* generous whitespace
* soft typography
* subtle textures
* elegant photography or abstract artwork
* minimal celestial elements
* restrained animations
* rounded but sophisticated components

Avoid:

* large zodiac wheels
* excessive stars
* galaxies everywhere
* bright purple gradients
* mystical cliché imagery

---

# 22. V1 Technical Flow

```text
User opens app
↓
Welcome
↓
Name
↓
Date of birth
↓
Birth time
↓
Birthplace
↓
Geocode birthplace
↓
Retrieve latitude / longitude / timezone
↓
Send birth data to astrology API
↓
Receive natal chart
↓
Store natal chart
↓
Display Sun / Moon / Rising
↓
User selects "See today's focus"
↓
Daily experience begins
```

---

# 23. Out of Scope for Onboarding V1

Do not build into onboarding:

* full birth chart wheel
* detailed house explanations
* aspect explanations
* transit explanations
* compatibility
* relationship astrology
* tarot
* manifestation goal setup
* long personality assessment
* journal-history analysis
* AI chat
* social features
* astrology lessons

The objective is:

**Collect the correct birth information, create a personalisation moment, and get the user to their first daily focus as quickly as possible.**

---

# 24. Success Definition

The onboarding succeeds if a new user can:

1. complete it without understanding astrology
2. understand that the app is personalised to her
3. recognise her Sun, Moon and Rising as her personal profile
4. reach her first daily focus quickly
5. feel curious enough to return the next day

The experience should leave the user thinking:

> **“This feels like it was made for me.”**
