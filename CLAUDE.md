# CLAUDE.md

Guidance for Claude Code working in this repository.

---

## Working rules (read these first)

1. **The founder is not technical.** Explain everything in plain language. No jargon without a one-line explanation. When you name a tool, library, or service, say what it does and why it's here.
2. **Work in small steps.** Finish one step, tell the founder exactly how to test it (what to open, what to click, what they should see), then stop and wait. Do not chain several steps together.
3. **Ask before big decisions.** Anything that costs money, locks in a vendor, changes the data model, changes the visual direction, or affects user privacy — ask first and give a short recommendation with the trade-off.


### What "a small step" looks like
Good: "the onboarding name screen now saves the name and moves to the next screen."
Too big: "onboarding is done."

### How to report back
End each step with:
- **What I built** — one or two sentences, plain language.
- **How to test it** — numbered, literal instructions.
- **What's next** — the single next step, and any question that needs answering before it.

---

## The product

**HerJournl** — a mobile web app that helps women who believe in manifestation turn their beliefs into daily action, using their astrological placements and current transits to tell them what to focus on today.

The core loop: the app tells her what area of life is lit up today, she sets an intention around it in the morning, and reviews it at night. That loop is the product.

### Who it's for (ICP)

"Clean girl aesthetic" women who are into manifestation and star signs, and who want to be successful. She already journals, already checks her horoscope, already talks about alignment and energy. She doesn't need to be convinced astrology is real — she needs it turned into something she can actually do today.

### Positioning and voice

Use the manifestation vocabulary this audience already uses:

- intention setting
- alignment
- scripting
- energy
- abundance

Onboarding copy, daily prompts, notifications, and empty states all speak this language. **Not generic horoscope copy.** No "Mercury retrograde means watch out for travel delays." The tone is warm, direct, and aspirational — it treats her as someone building something, not someone waiting for the stars to decide.

### Aesthetic

Clean girl aesthetic: soft neutrals, generous white space, restrained type, nothing cluttered or mystical-kitsch. No purple galaxy gradients, no cartoon zodiac icons.

Each focus card gets its own **artistic, minimalistic image**. The imagery is the emotional hook that makes a card feel worth opening and worth screenshotting.

---

## First release scope

Mobile first, built as a **PWA** (a website that installs to the phone home screen and looks like a real app — no App Store needed). Everything below is in scope for v1; anything not listed is not.

### 1. Onboarding

Collect, in this exact order:

1. Name
2. Date of birth
3. Birth time — **with an "I don't know" option** (must work without it; degrade gracefully to less precise placements)
4. Birth place
5. Add app to home screen guide
6. Allow notifications
7. First morning intention

From name + DOB (+ time and place when given), the app calculates and shows her placements.

Notes:
- The home-screen guide comes before the notification ask, because notifications only work reliably once the app is installed.
- Ending onboarding on a real first intention means she leaves having already used the product once.

### 2. Journalling / planning

A basic note-taking experience — create entries, edit them, see them in a list.

**Every entry has 4 sections, prompted by that day's focus card:**

1. **Focus card** — the card for the day
2. **To-do list** — what she'll do about it, checkable
3. **Limiting beliefs** — what got in the way / what she noticed
4. **EOD journal entry** — free writing at the end of the day

### 3. Daily focus cards

Built on **the 12 houses**. Each morning, based on her placements plus the current transits, the app picks a focus, generates a card, starts a new note from it, and prompts her to write what she'll focus on today.

**This is the retention mechanic.** If the cards are generic, the app dies. They must feel specific to her chart and to today.

### 4. Notifications

- **Morning push** — the new focus card, prompting intention setting.
- **Evening push** — review the day, tick off what got done, write the EOD journal entry.

### The flow

```
Sign-up → Onboarding → Morning intention setting → Evening recap
                            ↑                            ↓
                            └──────── every day ─────────┘
```

---

## Technical shape

Three external pieces feed the daily card:

1. **Placement API** — a service that turns name/DOB/time/place into natal chart placements.
2. **Transit API** — a service that gives current planetary transits.
3. **Claude API** — generates the daily focus card copy from placements + transits + the 12-house framing.

Everything else (auth, notes, to-dos, notifications, PWA shell) is ours.

### Constraints that apply to every step

- **Mobile first, always.** Design and test at phone width first. Desktop is an afterthought.
- **PWA requirements are not optional:** installable manifest, service worker, offline-tolerant reading of past entries, working web push.
- **Journal content is sensitive.** Limiting beliefs and EOD entries are private writing. Never expose them beyond the user, never log their contents, and be careful about what gets sent to third-party APIs.
- **Birth time may be missing.** Every chart calculation must handle that path.
- **Cost awareness.** Placement, transit, and Claude calls cost money per user per day. Cache aggressively — a user's natal chart never changes, and transits are the same for everyone on a given day.

---

## Open decisions — ask the founder before choosing

Do not silently pick these. Bring a recommendation and the trade-off.

- Framework and hosting
- Database and auth provider
- Which placement API and which transit API (they have real price and accuracy differences)
- How focus card images are produced (generated, licensed, or commissioned) and whether they're fixed per house or fresh daily
- Whether v1 charges money
- Notification send times — fixed, or picked by the user during onboarding

---

## Definition of done for a step

- It works on a phone-sized screen.
- The founder has been told how to test it, in literal steps.
- It's committed and pushed to GitHub.
- Nothing half-finished is left behind without saying so out loud.
