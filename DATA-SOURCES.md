# Where onboarding's data comes from

Onboarding needs two kinds of outside knowledge: **places** (so she can say where
she was born) and **astrology** (so we can work out her chart). This page says
where each comes from, how it is used, what it costs, and what its limits are.

Facts marked "checked" were confirmed directly on 2026-09-21. Anything we still
need to fill in or decide is in the last section.

---

## At a glance

| What | Comes from | Cost | Licence | Sent to anyone outside? |
|---|---|---|---|---|
| Places for the birthplace search | A GeoDataKit export of GeoNames data, loaded into our own database (`worldmap` table) | Free | CC BY 4.0: **credit required** | No |
| The time zone of a birthplace | The library's own lookup from the coordinates (`tz-lookup`) | Free | CC0 (public domain) | No |
| The clock offset on her birthday | `moment-timezone`, using the IANA time zone database version 2025b | Free | MIT | No |
| Planet positions, Rising, houses | `circular-natal-horoscope-js` v1.1.0 | Free | Unlicense (public domain) | No |
| The 36 Sun / Moon / Rising descriptions | Written by us (3 of them from the onboarding spec) | n/a | Ours | No |

**There is no astrology API and no paid service anywhere in onboarding.** The
place search asks our own database, and the chart is worked out on her phone.
Her birth details only ever go to our own Supabase project, under the
owner-only privacy rules.

---

## 1. Places: the `worldmap` table

### Where it came from

- **Source:** [GeoDataKit](https://geodatakit.com/), a tool for building custom
  place datasets. Its site says the data is built on **GeoNames** (over 11
  million place names worldwide), that you choose the places, the population
  filter and the columns, and that you export the result (CSV, JSON, SQL and
  others).
- **Licence:** the site states the data is "available under CC BY 4.0, which
  permits commercial use with attribution", and its footer reads: *"Geographic
  data sourced from GeoNames, available under a Creative Commons Attribution 4.0
  license."* (Read from the site on 2026-09-21 through a summarising tool, so
  check the wording on the site itself before publishing the credit.)
- **What we must do in return:** show that credit somewhere in the app. **It is
  not in the app yet.** See the last section.
- **How it was loaded:** exported from GeoDataKit and imported into Supabase by
  hand as the table `worldmap`. The table has been replaced once already (the
  first copy had no time zones); the current one has a time zone for every place.

### What is in it (checked in the database)

- **45,138 places** in **218 countries**, using **334 different time zones**.
  About 7 MB.
- **Columns:** `Name`, `Region`, `Country`, `Latitude`, `Longitude`,
  `Population`, `Timezone`, `Id`. (Capital first letters, on purpose: the search
  function refers to them by exactly these names.)
- **Biggest places:** the largest has 32,054,159 people. Most places: India 4,947,
  United States 4,684, Brazil 3,210, China 2,427, Germany 1,765, Russia 1,542.
- **Every place has** coordinates, a population and a time zone. 137 have no region.

### Its limits, and what they mean for her

- **Nothing smaller than 10,000 people is in it.** The smallest place has exactly
  10,000, which fits a 10,000 minimum chosen when the export was built.
  Lithuania has 49 places in the table: Marijampolė is there, but Vilkaviškis,
  Kybartai and Lazdijai are not. Someone born in a smaller town has to pick the
  nearest place that is listed. That barely changes a chart, since a town a few
  tens of kilometres away moves the Rising by well under a degree, but it can
  matter if her Rising sits right on the edge of a sign.
  *To include smaller places, export again from GeoDataKit with a lower minimum.
  That makes the table larger (roughly 3 times the rows for a 1,000 minimum) and
  the search slower, which would need an index.*
- **It includes some city districts.** 124 names contain digits or brackets, such
  as "Zürich (Kreis 3)" and "Paris 15 Vaugirard". The main city always comes
  first in the results, but "zuri" also shows several Zürich districts.
- **One spelling per place**, so alternative names (for example "Wilno" for
  Vilnius) won't be found.
