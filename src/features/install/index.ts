// Putting the app on her home screen, and keeping it up to date once it is there.
//
//   install-store.ts        can it be installed, is it already (outside React)
//   install-button.tsx      the download icon in the notes list header
//   install-sheet.tsx       the "how to add it" steps, for browsers with no
//                          install dialog
//   update-prompt.tsx       the "new version ready" pill
//   download-icon.tsx       the icon
//   install-offer.ts        whether to offer the first-time install nudge (her
//                          account, not just this device: it can start on a
//                          computer and finish on her phone), at most 3 times
//   install-offer-prompt.tsx  the nudge itself, shown on the notes list
//   installed-sync.tsx      tells her account the moment any install path
//                          (this nudge, the header button, her browser's own
//                          menu) succeeds
//
// The rest of the app only uses what is exported here.
export { default as InstallButton } from "./install-button";
export { default as UpdatePrompt } from "./update-prompt";
export { default as InstallOfferPrompt } from "./install-offer-prompt";
export { default as InstalledSync } from "./installed-sync";

// For the notifications feature: whether the app is already on her home
// screen, and which install instructions to show if not (iPhone needs Safari's
// own steps; push notifications on iPhone only work once it is installed).
export { getInstallState, subscribe as subscribeToInstallState, isIphone } from "./install-store";
export { default as InstallSheet } from "./install-sheet";
