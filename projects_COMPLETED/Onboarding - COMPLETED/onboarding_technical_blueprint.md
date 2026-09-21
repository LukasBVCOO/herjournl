Onboarding Technical Blueprint

1. Goal

Build the simplest reliable system that can:

collect a user's birth details,

resolve their birthplace into the correct coordinates and historical timezone,

generate their natal chart,

save the chart permanently,

reveal Sun, Moon and Rising,

prepare the user profile for the later Daily Focus system.

The onboarding should hide technical astrology complexity from the user.

2. High-Level Architecture

MOBILE / WEB APP
      |
      v
ONBOARDING FORM
      |
      v
BACKEND / API LAYER
      |
      +--------------------+
      |                    |
      v                    v
LOCATION SERVICE      DATABASE
      |
      v
LAT / LON
      |
      v
TIMEZONE RESOLUTION
      |
      v
HISTORICAL UTC OFFSET
      |
      v
ASTROLOGY API
      |
      v
NATAL CHART RESPONSE
      |
      v
NORMALISE + SAVE DATA
      |
      v
SUN / MOON / RISING REVEAL
      |
      v
DAILY FOCUS

3. User Flow

Welcome
↓
Name
↓
Date of birth
↓
Birth time
↓
Country
↓
City / birthplace
↓
Create my chart
↓
Resolve birthplace
↓
Resolve historical timezone
↓
Generate natal chart
↓
Save natal chart
↓
Reveal Sun / Moon / Rising
↓
See today's focus

4. Frontend Responsibilities

The frontend should only handle:

onboarding UI,

user input,

validation,

loading states,

error states,

displaying returned chart data.

The frontend should not contain private API credentials.

Frontend data collected

{
  "name": "Lukas",
  "birth_date": "2000-07-18",
  "birth_hour": 16,
  "birth_minute": 0,
  "birth_time_known": true,
  "birth_country": "Lithuania",
  "birthplace": "Marijampolė"
}

When the user selects Create my chart, send this information to the backend.

5. Backend Responsibilities

The backend is responsible for:

geocoding the birthplace,

timezone resolution,

Astrology API authentication,

natal chart generation,

normalising API responses,

writing data to the database,

protecting API secrets,

handling retries and errors.

The client should never call the Astrology API directly with exposed credentials.

6. Database Structure

A simple V1 can use the following core tables.

users

id
name
email / auth identifier
onboarding_completed
created_at
updated_at

birth_profiles

id
user_id

birth_date
birth_hour
birth_minute
birth_time_known

birthplace_display
birth_city
birth_country

birth_latitude
birth_longitude

birth_timezone_name
birth_utc_offset

house_system

created_at
updated_at

Recommended:

house_system = "placidus"

natal_charts

id
user_id
birth_profile_id

sun_sign
sun_degree
sun_house

moon_sign
moon_degree
moon_house

rising_sign
ascendant_degree

mercury_sign
mercury_degree
mercury_house

venus_sign
venus_degree
venus_house

mars_sign
mars_degree
mars_house

jupiter_sign
jupiter_degree
jupiter_house

saturn_sign
saturn_degree
saturn_house

raw_api_response

created_at
updated_at

house_cusps

Either save them as separate columns:

house_1_degree
house_2_degree
house_3_degree
...
house_12_degree

or preferably as structured JSON:

{
  "1": {
    "sign": "Scorpio",
    "degree": 23.9
  },
  "2": {
    "sign": "Sagittarius",
    "degree": 27.1
  }
}

For V1, storing the full house-cusp result as JSON is acceptable.

locations

Optional caching table.

id
search_key
city
region
country
latitude
longitude
timezone_name
created_at

Example:

search_key:
marijampole|lithuania

Before calling the geocoding API:

Check locations table
↓
Already exists?
    YES → reuse saved coordinates
    NO → call geocoding API and save result

7. Location Resolution

The user should enter:

Country: Lithuania
City: Marijampolė

The backend resolves this into:

