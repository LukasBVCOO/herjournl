// Putting the app on her home screen, and keeping it up to date once it is there.
//
//   install-store.ts        can it be installed, is it already (outside React)
//   install-button.tsx      the download icon in the notes list header
//   install-sheet.tsx       the "how to add it" steps, for browsers with no
//                          install dialog
//   update-prompt.tsx       the "new version ready" pill
//   download-icon.tsx       the icon
//   install-offer.ts        whether the "add to home screen" card is due (her
//                          account, not just this device: it can start on a
//                          computer and finish on her phone); "Not now" puts it
//                          away for 3 days, installing ends it for good
//   install-app-card.tsx    the "Get the Becomely App" card's look and Download
//   install-display.ts      whether this is a phone-sized screen
//   install-offer-card.tsx  that card under the day's cards on the notes list
//                          (can be put away with Not now / ×)
//   profile-install-card.tsx  the same card, always on Profile (just Download)
//   desktop-notice.tsx      "Becomely is made for your phone", once per computer
//   installed-sync.tsx      tells her account the moment any install path
//                          (the card, the header button, her browser's own
//                          menu) succeeds
//
// The rest of the app only uses what is exported here.
export { default as InstallButton } from "./install-button";
export { default as UpdatePrompt } from "./update-prompt";
export { default as InstallOfferCard } from "./install-offer-card";
export { default as ProfileInstallCard } from "./profile-install-card";
export { default as DesktopNotice } from "./desktop-notice";
export { default as InstalledSync } from "./installed-sync";

// For the notifications feature: whether the app is already on her home
// screen, and which install instructions to show if not (iPhone needs Safari's
// own steps; push notifications on iPhone only work once it is installed).
export { getInstallState, subscribe as subscribeToInstallState, isIphone, isRunningAsApp } from "./install-store";
export { default as InstallSheet } from "./install-sheet";
