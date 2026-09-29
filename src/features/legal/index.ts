// The legal pages, open to anyone without logging in.
//
//   privacy-screen.tsx  the privacy policy, at /privacy
//   terms-screen.tsx    the terms of service, at /terms
//   legal-page.tsx      the shared reading layout and its pieces
//   legal-footer.tsx    Privacy · Terms · Contact links, and the GeoNames
//                       credit the birthplace data requires
//   contact.ts          the contact email
//
// The rest of the app uses only what is exported here.
export { default as PrivacyScreen } from "./privacy-screen";
export { default as TermsScreen } from "./terms-screen";
export { DataCredit, LegalLinks } from "./legal-footer";