{
  "city": "Marijampolė",
  "country": "Lithuania",
  "lat": 54.56,
  "lon": 23.35
}

Important

The location being resolved is the birthplace, not the user's current location.

Current GPS location is not required for the natal chart.

8. Historical Timezone Resolution

The astrology calculation requires the correct timezone / UTC offset at the moment of birth.

Input:

Birth date
Birth time
Latitude
Longitude

Output:

Timezone name
Historical UTC offset

Conceptually:

Marijampolė
18 July 2000
16:00 local time
↓
Historical timezone rules
↓
Correct UTC offset for that date

Do not simply use the user's current timezone.

Store the resolved value with the birth profile so it does not need to be recalculated on every request.

9. Natal Chart API Request

Once the backend has:

day
month
year
hour
minute
latitude
longitude
timezone

send them to the natal astrology endpoint.

Conceptual request:

{
  "day": 18,
  "month": 7,
  "year": 2000,
  "hour": 16,
  "min": 0,
  "lat": 54.56,
  "lon": 23.35,
  "tzone": 2,
  "house_type": "placidus"
}

Authentication must happen server-side.

10. Natal API Response Handling

The astrology provider may return much more information than V1 needs.

Do not expose the raw response directly to the UI.

Normalise it into your own internal format.

Example:

{
  "sun": {
    "sign": "Cancer",
    "degree": 26.2,
    "house": 8
  },
  "moon": {
    "sign": "Aquarius",
    "degree": 18.1,
    "house": 3
  },
  "rising": {
    "sign": "Scorpio",
    "degree": 23.9
  }
}

Also save:

Mercury

Venus

Mars

Jupiter

Saturn

12 house cusps

The UI does not need to show these yet.

11. Content Layer

Do not use an AI call to explain Sun, Moon and Rising during onboarding.

Use a controlled content library.

Example:

content.sun.cancer
content.moon.aquarius
content.rising.scorpio

Structure:

{
  "sun": {
    "Cancer": {
      "label": "Your core energy",
      "description": "You lead with feeling, intuition and what matters deeply to you."
    }
  }
}

Create:

12 Sun descriptions
12 Moon descriptions
12 Rising descriptions

Total:

36 descriptions

This gives predictable quality and costs nothing per user.

12. Chart Reveal Response

The backend can return a clean onboarding response:

{
  "name": "Lukas",
  "placements": {
    "sun": {
      "sign": "Cancer",
      "title": "Cancer Sun",
      "label": "Your core energy",
      "description": "..."
    },
    "moon": {
      "sign": "Aquarius",
      "title": "Aquarius Moon",
      "label": "Your inner world",
      "description": "..."
    },
    "rising": {
      "sign": "Scorpio",
      "title": "Scorpio Rising",
      "label": "How you move through the world",
      "description": "..."
    }
  }
}

The frontend renders this response directly.

13. API Call Blueprint

New user signup

Call 1: Geocoding

Only required when the birthplace is not already cached.

Marijampolė, Lithuania
→ latitude / longitude

Call 2: Timezone lookup

If not handled by the same location service or your own timezone library:

lat / lon + birth date
→ historical timezone / UTC offset

Call 3: Natal chart

birth data + coordinates + timezone
→ natal chart

Optional

No AI call is required during onboarding.

14. API Call Optimisation

Cache what does not change.

Birthplace

Once resolved:

Marijampolė, Lithuania
→ 54.56 / 23.35

save it.

Natal chart

A natal chart is fixed.

Generate it once and reuse it forever unless the user edits:

birth date,

birth time,

birthplace.

Placement descriptions

Store locally in the app/database.

No API call required.

15. Error Handling Blueprint

Geocoding fails

User birth details
↓
Location lookup fails
↓
Keep entered data
↓
Show retry

Do not restart onboarding.

Timezone resolution fails

Do not guess the timezone silently.

Show a recoverable error and retry.

Astrology API fails

Birth profile already saved
↓
Natal API fails
↓
Show:
"We couldn't create your chart right now."
↓
Try again

