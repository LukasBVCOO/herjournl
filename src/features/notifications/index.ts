// Push notifications: letting her turn morning and evening reminders on or off.
//
//   push.ts                  talking to the browser's push machinery (ask
//                            permission, subscribe, unsubscribe)
//   push-api.ts               saving and removing her subscription in the database
//   use-push.ts               where notifications stand for this browser right now
//   notifications-section.tsx the on/off control, shown in Settings
//
// This only covers turning notifications on and off, and proving one can be
// delivered. Nothing sends a real morning or evening notification yet — that
// needs a small server piece, still to come.
export { default as NotificationsSection } from "./notifications-section";
