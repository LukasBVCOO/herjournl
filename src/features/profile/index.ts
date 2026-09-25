// Her profile: where she manages her name, her birth details and her chart.
//
//   profile-screen.tsx        the screen, at /profile
//   name-section.tsx          her name, and changing it
//   birth-details-section.tsx her birth date, time and birthplace, and changing
//                             them. A change asks first, then recalculates her
//                             chart and replaces the old one
//   chart-section.tsx         her Sun, Moon and Rising
//   confirm-sheet.tsx         the "are you sure?" sheet
//   change-email-section.tsx    her email, and changing it (a confirmation link
//                                first — see account-api.ts)
//   change-password-section.tsx her password, and changing it (her current one
//                                first, to prove it's really her)
//   account-api.ts            talking to Supabase Auth directly for the two
//                             above — not the profiles table (profile-api.ts)
//   profile-api.ts            reading and changing her profile in the database
//   use-profile.ts            loading it for the screen
//   format.ts                 how a saved date and time are shown
//
// It does not repeat any of the birth-details logic. The inputs, the checks,
// the place search and the chart calculation all come from the onboarding
// feature (through its index.ts), so changing her details here works exactly
// the way answering them did there.
//
// The rest of the app uses only what is exported here.
export { default as ProfileScreen } from "./profile-screen";
// Her complete birth chart — every planet, every house, the angles between
// them — reached from a link on the Profile screen once she has a chart.
export { default as FullChartScreen } from "./chart/full-chart-screen";
