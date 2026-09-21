# Onboarding Build Checklist

## 1. Build the onboarding screens

- [x] Create Welcome screen
- [x] Create Name screen
- [x] Create Date of Birth screen
- [x] Create Birth Time screen
- [x] Create Birthplace screen
- [x] Create “Mapping your chart” loading screen
- [x] Create Sun / Moon / Rising reveal screen
- [x] Add “See today’s focus” CTA
- [x] Add subtle onboarding progress indicator
- [x] Add back navigation between onboarding screens

---

## 2. Create the user data structure

- [x] Store `name`
- [x] Store date of birth
- [x] Store birth hour (in `birth_time`)
- [x] Store birth minute (in `birth_time`)
- [x] Store `birth_time_known`
- [x] Store birth country
- [x] Store birth city / display name
- [x] Store birth latitude
- [x] Store birth longitude
- [x] Store historical birth timezone / UTC offset (`birth_timezone_name` + `birth_utc_offset_minutes`)
- [x] Store onboarding completion status

---

## 3. Build form validation and state

- [x] Require a name
- [x] Trim unnecessary spaces from name
- [x] Allow accented and non-English characters
- [x] Validate date of birth
- [x] Prevent future dates
- [x] Apply minimum age requirement (16)
- [x] Validate birth time
- [ ] Add “I don’t know my birth time” option
- [ ] Save `birth_time_known = false` when used
- [x] Require a valid birthplace selection (she has to pick from the list)
- [x] Preserve entered data when user navigates backward
- [x] Preserve entered data if an API call fails

---

## 4. Add birthplace search

- [x] Add Country input / selector (replaced by one search box that shows the country)
- [x] Add City / town search input (one box, searches the `worldmap` table)
- [x] Show matching place suggestions
- [x] Show city / town name
- [x] Show region where relevant
- [x] Show country
- [x] Require the user to select a valid suggestion
- [x] Disable “Create my chart” until a location is selected
- [x] Retrieve latitude for selected birthplace
- [x] Retrieve longitude for selected birthplace
- [x] Store formatted location name
- [x] Store country
- [x] Cache previously resolved locations where practical (not needed: places are our own `worldmap` table)

---

## 5. Resolve historical timezone

- [x] Determine the timezone for the selected birthplace (from the `worldmap` table)
- [x] Determine the correct historical UTC offset for the birth date and time
- [x] Store the timezone / offset required by the astrology API (`birth_timezone_name` + `birth_utc_offset_minutes`: the zone and offset the chart calculation actually used)
- [x] Test historical daylight-saving-time cases
- [x] Test countries whose timezone rules changed historically

---

## 6. Connect the natal astrology API

- [x] Add Astrology API credentials securely on the server (not needed: the chart is calculated by the `circular-natal-horoscope-js` library)
- [x] Never expose the Astrology API secret in the client (not needed: no API and no secret)
- [x] Send birth day (to the library)
- [x] Send birth month (to the library)
- [x] Send birth year (to the library)
- [x] Send birth hour (to the library)
- [x] Send birth minute (to the library)
- [x] Send birth latitude (to the library)
- [x] Send birth longitude (to the library)
- [x] Send historical timezone / UTC offset (the library works it out; we save what it used)
- [x] Set `house_type = placidus`
- [x] Handle successful API response
- [x] Handle failed API response (checked results; anything unexpected shows the error screen)
- [x] Add retry behaviour (“Try again” on the mapping screen)

---

## 7. Save natal chart data

### Required placements

- [x] Save Sun sign (in `profiles.placements`)
- [x] Save Moon sign (in `profiles.placements`)
- [x] Save Rising / Ascendant sign (in `profiles.placements`)
- [x] Save Mercury position (in `profiles.placements`)
- [x] Save Venus position (in `profiles.placements`)
- [x] Save Mars position (in `profiles.placements`)
- [x] Save Jupiter position (in `profiles.placements`)
- [x] Save Saturn position (in `profiles.placements`)

### Houses and positions

- [x] Save all 12 house cusps (in `profiles.placements`)
- [x] Save natal planet houses (in `profiles.placements`)
- [x] Save natal planet degrees (in `profiles.placements`)
- [x] Save raw astrology API response if useful for future features (not needed: there is no API, and the chart can always be recalculated from the birth details)
- [x] Ensure natal data is only recalculated when birth information changes (a name change, or saving with nothing changed, does not recalculate)

---

## 8. Build the chart calculation state

- [x] Show “Mapping your chart ✦”
- [x] Show supporting copy while APIs are running
- [x] Add subtle animation / celestial visual
- [x] Automatically continue when chart calculation succeeds
- [x] Show error state when chart calculation fails
- [x] Add “Try again” CTA
- [x] Do not clear the user’s birth information after an error

---

## 9. Build the Sun / Moon / Rising reveal

- [x] Display Sun sign
- [x] Label Sun as “Your core energy”
- [x] Display Moon sign
- [x] Label Moon as “Your inner world”
- [x] Display Rising sign
- [x] Label Rising as “How you move through the world”
- [x] Add one short personalised description for each placement
- [x] Add supporting copy explaining that these placements personalise daily guidance
- [x] Add “See today’s focus” CTA

---

## 10. Create Sun sign copy

Create one short **core identity** description for:

- [x] Aries Sun
- [x] Taurus Sun
- [x] Gemini Sun
- [x] Cancer Sun
- [x] Leo Sun
- [x] Virgo Sun
- [x] Libra Sun
- [x] Scorpio Sun
- [x] Sagittarius Sun
- [x] Capricorn Sun
- [x] Aquarius Sun
- [x] Pisces Sun

---

## 11. Create Moon sign copy

Create one short **emotional / inner-world** description for:

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

---

## 12. Create Rising sign copy

