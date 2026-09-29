import { Link } from "react-router";
import { CONTACT_EMAIL } from "./contact";

const linkClass =
  "inline-flex h-11 items-center px-2 text-[14px] font-medium text-ink-soft underline decoration-line underline-offset-4 transition-colors duration-200 hover:text-ink";

// "Privacy · Terms · Contact", reachable without logging in. Used at the
// bottom of the legal pages and of Profile.
export function LegalLinks() {
  return (
    <nav aria-label="Legal" className="flex flex-wrap items-center justify-center">
      <Link to="/privacy" className={linkClass}>
        Privacy
      </Link>
      <span aria-hidden="true" className="text-line">
        ·
      </span>
      <Link to="/terms" className={linkClass}>
        Terms
      </Link>
      <span aria-hidden="true" className="text-line">
        ·
      </span>
      <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
        Contact
      </a>
    </nav>
  );
}

// The credit the birthplace search's data requires (GeoNames, CC BY 4.0).
export function DataCredit() {
  return (
    <p className="text-center text-[12px] leading-relaxed text-ink-soft">
      Geographic data sourced from{" "}
      <a
        href="https://www.geonames.org/"
        target="_blank"
        rel="noreferrer"
        className="underline decoration-line underline-offset-2 hover:text-ink"
      >
        GeoNames
      </a>
      , available under a{" "}
      <a
        href="https://creativecommons.org/licenses/by/4.0/"
        target="_blank"
        rel="noreferrer"
        className="underline decoration-line underline-offset-2 hover:text-ink"
      >
        Creative Commons Attribution 4.0 license
      </a>
      .
    </p>
  );
}

export default function LegalFooter() {
  return (
    <footer className="mt-14 flex flex-col items-center gap-2 border-t border-line pt-6">
      <LegalLinks />
      <DataCredit />
      <p className="text-[12px] text-ink-soft">© 2026 Becomely. All rights reserved.</p>
    </footer>
  );
}
