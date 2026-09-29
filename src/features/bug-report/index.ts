// Reporting a bug from inside the app.
//
//   bug-report-screen.tsx  the form, at /report-bug (linked from Profile)
//   bug-report-api.ts      sending it to the bug_reports table, which she can
//                          only add to, never read back
//
// The rest of the app uses only what is exported here.
export { default as BugReportScreen } from "./bug-report-screen";