Do not make the user re-enter their information.

16. Unknown Birth Time

If:

birth_time_known = false

V1 should not pretend the Rising sign and houses are exact.

Possible behaviour:

Sun → available
Moon → usually available
Rising → unavailable / approximate
Houses → unavailable / approximate

The app can still complete onboarding but should mark the user's profile as:

personalisation_level = reduced

Do not silently fabricate an exact birth time.

17. Settings Recalculation Flow

If the user changes:

DOB
birth time
birthplace

then:

User saves changes
↓
Show confirmation
↓
Resolve location if needed
↓
Resolve historical timezone
↓
Call natal API again
↓
Replace natal chart
↓
Future guidance uses new chart

Historical journal entries remain untouched.

18. Analytics Blueprint

Each onboarding screen emits an event.

onboarding_started
name_completed
dob_completed
birth_time_completed
birthplace_search_started
birthplace_selected
chart_generation_started
chart_generation_success
chart_generation_failed
chart_reveal_viewed
onboarding_completed

Attach where useful:

user_id
screen
timestamp
birth_time_known
error_type

Do not send sensitive birth data into analytics unless necessary.

19. Security Rules

Astrology API credentials stay server-side

Geocoding credentials stay server-side where required

Never expose secret keys in the mobile/web bundle

Validate all incoming user data on the backend

Rate-limit public backend endpoints

Store only the birth data needed by the product

Protect birth-profile data using normal authenticated database access

Never trust client-provided natal chart results

Calculate or validate natal data server-side

20. First Technical Milestone

Do not attempt the Daily Focus engine yet.

The first milestone is:

Birth details entered
↓
Birthplace resolved
↓
Historical timezone resolved
↓
Natal API succeeds
↓
Chart saved
↓
Sun displayed
↓
Moon displayed
↓
Rising displayed

Test using a known birth profile.

Example:

18 July 2000
16:00
Marijampolė, Lithuania

Verify the returned placements against a trusted astrology calculation before considering the integration complete.

21. Future Daily Focus Extension

The onboarding architecture should make the later system easy to add.

The saved natal chart becomes the permanent personal layer.

Future flow:

SAVED NATAL CHART
        +
CURRENT TRANSITS
        |
        v
ACTIVE NATAL HOUSE
        +
NATAL PERSONALITY TRAIT
        |
        v
DAILY FOCUS ENGINE
        |
        v
PERSONALISED DAILY CARD

Example:

Current Moon
↓
Transiting user's 10th house
↓
10th house = career / direction
↓
Natal Moon = Aquarius
↓
Generate personalised focus

The user sees:

TODAY'S FOCUS

Your direction

Today puts more attention on where you're going and
what progress means to you.

What is one move your future self would make today?

The user does not need to see:

Moon transit
10th house
Aquarius Moon
degrees
aspects

Those remain inside the engine.

22. V1 System Boundary

Build now

Onboarding UI
User birth profile
Location resolution
Historical timezone resolution
Natal astrology API
Natal chart storage
Sun / Moon / Rising reveal
Settings editing
Analytics
Error handling

Build later

Daily transit engine
Transit scoring
Planet weighting
AI daily card generation
Morning push notifications
Evening reflection notifications
Journal entries
To-do list
Limiting-belief prompts
Streaks
Subscription/paywall
Advanced aspects
Retrograde logic
Long-term Jupiter/Saturn themes

23. Blueprint Summary

The entire onboarding system can be reduced to:

USER INPUT
Name
DOB
Birth time
Birthplace

        ↓

LOCATION
Birthplace → lat/lon

        ↓

TIME
Birth date + birthplace → historical timezone

        ↓

ASTROLOGY
Birth data → natal chart

        ↓

DATABASE
Save fixed personal chart

        ↓

CONTENT
Map Sun / Moon / Rising → controlled descriptions

        ↓

EXPERIENCE
Reveal chart → enter Daily Focus

The key architectural principle is:

Calculate the complicated astrology once, save it, and keep the user-facing experience simple.