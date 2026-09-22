// Putting the app on her home screen, and keeping it up to date once it is there.
//
//   install-store.ts    can it be installed, is it already (outside React)
//   install-button.tsx  the download icon in the notes list header
//   install-sheet.tsx   the "how to add it" steps, for browsers with no install dialog
//   update-prompt.tsx   the "new version ready" pill
//   download-icon.tsx   the icon
//
// The rest of the app only uses what is exported here.
export { default as InstallButton } from "./install-button";
export { default as UpdatePrompt } from "./update-prompt";

// For the notifications feature: whether the app is already on her home
// screen, and which install instructions to show if not (iPhone needs Safari's
// own steps; push notifications on iPhone only work once it is installed).
export { getInstallState, subscribe as subscribeToInstallState, isIphone } from "./install-store";
export { default as InstallSheet } from "./install-sheet";