Create one short **outward style / approach to life** description for:

- [x] Aries Rising
- [x] Taurus Rising
- [x] Gemini Rising
- [x] Cancer Rising
- [x] Leo Rising
- [x] Virgo Rising
- [x] Libra Rising
- [x] Scorpio Rising
- [x] Sagittarius Rising
- [x] Capricorn Rising
- [x] Aquarius Rising
- [x] Pisces Rising

---

## 13. Map API results to content

- [x] Create content lookup for Sun signs
- [x] Create content lookup for Moon signs
- [x] Create content lookup for Rising signs
- [x] Map `Sun = Cancer` → Cancer Sun content
- [x] Map `Moon = Aquarius` → Aquarius Moon content
- [x] Map `Ascendant = Scorpio` → Scorpio Rising content
- [x] Test all 36 placement/content combinations
- [x] Add fallback behaviour if API returns unexpected values

---

## 14. Build the first Daily Focus placeholder

- [x] Create the Daily Focus Card UI (stand-in)
- [x] Add placeholder / mock focus data
- [x] Add focus headline
- [x] Add short guidance text
- [x] Add journaling prompt
- [x] Add “Start writing…” input (opens a new note)
- [x] Route “See today’s focus” to this screen
- [x] Do **not** build the full transit engine yet

---

## 15. Add analytics

- [ ] Track `onboarding_started`
- [ ] Track `name_completed`
- [ ] Track `dob_completed`
- [ ] Track `birth_time_completed`
- [ ] Track `birthplace_search_started`
- [ ] Track `birthplace_selected`
- [ ] Track `chart_generation_started`
- [ ] Track `chart_generation_success`
- [ ] Track `chart_generation_failed`
- [ ] Track `chart_reveal_viewed`
- [ ] Track `onboarding_completed`

### Metrics to monitor

- [ ] Measure onboarding completion rate
- [ ] Measure drop-off by screen
- [ ] Measure % of users who know exact birth time
- [ ] Measure birthplace search failure rate
- [ ] Measure natal chart API failure rate
- [ ] Measure chart reveal → first Daily Focus conversion

---

## 16. Build Settings editing for birth details

- [x] Add Birth Details section in Settings (built as the “Birth details” card on the new **Profile** screen, opened from the person icon in the notes header)
- [x] Allow date of birth editing
- [x] Allow birth time editing
- [x] Allow birthplace editing
- [x] Show confirmation before recalculating chart
- [x] Re-run location/timezone logic where required (a new place gives new coordinates; the chart calculation works out the time zone and clock offset again)
- [x] Recalculate natal chart (with a loading screen while it works)
- [x] Replace previous natal chart data (the new details and chart are saved together in one write)
- [x] Keep historical journal entries unchanged (notes are never touched)

---

## 17. Handle error states

- [x] Invalid birth date
- [x] Future birth date
- [x] User below minimum age
- [x] Unknown birthplace
- [x] Duplicate city names (each result shows its region and country)
- [x] Geocoding service failure (“We couldn’t find your birthplace right now” with Try again)
- [x] Historical timezone lookup failure (the chart calculation fails safely and shows the error screen)
- [x] Astrology API failure (there is no API; any failure in the calculation shows the error screen)
- [ ] Slow API response
- [x] Missing Sun / Moon / Rising data (every result is checked)
- [x] User navigates backward during onboarding

---

## 18. Test important edge cases

- [ ] Exact birth time available
- [ ] Birth time unknown
- [x] Accented city names such as Marijampolė (checked)
- [x] Non-English city names (checked: Łódź, Zürich, São Paulo)
- [x] Duplicate city names across countries (checked: Paris, Birmingham)
- [x] Cities with the same name within one country (checked: the Parises in the United States)
- [x] Historical daylight-saving changes (checked by script, including the skipped and repeated hour)
- [x] Historical timezone changes (checked by script: Moscow 2012, London 1970)
- [ ] Astrology API timeout
- [ ] Geocoding API timeout
- [ ] User edits DOB before chart calculation
- [ ] User edits birthplace before chart calculation
- [ ] User changes birth information after onboarding

---

## 19. Test the complete happy path

- [ ] Open app
- [ ] Tap **Get started**
- [ ] Enter `Lukas`
- [ ] Enter `18/07/2000`
- [ ] Enter `16:00`
- [ ] Select `Lithuania`
- [ ] Select `Marijampolė`
- [ ] Tap **Create my chart**
- [ ] See **Mapping your chart ✦**
- [ ] Receive correct natal chart data
- [ ] See **Cancer Sun**
- [ ] See **Aquarius Moon**
- [ ] See **Scorpio Rising**
- [ ] Tap **See today’s focus**
- [ ] Land on Daily Focus Card

---

# First Technical Milestone

Do not build the full daily astrology system yet.

The first milestone is complete when this works reliably:

- [ ] User enters birth details
- [ ] Birthplace resolves to correct coordinates
- [ ] Historical timezone is correct
- [ ] Astrology API returns the natal chart
- [ ] Sun is displayed correctly
- [ ] Moon is displayed correctly
- [ ] Rising is displayed correctly
- [ ] Natal data is saved to the user profile

Once this is stable, move on to:

> **Natal chart + current transits → personalised Daily Focus Card**

---

# V1 Definition of Done

- [ ] A new user can complete onboarding without knowing astrology
- [ ] Birth information is correctly collected and stored
- [ ] A valid natal chart is generated
- [ ] Sun, Moon and Rising are correctly revealed
- [ ] The onboarding feels personalised and non-technical
- [ ] The user can reach the Daily Focus screen
- [ ] API failures do not destroy entered data
- [ ] Analytics track the full onboarding funnel
- [ ] Birth information can be corrected later
- [ ] Full transit logic remains out of scope until onboarding is stable
