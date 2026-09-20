# RELEASES.md

The full build plan in three releases. Build them in order.

1. **Release 1: Notes app.** A fast, private, good looking notes app.
2. **Release 2: Core features.** Onboarding, placements, daily focus cards, daily entries and notifications.
3. **Release 3: Trial and paywall.** 7 day free trial, then a paid subscription.

## How to use this file

- Work one step at a time. Finish it, tell the founder how to test it on a phone, then wait.
- Tick the box when the founder confirms the step works.
- Commit and push to GitHub after every finished step.
- Steps marked **ASK FIRST** need a decision from the founder before any work starts. Bring a short recommendation and the trade-off.
- Follow the reporting format and working rules in CLAUDE.md.

---

## Release 1: Notes app

**Goal.** A blank page she opens, writes on, and it saves. No forms, no required fields. Calm, quick and private. Everything in later releases is added on top of it.

**Design rules for every screen**

- Colors: background off-white #FAF7F2, cards warm beige #EFE6DA, lines #E2D7C8, text #3A3531, secondary text #8A8178, one accent muted rose taupe #C4A69B (new note button and active tab only)
- Fonts: Cormorant Garamond for headings and note titles, DM Sans for body text
- Soft rounded corners (20px on cards), very light shadows, no hard borders, generous spacing (24px screen edges, 16px between cards)
- Thin line icons, 200 millisecond fades, no bouncing
- Empty screens show one calm line, for example "Start with a thought."
- Editor placeholder: "Write your intention, a script, or anything on your mind."
- Mobile first. Test at phone width.

**Steps**

- [ ] **1.1 Foundation.** Next.js app with Tailwind, the colors and fonts above, connected to Supabase, live on Netlify. Environment keys are stored in Netlify, not in the code.
  Test: open the live link on a phone and see a blank page in the new look.
- [ ] **1.2 Login.** Sign up, log in and log out with email and Google. Logged out users only see the login page.
  Test: create an account, log out, log back in.
- [ ] **1.3 Notes database.** A notes table with these fields: owner, title, content, type (plain for now), note date, pinned, created at, updated at, deleted at. Each user can only ever see their own notes, enforced in the database.
  Test: create two accounts and confirm neither sees the other's notes.
- [ ] **1.4 Notes list.** Pinned notes first, then newest first. Soft cards showing title, two line preview and date. Round new note button at the bottom right.
  Test: create three notes and see them listed.
- [ ] **1.5 Editor.** Full screen writing page. First line becomes the title. Formatting bar above the keyboard: heading, bold, bullet list, numbered list, tick box list. Typing shortcuts work: "- " for a bullet, "[] " for a tick box, "# " for a heading. Autosave about one second after she stops typing, with a small "Saved" status. Empty notes are removed automatically.
  Test: write a note with a list and tick boxes, close the app, reopen, everything is there.
- [ ] **1.6 Pin, delete, Recently deleted.** Deleted notes stay in Recently deleted for 30 days with Restore and Delete forever.
  Test: delete a note, find it in Recently deleted, restore it.
- [ ] **1.7 Search.** One search box, results update as she types, ignores capital letters.
  Test: search for a word from an old note.
- [ ] **1.8 Bad connection.** If the connection drops, text stays on the phone and saves when the connection returns.
  Test: turn on airplane mode, write, turn it off, confirm the note saved.
- [ ] **1.9 Installable app and bottom bar.** PWA with name, icon and full screen mode. Bottom bar has two tabs: Notes and Search. Settings screen shows her email and a log out button.
  Test: add to the home screen and open it full screen.
- [ ] **1.10 Polish.** Compare every screen with the design rules above and fix differences.
  Test: founder goes through every screen.

**Prepare for later (build these in from the start)**

- Every note has a type. All notes are plain for now.
- Every note has a note date.
- Note content is stored in a flexible format so sections, cards and images can be added later.
- An empty profile table exists for name, birth details and placements.
- The note layout leaves room at the top for a focus card.

**Release 1 is done when**

- [ ] She can sign up, write, close the app, reopen and find the note
- [ ] Opening the app to typing takes two taps or less
- [ ] A second account cannot see the first account's notes
- [ ] Search finds an old word in under a second
- [ ] It installs to the home screen and opens full screen
- [ ] Three women from the target audience call it clean and say they would write in it daily

---

## Release 2: Core features

**Goal.** Turn the notes app into the manifestation app. The daily loop is: morning focus card and intention, then evening recap.

**Flow:** Sign-up, onboarding, morning intention setting, evening recap, every day.

**Rules for this release**

- Journal content is private. Never log it. Never send it to any outside service.
- Only placements, transits and house information are sent to the Claude API.
- Birth time may be missing. Every chart step must work without it.
- Keep costs low. A natal chart never changes, so calculate it once and store it. Transits are the same for everyone on a given day, so fetch them once a day.
- Voice: warm, direct, aspirational. Use intention setting, alignment, scripting, energy and abundance. No generic horoscope copy.

**Steps**

- [ ] **2.1 Onboarding screens.** In this order: name, date of birth, birth time with an "I don't know" option, birth place with search as she types. Saves to the profile table.
  Test: complete the screens with and without a birth time and see the data saved.
- [ ] **2.2 Home screen guide and notifications ask.** A guide that shows her how to add the app to her home screen, then the request to allow notifications. iPhone push only works after the app is installed.
  Test: follow the guide on an iPhone and allow notifications.
