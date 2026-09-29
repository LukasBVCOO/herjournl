# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

A mobile-first installable web app (PWA) that lives on her phone's home screen. Designed and tested at phone width first; desktop is an afterthought.

## Users

Women aged 18–34 (US market, prices in dollars), both students or early-career women and women building a career or business; neither group takes priority. She identifies with the "clean girl" aesthetic, believes in manifestation, and already speaks its language (intention setting, alignment, scripting, energy, abundance). She already journals, already checks her horoscope, and wants to be successful. She does not need to be convinced astrology is real; she needs it turned into something she can act on today.

Her situation: a few minutes on her phone in the morning to set an intention, and a few minutes in the evening to reflect. Private, personal, often in bed or before the day starts.

## Product Purpose

Becomely turns her birth chart and today's sky into a daily action. Each morning it tells her which area of life (one of the 12 astrological houses) is lit up today, she sets an intention around it, and in the evening she reviews how it went. That morning-to-evening loop is the product.

Success for the first three months after launch: **she comes back daily.** The morning intention and evening reflection become a habit. Payment and sharing follow from that habit; they are not the lead metric.

## Positioning

What she uses today instead: journaling apps (Day One, Stoic, Notion templates), affirmation and manifestation apps (I Am, ThinkUp), and paper journals plus manifestation content on TikTok.

What those can't truthfully copy: Becomely's daily prompt is calculated from *her* chart and *today's* sky (where the Moon sits in her houses, and its closest angle to her natal planets), so the focus changes day to day and is specific to her. Journaling apps give a blank page; affirmation apps give generic lines; horoscope apps give predictions without action. Becomely gives her a personal focus and a place to act on it.

## Operating Context

- **Morning:** a push notification ("Your focus for today is ready ✦"), she opens today's focus card, reads it, and writes what she'll focus on. Her answer becomes a note.
- **Evening:** a push notification ("Time to reflect ✦"), she reviews the day and writes her reflection.
- **Anytime:** notes, vision boards (words and photos), daily 369 affirmations, her birth chart on Profile.
- **Onboarding** (in order): welcome, name, date of birth, birth time (with an "I don't know" path), birth place, her chart revealed (Sun, Moon, Rising), then straight into her first focus card. Installing to the home screen and allowing notifications are offered after, once she has used it.
- A card "day" runs 08:00 to 08:00 in her own time zone.

## Capabilities and Constraints

- **Features today:** accounts (email and Google), onboarding with a real natal chart calculated on her phone, the daily focus card built on the 12 houses, evening reflection, notes with a list, search and "Recently deleted", vision boards, 369 affirmations, morning and evening push notifications, Profile with chart and birth details, and Becomely+ subscriptions.
- **Becomely+ (paid):** $7.99/month or $71.99/year, through Stripe. A 7-day free trial starts when she finishes onboarding, with no card needed. After the trial, notes, vision boards (one board, up to 10 photos) and her birth chart stay free; the focus card, reflection, affirmations and notifications need Becomely+. Subscribing during the trial charges immediately. Accounts created before 27 Sep 2026 are founding members with Becomely+ forever.
- **Birth time may be missing.** Every chart feature must work without it and degrade honestly (Sun-sign houses), never invent a time.
- **Offline:** past notes must stay readable and writable offline; a new focus card needs a connection.
- **Privacy:** her notes, limiting beliefs and reflections are private writing. Never shown beyond her, never logged, never sent to third parties. Stripe only receives her email and user id.
- **Cost awareness:** chart and card calculations are free (done on the device); the app avoids paid per-user API calls.
- **Minimum age** in onboarding is 16, though the target audience is 18–34.
- **Undecided:** how focus card images evolve (currently one illustration per house); whether Stripe Tax is switched on (prices are set tax-exclusive; no tax collected yet).

## Brand Commitments

- **Name:** Becomely. The paid tier is **Becomely+**. Domain becomely.co. (Formerly HerJournl; some internal names still say herjournl and must not be renamed.)
- **Voice:** warm, direct and aspirational. It treats her as someone building something, not someone waiting for the stars to decide. It uses the manifestation vocabulary she already uses (intention setting, alignment, scripting, energy, abundance). Not generic horoscope copy, no fortune-telling or promises, no astrology jargon without meaning.
- **Aesthetic direction (binding, from the founder's brief):** clean girl aesthetic; soft neutrals, generous white space, restrained type, nothing cluttered or mystical-kitsch. No purple galaxy gradients, no cartoon zodiac icons. Each focus card has its own artistic, minimalistic image; the imagery is the emotional hook that makes a card worth opening and screenshotting.
- The ✦ sparkle is used as a recurring sign-off in copy.

## Evidence on Hand

- Illustrations supplied by the founder in `public/`: daily focus card images per house (`public/daily-cards/`), onboarding images, birth chart images, house icons, vision board images, affirmation images, Becomely+ artwork (`public/becomely+/`), Apple and app icons.
- No testimonials, reviews, press, user counts or case studies exist yet. Do not invent any.
- Place data comes from GeoNames (CC BY 4.0); a credit line is required in the app and has not been added yet.

## Product Principles

1. **The daily loop comes first.** Every screen should make it easier to open today's card in the morning and reflect in the evening; anything that competes with that loop waits.
2. **Specific to her, today.** A card that could be anyone's is a failure. Always lead with what is personal: her chart, her houses, today's sky.
3. **Turn belief into action.** Every prompt ends in something she writes or does, never just something she reads.
4. **Her writing is sacred.** Private by default, never lost (offline-safe), never exposed.
5. **Honest, never mystical theatre.** No invented birth times, no promises, no fake urgency; say plainly when something can't be personalised.
