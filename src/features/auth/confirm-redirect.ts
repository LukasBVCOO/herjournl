// Where the link in the confirmation email brings her back to: the site she is
// on right now (the live site from her phone, localhost while building), on the
// page that signs her in and sends her on to the welcome. Sign-up and "resend
// email" both use it, so the two emails always behave the same.
export function confirmationRedirectUrl() {
  return `${window.location.origin}/auth/confirmed`;
}