- **Region names are used as they come**, in different styles ("State of
  Mahārāshtra", "Kanton Zürich", "Vilnius County").

### How it is used

1. She types in the birthplace box. After a short pause, `places/places.ts` calls
   the `search_places` function in the database.
2. The function ignores accents and capitals, needs at least 2 letters, and
   treats a comma as "the city, then narrow by region or country", so
   "paris, texas" finds Paris in Texas. An exact name match comes first, then
   bigger places first. It returns the best **6**.
3. She must pick one of them. The place's coordinates go to the chart calculation,
   and its name, city, country and coordinates are saved to her profile.
4. Each place also carries its `Timezone`. **The chart does not use it**: the
   library works out its own time zone from the coordinates (next section). We
   keep the column as a cross-check and for future use.

### Keeping it safe

- Signed-in users can **read** the table and nothing else. Anonymous visitors
  can't touch it, and nobody can change it through the app.
- **If the table is ever replaced or re-imported, it comes back open to writes.**
  Immediately run the first block of
  `supabase/migrations/20260921140000_worldmap_relock_and_timezone_search.sql`.
- **To refresh the data:** export with the same eight column names, and load it
  into the **existing** table (clear the rows, then import) so its permissions
  survive. Afterwards check that searches for "marijampole", "paris, tex", "zuri"
  and "lodz" still work. If the column names ever change, `search_places` has to
  change with them.

---

## 2. Time zones, including historical ones

### The problem

Her birth certificate gives **local clock time**, such as 16:00. A chart needs the
exact universal moment (UTC), so we have to know how far ahead of UTC the clocks
at her birthplace were **on that day**. That gap moves twice a year in many
places and has been changed by governments over the decades, so today's offset
would be wrong for most people: Moscow was UTC+4 in July 2012 but has been UTC+3
since 2014.

### How it is worked out

It all happens inside the chart calculation (`chart/natal-chart.ts` and the
library it uses), on her phone, when she taps **Create my chart**:

1. **Place → coordinates.** The place she chose gives a latitude and longitude.
2. **Coordinates → time zone.** The library finds which time zone those
   coordinates fall in, using `tz-lookup`, which carries a map of the world's time
   zone boundaries and works offline. Result: a zone name such as `Europe/Vilnius`.
3. **Zone + date + time → clock offset.** Using `moment-timezone`, which carries
   every past clock rule for every zone (the IANA time zone database, version
   **2025b**), it finds the offset that applied in that zone at that local date
   and time, summer time and old rule changes included.
4. **Local time → UTC.** Her birth time minus that offset is the universal
   moment. Everything else (planet positions, Rising, houses) is worked out from
   it and the coordinates.
5. **We record what was used.** After the calculation we save the zone name and
   the offset in minutes, in `birth_timezone_name` and `birth_utc_offset_minutes`
   on her profile and inside the chart itself, so the saved record can never
   disagree with the chart it belongs to.

### Examples (checked)

| Place and time | Zone | Offset | Universal time |
|---|---|---|---|
| Marijampolė, 18 Jul 2000, 16:00 | Europe/Vilnius | +2:00 | 14:00 |
| Marijampolė, 18 Jul **2026**, 16:00 | Europe/Vilnius | **+3:00** | 13:00 |
| New York, 15 Jul 1990 | America/New_York | −4:00 (summer time) | |
| New York, 15 Jan 1990 | America/New_York | −5:00 | |
| Kolkata, 18 Jul 2000 | Asia/Kolkata | +5:30 | |
| London, 15 Jan 1970 | Europe/London | +1:00 (Britain kept summer time all year then) | |
| Moscow, 15 Jul 2012 | Europe/Moscow | +4:00 | |

Marijampolė is the onboarding spec's own test case: the same date and place is one
hour different in 2000 and 2026, and getting it wrong would change her Rising.

### The night the clocks change (checked)

| Local time | What the clock did | What we do |
|---|---|---|
| A time that **never happened** (clocks jumped forward, e.g. 2:30am, 2 Apr 2000, New York) | Skipped | Treated as the moment just after the jump |
| A time that **happened twice** (clocks went back, e.g. 1:30am, 29 Oct 2000, New York) | Repeated | The **first** time it happened |

Both are handled the same way every time, but **she is not told**. Someone born
in the repeated hour might get a chart an hour off.

### Two sources for the zone, and they agree (checked)

The `Timezone` column in the places table (from GeoNames) and the library's own
lookup from coordinates are independent. On a sample of 24 places, including
awkward ones (Paris in Texas, Ontario and Tennessee; Sydney in Nova Scotia;
London in Ontario; Los Angeles in Spain), **all 24 gave the same zone**. This is a
spot check, not a full comparison of all 45,138 places.

### Limits

- **Old dates.** Clock records get less reliable the further back you go, and
  before time zones existed places used local solar time. Onboarding only accepts
  birth years from 1900.
- **Places near a zone border.** The zone comes from the coordinates, so a place
  right on a border could land in the neighbouring zone. Comparing with the places
  table's own zone would catch it, but nothing does that yet.
- **New rule changes.** The bundled records are version 2025b. A government
  changing its clocks after that only affects future dates, not birthdays.
- **Her birth time.** All of this assumes she gave the local time on her
  certificate. The "I don't know my birth time" path isn't built yet.

---

## 3. Astrology: `circular-natal-horoscope-js`

### What it is

A free, open-source library written by one author
([0xStarcat on GitHub](https://github.com/0xStarcat/CircularNatalHoroscopeJS)),
released into the **public domain** (Unlicense). It runs entirely on her phone:
no account, no key, no cost per chart, and nothing about her is sent anywhere.

It contains an **ephemeris**, which is a calculator for where the planets were at
any moment. That part is a bundled library (version 1.2.1) whose code includes
Moshier's astronomy routines. We have not measured its accuracy ourselves beyond
the check below.

### What we use it for

| We ask for | Setting |
|---|---|
| Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn: sign, how far into the sign, and which house | Tropical zodiac |
| The Rising sign (Ascendant) | |
| All 12 house cusps | **Placidus** house system |

It can also give the outer planets, the lunar nodes, Chiron, Lilith, aspects and
retrograde flags. We don't use those yet.

### Packages it brings with it

| Package | Version | Licence | Job |
|---|---|---|---|
| `circular-natal-horoscope-js` | 1.1.0 | Unlicense | The chart calculation |
| `moment-timezone` | 0.5.48 | MIT | Historical clock offsets (data 2025b) |
| `moment` | 2.31.0 | MIT | Date handling for the above |
| `tz-lookup` | 6.1.25 | CC0 | Coordinates → time zone |

### How the app uses it

- **`chart/natal-chart.ts`** is the only file that touches it. It loads the
  library only when a chart is being made, so the rest of the app isn't slowed
  down. (That loaded part is about 792 kB, or 223 kB compressed, and is the reason
  a first install is larger.)
- **Nothing it returns is trusted as it comes.** Every sign, number, house and
  time zone is checked; anything unexpected fails the chart, which shows "We
  couldn't create your chart just yet" instead of saving bad data.
- **It counts months from 0** (January = 0). `natal-chart.ts` converts, and a
  test confirms a mid-January birthday stays January.
- The result is saved in `profiles.placements`.

### How it was checked

Against the onboarding spec's own example: **18 July 2000, 16:00, Marijampolė**.

| | Spec | Library |
|---|---|---|
| Sun | Cancer 26.2°, 8th house | Cancer 26.2°, 8th house |
| Moon | Aquarius 18.1°, 3rd house | Aquarius 18.1°, 3rd house |
| Rising | Scorpio 23.9° | Scorpio 23.9° |

Changing the time to 17:00 moves the Rising to Sagittarius, which is why the clock
offset matters so much. **That is one profile.** More should be compared against a
trusted chart site before launch (this is on the build checklist).

### Risks and limits

- It is a small library with a single author. It is public domain, so we can copy
  it into our own code if it ever stops being maintained.
- Only dates from the year 1 onwards work. Not a concern for birthdays.
- Its own type definitions are loose, which is one reason for the checking above.

### Possible later uses

- **Moving the calculation to a server** (a Supabase Edge Function), so the phone
  can no longer write its own chart. The same code moves across.
- **Today's planet positions (daily transits).** Tested on 2026-09-21: asking the
  library for a chart for the current moment gives all ten planets and which are
  retrograde, in about 5.5 ms. The same instant asked from four different places
  (Reykjavik, Marijampolė, Sydney, New York) gave identical positions, so one
  calculation serves everyone. Placing today's planets into **her** natal houses
  works by turning the saved house starts (sign + degree) back into positions
  (rounding error under 0.005°) and finding which two starts a planet falls
  between; that agreed with the library's own house for 10 of 10 natal planets.
  Angles between today's planets and her natal planets (trines, squares and so on)
  are simple maths we do ourselves, since the library only handles one chart at a
  time. This means there is no paid transit service to choose. **Checked:** on
  2026-09-21 the founder compared today's planet positions with an online source
  and they aligned. This is now built as `src/features/transits/` (calculation
  only; nothing in the app uses it yet). **Still to do:** decide the time of day
  the daily focus uses, and spot-check a few other dates.

---

## What still needs doing or deciding

1. **Add the GeoNames credit in the app** (for example in Settings or an About
   screen): *"Geographic data sourced from GeoNames, available under a Creative
   Commons Attribution 4.0 license"*, with links to GeoNames and to the licence.
   Required by CC BY 4.0. **Not done.**
2. **Decide the smallest town we cover.** Today it is 10,000 people. Lowering it
   means a new export and a faster search index.
3. **Fill in what we weren't told:** the date of the GeoDataKit export, the exact
   filters chosen there (place types and population), and the file name.
4. **Optional:** filter the city districts out of the search results.
5. **Optional:** warn when the two time zone sources disagree, and tell someone
   whose birth time falls in a repeated or skipped clock-change hour.
6. **Compare more sample charts** against a trusted chart site.