- [ ] **2.3 Placements. ASK FIRST.** Choose the placement service. Compare price and accuracy. Calculate on onboarding, store the result and show her placements. Without a birth time, show sun and planet signs only.
  Test: enter a known birth chart and compare the result with a trusted chart site.
- [ ] **2.4 Daily entry.** One entry per day with four sections in this order: focus card, to-do list, limiting beliefs, end of day journal. The to-do list has tick boxes. Old notes from Release 1 stay as plain notes.
  Test: open today's entry, fill all four sections, reopen and see them saved.
- [ ] **2.5 Today tab.** Add a Today tab to the bottom bar. It opens today's entry. Past entries are listed by date.
  Test: open Today, then find yesterday's entry.
- [ ] **2.6 Transits. ASK FIRST.** Choose the transit service. Fetch today's transits once a day and store them for all users. Runs on Supabase, not on the phone.
  Test: check that today's transits are stored once and match a trusted source.
- [ ] **2.7 Focus card generation. ASK FIRST on the card rules.** Based on her placements, today's transits and the 12 houses, pick the house in focus and have Claude write the card. Each card includes the house in focus, why it is lit up for her today, and a prompt to set an intention. Generated each morning before the notification is sent.
  Test: generate cards for three different charts and check that they feel specific to each.
- [ ] **2.8 Card starts the entry.** The focus card appears in section one of today's entry and prompts her to write what she will focus on.
  Test: open the app in the morning and see a new entry with the card.
- [ ] **2.9 Card images. ASK FIRST.** Decide how images are made (generated, licensed or commissioned) and whether they are fixed per house or new each day. Minimal, artistic, clean girl style. Add to the focus card and to the entry cards in the list.
  Test: check all 12 houses have an image that matches the style.
- [ ] **2.10 Notifications. ASK FIRST on send times.** Morning push with the new card. Evening push to tick off the to-do list and write the end of day journal. Send times are either fixed or chosen by her in onboarding.
  Test: receive both notifications on a real phone and tap through to the right screen.
- [ ] **2.11 Empty and missed days.** Handle a missed day, a first day and no birth time. Missed days are never shown as a failure.
  Test: skip a day and reopen the app.
- [ ] **2.12 Full loop test.** Five women from the target audience use the app for one week.
  Test: track how many complete both the morning and evening step on days 2 to 7.

**Release 2 is done when**

- [ ] A new user can go from sign-up to her first intention in one session
- [ ] Placements show correctly with and without a birth time
- [ ] A new focus card arrives every morning without manual work
- [ ] Both notifications arrive on iPhone and Android
- [ ] Journal text is never sent to an outside service
- [ ] Testers say the cards feel specific to them

---

## Release 3: Trial and paywall

**Goal.** Every new user gets 7 days free, then subscribes to keep using the app.

**Steps**

- [ ] **3.1 Payment provider. ASK FIRST.** Choose how to take payment on the web. Recommendation to bring: Stripe, since the app is a web app and does not go through the App Store. Confirm price and plans (monthly, yearly or both).
  Test: founder approves the choice and the pricing.
- [ ] **3.2 Trial rule. ASK FIRST.** Decide between two options. Option A: no card needed, trial starts automatically. More sign-ups, fewer paying. Option B: card required at the start, charged after 7 days. Fewer sign-ups, more paying.
  Test: founder picks one.
- [ ] **3.3 Trial start.** The 7 day trial starts when she finishes onboarding. Start date and end date are stored on her profile.
  Test: finish onboarding and see the dates saved.
- [ ] **3.4 Trial status.** A small line in Settings and on Today shows the days left, for example "Day 3 of 7".
  Test: check the line on three different trial days.
- [ ] **3.5 Paywall screen.** Clean and calm. Shows what she keeps by subscribing, in manifestation language, plus the price and a subscribe button. Shown when the trial ends and reachable from Settings.
  Test: force an expired trial and see the paywall.
- [ ] **3.6 Payment flow.** Subscribe, pay, and get access straight away. Payment status comes from the payment provider, not from the screen.
  Test: pay with a test card and confirm access opens right away.
- [ ] **3.7 Access rules. ASK FIRST.** Decide what an expired user can do. Recommendation to bring: she can read and export her old notes, but cannot create new entries or receive focus cards. Access is enforced in the database, not only on screen.
  Test: use an expired account and try to create an entry.
- [ ] **3.8 Trial ending reminder.** A push notification on day 6 saying the trial ends tomorrow.
  Test: receive the reminder on day 6 of a test account.
- [ ] **3.9 Manage subscription.** Settings has a link to change plan, update card or cancel.
  Test: cancel a test subscription and confirm access ends at the end of the paid period.
- [ ] **3.10 Failed payments.** A renewal that fails shows a clear message and a way to update the card.
  Test: use a test card that fails.
- [ ] **3.11 Full test.** Run the whole path with a test account: sign-up, onboarding, trial, paywall, payment, cancel.
  Test: founder completes the path on a phone.

**Release 3 is done when**

- [ ] A new user gets exactly 7 days free
- [ ] The paywall appears when the trial ends
- [ ] Paying opens access straight away
- [ ] Cancelling, failed payments and expired access all behave as decided
- [ ] Nobody can get around the paywall

---

## Decisions log

Add the founder's answers here as they are made.

| Decision | Answer |
| --- | --- |
| Placement service | |
| Transit service | |
| Focus card rules and how the house is picked | |
| Card image method, fixed or daily | |
| Notification send times | |
| Payment provider | |
| Price and plans | |
| Trial with or without a card | |
| What expired users can do | |
