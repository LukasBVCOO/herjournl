# Onboarding Build Checklist

## 1. Build the onboarding screens

- [x] Create Welcome screen
- [x] Create Name screen
- [x] Create Date of Birth screen
- [x] Create Birth Time screen
- [x] Create Birthplace screen
- [x] Create “Mapping your chart” loading screen
- [x] Create Sun / Moon / Rising reveal screen (sample placements for now)
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
- [ ] Store historical birth timezone / UTC offset
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
- [ ] Require a valid birthplace selection
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
- [x] Store the timezone / offset required by the astrology API (`birth_timezone_name` + `birth_utc_offset_minutes`; the server should recompute the offset itself when it makes the chart)
- [x] Test historical daylight-saving-time cases
- [x] Test countries whose timezone rules changed historically

---

## 6. Connect the natal astrology API

- [ ] Add Astrology API credentials securely on the server
- [ ] Never expose the Astrology API secret in the client
- [ ] Send birth day
- [ ] Send birth month
- [ ] Send birth year
- [ ] Send birth hour
- [ ] Send birth minute
- [ ] Send birth latitude
- [ ] Send birth longitude
- [ ] Send historical timezone / UTC offset
- [ ] Set `house_type = placidus`
- [ ] Handle successful API response
- [ ] Handle failed API response
- [ ] Add retry behaviour

---

## 7. Save natal chart data

### Required placements

- [ ] Save Sun sign
- [ ] Save Moon sign
- [ ] Save Rising / Ascendant sign
- [ ] Save Mercury position
- [ ] Save Venus position
- [ ] Save Mars position
- [ ] Save Jupiter position
- [ ] Save Saturn position

### Houses and positions

- [ ] Save all 12 house cusps
- [ ] Save natal planet houses
- [ ] Save natal planet degrees
- [ ] Save raw astrology API response if useful for future features
- [ ] Ensure natal data is only recalculated when birth information changes

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

- [x] Display Sun sign (sample data)
- [x] Label Sun as “Your core energy”
- [x] Display Moon sign (sample data)
- [x] Label Moon as “Your inner world”
- [x] Display Rising sign (sample data)
- [x] Label Rising as “How you move through the world”
- [ ] Add one short personalised description for each placement
- [x] Add supporting copy explaining that these placements personalise daily guidance
- [x] Add “See today’s focus” CTA

---

## 10. Create Sun sign copy

Create one short **core identity** description for:

- [ ] Aries Sun
- [ ] Taurus Sun
- [ ] Gemini Sun
- [ ] Cancer Sun
- [ ] Leo Sun
- [ ] Virgo Sun
- [ ] Libra Sun
- [ ] Scorpio Sun
- [ ] Sagittarius Sun
- [ ] Capricorn Sun
- [ ] Aquarius Sun
- [ ] Pisces Sun

---

## 11. Create Moon sign copy

Create one short **emotional / inner-world** description for:

- [ ] Aries Moon
- [ ] Taurus Moon
- [ ] Gemini Moon
- [ ] Cancer Moon
- [ ] Leo Moon
- [ ] Virgo Moon
- [ ] Libra Moon
- [ ] Scorpio Moon
- [ ] Sagittarius Moon
- [ ] Capricorn Moon
- [ ] Aquarius Moon
- [ ] Pisces Moon

---

## 12. Create Rising sign copy

Create one short **outward style / approach to life** description for:

- [ ] Aries Rising
- [ ] Taurus Rising
- [ ] Gemini Rising
- [ ] Cancer Rising
- [ ] Leo Rising
- [ ] Virgo Rising
- [ ] Libra Rising
- [ ] Scorpio Rising
- [ ] Sagittarius Rising
- [ ] Capricorn Rising
- [ ] Aquarius Rising
- [ ] Pisces Rising

---

## 13. Map API results to content

- [ ] Create content lookup for Sun signs
- [ ] Create content lookup for Moon signs
- [ ] Create content lookup for Rising signs
- [ ] Map `Sun = Cancer` → Cancer Sun content
- [ ] Map `Moon = Aquarius` → Aquarius Moon content
- [ ] Map `Ascendant = Scorpio` → Scorpio Rising content
- [ ] Test all 36 placement/content combinations
- [ ] Add fallback behaviour if API returns unexpected values

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

- [ ] Add Birth Details section in Settings
- [ ] Allow date of birth editing
- [ ] Allow birth time editing
- [ ] Allow birthplace editing
- [ ] Show confirmation before recalculating chart
- [ ] Re-run location/timezone logic where required
- [ ] Recalculate natal chart
- [ ] Replace previous natal chart data
- [ ] Keep historical journal entries unchanged

---

## 17. Handle error states

- [x] Invalid birth date
- [x] Future birth date
- [x] User below minimum age
- [ ] Unknown birthplace
- [ ] Duplicate city names
- [ ] Geocoding service failure
- [ ] Historical timezone lookup failure
- [ ] Astrology API failure
- [ ] Slow API response
- [ ] Missing Sun / Moon / Rising data
- [x] User navigates backward during onboarding

---

## 18. Test important edge cases

- [ ] Exact birth time available
- [ ] Birth time unknown
- [ ] Accented city names such as Marijampolė
- [ ] Non-English city names
- [ ] Duplicate city names across countries
- [ ] Cities with the same name within one country
- [ ] Historical daylight-saving changes
- [ ] Historical timezone changes
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
