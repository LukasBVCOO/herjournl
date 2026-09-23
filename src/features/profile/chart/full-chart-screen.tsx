import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { BackIcon } from "@/components/icons";
import { HOUSE_VISUAL, houseBorderColor, type HouseNumber } from "@/features/daily-focus";
import {
  placementDescription,
  placementLabel,
  placementTitle,
  type Place,
  type ReducedChart,
} from "@/features/onboarding";
import { useProfile } from "../use-profile";
import { aspectPair, aspectSentence, ASPECT_LABEL } from "./aspect-content";
import ChartWheel from "./chart-wheel";
import {
  ASPECT_ANGLE,
  FULL_POINTS,
  type FullBirthChart,
  type FullPointName,
} from "./full-chart";
import { groupPlanetsByHouse, HOUSE_INFO, ordinal } from "./house-content";
import { mostOccupiedHouse, tightestAspect } from "./overview-content";
import { PLANET_IN_HOUSE } from "./planet-house-content";
import { PLANET_LABEL, POINT_DEFINITION, POINT_LABEL } from "./planet-content";
import { PLANET_IN_SIGN, PLANET_THEME, type SignedPlanet } from "./planet-sign-content";
import { POINT_IN_HOUSE } from "./point-house-content";
import { POINT_IN_SIGN } from "./point-sign-content";
import { useFullChart } from "./use-full-chart";

const label = "text-xs font-medium tracking-wider text-muted uppercase";
const cardClass = "rounded-card bg-card px-5 py-4 shadow-soft";
// Each placement is its own outlined box, not lumped into one shared
// background — no fill, just a border, so entries read as separate cards.
const rowClass = "rounded-card border border-line px-4 py-3.5";

// A section's own heading, outside any background card: the small-caps
// label the rest of the app already uses, with a thin rule trailing off to
// the right so it reads as a section break, not just another line of text.
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className={`${label} shrink-0`}>{children}</h2>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}

const RETROGRADE_EXPLANATION =
  "Retrograde: from Earth, this planet currently appears to move backward. Its themes often feel more internal, delayed, or worth revisiting.";

// The small "+" / "⌄" toggle next to each row's glyph.
function ToggleGlyph({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? <path d="M6 9l6 6 6-6" /> : <path d="M12 5v14M5 12h14" />}
    </svg>
  );
}

// A single placement, collapsed to its title and a plain-language subtitle,
// until she taps it open — so a dense page (every planet, every house) reads
// as something she chooses to go through rather than a wall of text she has
// to scroll past. The first row in each list opens by default, and the open
// row gets a soft highlight so it's obvious which one she's reading.
function AccordionRow({
  house,
  houseBadge,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  // Which house this placement sits in, 1-12 — when open, the row tints
  // with that house's own colour (the same palette the daily focus card
  // uses), so the colour actually means something rather than being
  // decorative. Omitted for placements with no house (Rising has none; a
  // reduced-mode chart has none at all).
  house?: number;
  // A small pill ("6th house") shown even while collapsed — omitted for
  // placements that have no house (the big three, and the going-deeper points).
  houseBadge?: string;
  title: ReactNode;
  subtitle: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const visual = house ? HOUSE_VISUAL[house] : null;
  const openStyle = open
    ? visual
      ? { backgroundColor: visual.background, borderColor: houseBorderColor(visual) }
      : { backgroundColor: "var(--color-paper)" }
    : undefined;
  return (
    <div className={rowClass} style={openStyle}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="min-w-0">
          <span className="block font-serif text-[19px] leading-tight font-medium">{title}</span>
          <span className="mt-0.5 block text-[13px] text-ink-soft">{subtitle}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {houseBadge && visual && (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{ backgroundColor: visual.background, color: visual.color }}
            >
              {houseBadge}
            </span>
          )}
          <span className="text-ink-soft">
            <ToggleGlyph open={open} />
          </span>
        </span>
      </button>
      {open && (
        <div className="mt-2.5 animate-fade-in border-t border-line pt-2.5">{children}</div>
      )}
    </div>
  );
}

// A placement's expanded content: a plain-language label BEFORE the
// interpretation (so she reads what this is about, not a repeated "this is
// where..." preamble every time), the interpretation, and — for a planet, not
// a going-deeper point — which house it falls in and what that house covers.
function PlanetRow({
  title,
  theme,
  interpretation,
  retrograde,
  defaultOpen,
  house,
}: {
  title: string;
  theme: string;
  interpretation: string;
  retrograde?: boolean | null;
  defaultOpen?: boolean;
  // `connection` is the bespoke planet-in-house sentence (planet-house-content.ts),
  // not the house's own generic description — that description is what the
  // Houses tab shows; this is specifically about how THIS planet plays out there.
  house?: { number: number; label: string; connection: string };
}) {
  return (
    <AccordionRow
      house={house?.number}
      houseBadge={house && `${ordinal(house.number)} house`}
      title={
        retrograde ? (
          <>
            {title}
            <span
              className="ml-1.5 align-top text-[13px] font-normal text-muted"
              title={RETROGRADE_EXPLANATION}
            >
              ℞
            </span>
          </>
        ) : (
          title
        )
      }
      subtitle={theme}
      defaultOpen={defaultOpen}
    >
      <p className="text-[15px] leading-snug text-ink-soft">{interpretation}</p>
      {house && (
        <div className="mt-3 border-t border-line pt-3">
          <p className={label}>In your {ordinal(house.number)} house</p>
          <p className="mt-1 text-[14px] leading-snug text-ink-soft">{house.connection}</p>
        </div>
      )}
    </AccordionRow>
  );
}

const TABS = ["overview", "planets", "houses", "aspects", "deeper"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = {
  overview: "Overview",
  planets: "Planets",
  houses: "Houses",
  aspects: "Aspects",
  deeper: "Deeper",
};

// Sits right under the hero, above the tab content itself.
function TabBar({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Chart sections"
      // relative z-10: the hero's illustration bleeds below its own box by
      // design (a plain absolutely-positioned element otherwise paints above
      // normal-flow siblings regardless of DOM order), so this needs its own
      // stacking order to guarantee it renders on top rather than under it.
      className="relative z-10 flex gap-5 border-b border-line"
    >
      {TABS.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={t === tab}
          onClick={() => onChange(t)}
          className={`-mb-px border-b-2 pb-2 text-[14px] transition-colors duration-200 ${
            t === tab ? "border-ink font-medium text-ink" : "border-transparent text-muted hover:text-ink-soft"
          }`}
        >
          {TAB_LABEL[t]}
        </button>
      ))}
    </div>
  );
}

// The wheel, plus a few overarching points assembled from data and copy
// this page already has elsewhere — not a new content system, just a
// summary of it. The default tab, so this is the first thing she sees.
function OverviewTab({ chart }: { chart: FullBirthChart }) {
  const focusHouse = mostOccupiedHouse(chart);
  const focusAspect = tightestAspect(chart);
  const bigThree = (["sun", "moon", "rising"] as const)
    .map((kind) => placementTitle(kind, kind === "rising" ? chart.rising.sign : chart.planets[kind].sign))
    .join(" · ");

  return (
    <div>
      <SectionHeading>Your chart</SectionHeading>
      <div className="mt-4">
        <ChartWheel chart={chart} />
      </div>
      <div className="mt-5 flex flex-col gap-2.5">
        <div className={rowClass}>
          <p className="font-serif text-[18px] leading-tight font-medium">{bigThree}</p>
          <p className="mt-1 text-[13px] text-muted">
            Your big three — the foundation the rest of your chart builds on.
          </p>
        </div>
        {focusHouse && (
          <div className={rowClass}>
            <p className="font-serif text-[18px] leading-tight font-medium">
              Most of your chart centres on {focusHouse.label}
            </p>
            <p className="mt-1 text-[14px] leading-snug text-ink-soft">
              {focusHouse.planets.map((p) => PLANET_LABEL[p]).join(", ")} all sit in your{" "}
              {ordinal(focusHouse.number)} house — {focusHouse.description.toLowerCase()}
            </p>
          </div>
        )}
        {focusAspect && (
          <div className={rowClass}>
            <p className="font-serif text-[18px] leading-tight font-medium">{focusAspect.title}</p>
            <p className="mt-0.5 text-[13px] font-medium text-muted">{focusAspect.theme}</p>
            <p className="mt-1 text-[14px] leading-snug text-ink-soft">{focusAspect.sentence}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanetsTab({ chart }: { chart: FullBirthChart }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionHeading>The big three</SectionHeading>
        <div className="mt-3 flex flex-col gap-2.5">
          {(["sun", "moon", "rising"] as const).map((kind, i) => {
            const sign = kind === "rising" ? chart.rising.sign : chart.planets[kind].sign;
            // Rising has no house of its own (it marks the 1st house's own
            // start), so it has no colour to tint with.
            const house = kind === "rising" ? undefined : chart.planets[kind].house;
            return (
              <AccordionRow
                key={kind}
                house={house}
                title={placementTitle(kind, sign)}
                subtitle={placementLabel[kind]}
                defaultOpen={i === 0}
              >
                <p className="text-[15px] leading-snug text-ink-soft">
                  {placementDescription(kind, sign)}
                </p>
              </AccordionRow>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeading>The personal planets</SectionHeading>
        <div className="mt-3 flex flex-col gap-2.5">
          {(["mercury", "venus", "mars"] as const).map((name, i) => (
            <SignedPlanetRow key={name} name={name} chart={chart} defaultOpen={i === 0} />
          ))}
        </div>
      </div>

      <div>
        <SectionHeading>The outer planets</SectionHeading>
        <div className="mt-3 flex flex-col gap-2.5">
          {(["jupiter", "saturn", "uranus", "neptune", "pluto"] as const).map((name, i) => (
            <SignedPlanetRow key={name} name={name} chart={chart} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

// A personal or outer planet's row: its own genuine planet-in-sign
// interpretation (planet-sign-content.ts), not a generic sign line reused
// under every planet.
function SignedPlanetRow({
  name,
  chart,
  defaultOpen,
}: {
  name: SignedPlanet;
  chart: FullBirthChart;
  defaultOpen?: boolean;
}) {
  const p = chart.planets[name];
  const house = p.house as HouseNumber;
  return (
    <PlanetRow
      title={`${PLANET_LABEL[name]} in ${p.sign}`}
      theme={PLANET_THEME[name]}
      interpretation={PLANET_IN_SIGN[name][p.sign]}
      retrograde={p.retrograde}
      defaultOpen={defaultOpen}
      house={{
        number: p.house,
        label: HOUSE_INFO[house].label,
        connection: PLANET_IN_HOUSE[name][house],
      }}
    />
  );
}

function HousesTab({ chart }: { chart: FullBirthChart }) {
  const houseOf = groupPlanetsByHouse(chart);

  return (
    <div>
      <SectionHeading>Your houses</SectionHeading>
      <div className="mt-3 flex flex-col gap-2.5">
        {Object.keys(HOUSE_INFO)
          .map(Number)
          .sort((a, b) => a - b)
          .map((n, i) => {
            const info = HOUSE_INFO[n as HouseNumber];
            const here = houseOf[n] ?? [];
            return (
              <AccordionRow
                key={n}
                house={n}
                title={`${ordinal(n)} — ${info.label}`}
                subtitle={here.length > 0 ? here.map((h) => PLANET_LABEL[h]).join(" · ") : "No planets here"}
                defaultOpen={i === 0}
              >
                <p className="text-[15px] leading-snug text-ink-soft">{info.description}</p>
                <div className="mt-3 border-t border-line pt-3">
                  <p className="text-[13px] font-medium text-ink-soft">
                    {here.length > 0
                      ? `Placements here: ${here.map((h) => PLANET_LABEL[h]).join(" · ")}`
                      : "No planets in this house"}
                  </p>
                  {here.length === 0 && (
                    <p className="mt-1 text-[13px] leading-snug text-ink-soft">
                      That doesn&rsquo;t mean this area of life is missing or unimportant to you — just
                      that none of your planets happen to sit here.
                    </p>
                  )}
                </div>
              </AccordionRow>
            );
          })}
      </div>
    </div>
  );
}

// How many of her aspects show before "View all aspects" — tightest orb
// first (chart.aspects is already sorted that way), so what's shown by
// default is her strongest angles, not just the first ones found.
const VISIBLE_ASPECTS = 3;

function AspectsTab({ chart }: { chart: FullBirthChart }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? chart.aspects : chart.aspects.slice(0, VISIBLE_ASPECTS);

  return (
    <div>
      <SectionHeading>Your aspects</SectionHeading>
      <p className="mt-1 text-[13px] text-ink-soft">
        The angles between your planets — where two parts of you pull together, and where they pull
        against each other.
      </p>
      {chart.aspects.length === 0 ? (
        <p className="mt-3 text-[15px] text-ink-soft">
          Nothing exact enough to call out — your planets aren&rsquo;t closely angled to each other.
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-col gap-2.5">
            {visible.map((asp, i) => {
              const pair = aspectPair(asp.a, asp.b);
              return (
                <AccordionRow
                  key={i}
                  title={`${PLANET_LABEL[asp.a]} ${ASPECT_LABEL[asp.aspect]} ${PLANET_LABEL[asp.b]}`}
                  subtitle={pair.theme}
                  defaultOpen={i === 0}
                >
                  <p className="text-[15px] leading-snug text-ink-soft">
                    {aspectSentence(asp.aspect, asp.a, asp.b)}
                  </p>
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="text-[13px] text-muted">
                      An exact {ASPECT_LABEL[asp.aspect].toLowerCase()} is {ASPECT_ANGLE[asp.aspect]}&deg;
                      apart. Yours is {asp.orb.toFixed(2)}&deg; off that — the closer to 0&deg;, the
                      stronger it is.
                    </p>
                  </div>
                </AccordionRow>
              );
            })}
          </div>
          {!expanded && chart.aspects.length > VISIBLE_ASPECTS && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-4 text-[14px] font-medium text-ink underline underline-offset-4"
            >
              View all aspects ({chart.aspects.length})
            </button>
          )}
        </>
      )}
    </div>
  );
}

// A "going deeper" point's row: her real, sign-matched interpretation
// (point-sign-content.ts) — a specific title, a recognisable pattern and a
// short reflection, not a generic description of what the point is. That
// general "what is a North Node" explanation lives behind the ⓘ toggle
// instead, kept out of the main card. House context (point-house-content.ts)
// only shows here because DeeperTab only ever renders for a full chart (a
// known birth time) — reduced-mode charts have no houses and never reach it.
function PointRow({ name, chart, defaultOpen }: { name: FullPointName; chart: FullBirthChart; defaultOpen?: boolean }) {
  const [showInfo, setShowInfo] = useState(false);
  const p = chart.points[name];
  const entry = POINT_IN_SIGN[name][p.sign];
  const house = p.house as HouseNumber;

  return (
    <AccordionRow
      house={p.house}
      houseBadge={`${ordinal(p.house)} house`}
      title={
        <>
          {POINT_LABEL[name]} in {p.sign}
          {p.retrograde && (
            <span
              className="ml-1.5 align-top text-[13px] font-normal text-muted"
              title={RETROGRADE_EXPLANATION}
            >
              ℞
            </span>
          )}
        </>
      }
      subtitle={entry.title}
      defaultOpen={defaultOpen}
    >
      <button
        type="button"
        onClick={() => setShowInfo((v) => !v)}
        className="text-[12px] font-medium text-muted underline underline-offset-2"
      >
        ⓘ What is {POINT_LABEL[name]}?
      </button>
      {showInfo && (
        <p className="mt-1.5 text-[13px] leading-snug text-muted">{POINT_DEFINITION[name]}</p>
      )}
      <p className="mt-2 text-[15px] leading-snug text-ink-soft">
        {entry.pattern} {entry.reflection}
      </p>
      <div className="mt-3 border-t border-line pt-3">
        <p className={label}>
          In your {ordinal(p.house)} house · {HOUSE_INFO[house].label}
        </p>
        <p className="mt-1 text-[14px] leading-snug text-ink-soft">{POINT_IN_HOUSE[name][house]}</p>
      </div>
    </AccordionRow>
  );
}

function DeeperTab({ chart }: { chart: FullBirthChart }) {
  return (
    <div>
      <SectionHeading>Going deeper</SectionHeading>
      <p className="mt-1 text-[13px] text-ink-soft">
        A step past the everyday chart — the lunar nodes, and the two points astrologers call Chiron
        and Lilith.
      </p>
      <div className="mt-3 flex flex-col gap-2.5">
        {FULL_POINTS.map((name, i) => (
          <PointRow key={name} name={name} chart={chart} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}

// Everything once a full chart (a known birth time) has been worked out, split
// into 4 tabs (planets / houses / aspects / deeper) so the page isn't one long
// scroll — she picks what she wants to read rather than wading through all of
// it to find it.
function FullChartBody({ chart }: { chart: FullBirthChart }) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="flex flex-col gap-4">
      <TabBar tab={tab} onChange={setTab} />
      {tab === "overview" && <OverviewTab chart={chart} />}
      {tab === "planets" && <PlanetsTab chart={chart} />}
      {tab === "houses" && <HousesTab chart={chart} />}
      {tab === "aspects" && <AspectsTab chart={chart} />}
      {tab === "deeper" && <DeeperTab chart={chart} />}
    </div>
  );
}

// Only what's genuinely known without a birth time: her Sun and (if reliable)
// Moon by sign alone — never a guessed Rising, never a house. See
// content/houses.ts's ReducedChart: an unreliable placement simply isn't here.
function ReducedChartBody({ chart }: { chart: ReducedChart }) {
  const known = (["sun", "moon"] as const).filter((kind) => chart[kind].reliable);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionHeading>What we know without your exact birth time</SectionHeading>
        {known.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2.5">
            {known.map((kind, i) => {
              const sign = chart[kind].sign;
              return (
                <AccordionRow
                  key={kind}
                  title={placementTitle(kind, sign)}
                  subtitle={placementLabel[kind]}
                  defaultOpen={i === 0}
                >
                  <p className="text-[15px] leading-snug text-ink-soft">
                    {placementDescription(kind, sign)}
                  </p>
                </AccordionRow>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-[15px] text-ink-soft">
            Your Sun and Moon each landed too close to changing sign for us to say which without your
            exact time.
          </p>
        )}
      </div>

      <section className={cardClass}>
        <p className="font-serif text-[20px] leading-tight font-medium">
          Add your birth time to see the rest
        </p>
        <p className="mt-2 text-[15px] leading-snug text-ink-soft">
          Your Rising sign, every planet&rsquo;s house, and the angles between them all need an exact
          birth time to work out honestly — we never guess at these.
        </p>
        <Link
          to="/profile"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90"
        >
          Add my birth time
        </Link>
      </section>
    </div>
  );
}

function FullChart({ dateOfBirth, birthTime, place }: {
  dateOfBirth: string;
  birthTime: string;
  place: Place;
}) {
  const state = useFullChart({ dateOfBirth, birthTime, place });

  if (state.status === "loading") {
    return (
      <p
        className="mt-24 animate-breathe text-center font-serif text-[22px] text-ink-soft motion-reduce:animate-none"
        role="status"
      >
        Working out your chart <span className="text-accent">✦</span>
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <p className="mt-16 text-center text-[15px] text-ink-soft">
        We couldn&rsquo;t work out your full chart just now.
      </p>
    );
  }

  return <FullChartBody chart={state.chart} />;
}

const header = (
  <header className="grid grid-cols-[44px_1fr_44px] items-center pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
    {/* Reached from the ☰ menu on the notes list, not from /profile any
        more, so "back" goes there too. */}
    <Link
      to="/"
      aria-label="Back to your notes"
      className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
    >
      <BackIcon />
    </Link>
    <h1 className="text-center font-serif text-[20px] font-medium">Your birth chart</h1>
  </header>
);

// A little framing before the tabs, so the page opens with a warm line
// rather than straight into data. No illustration yet — the founder's mockup
// has one (a moon and flowers); this is text-only until that asset exists.
const hero = (
  <div className="relative mb-5">
    {/* A background element, not a layout element: sized independently of
        the text and free to bleed past this box's own edges, so growing it
        never pushes or shrinks anything else. The text sits above it
        (relative z-10) — a plain absolutely-positioned image otherwise
        paints above normal-flow content by default, regardless of DOM order. */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 -right-2 h-[115px] w-[173px] -translate-y-1/2"
    >
      <img
        src="/birth-chart/header-decorator-birth-chart.png"
        alt=""
        className="h-full w-full object-contain"
      />
      {/* Fades the image's left side into the page instead of a hard edge
          where it meets the headline. */}
      <div
        className="absolute inset-y-0 left-0 w-3/5"
        style={{ background: "linear-gradient(to right, var(--color-paper), transparent)" }}
      />
    </div>
    <div className="relative z-10">
      <h2 className="font-serif text-[26px] leading-tight font-medium">Understand your chart</h2>
      <p className="mt-1 text-[14px] text-ink-soft">Explore one part of yourself at a time.</p>
    </div>
  </div>
);

// Her complete birth chart: every planet, every house, and the angles between
// them — reached from Profile. Loads her profile itself, the same way
// ProfileScreen does, rather than needing the route to fetch it first.
// Calculated fresh from her saved birth details each time this opens, never
// saved (see full-chart.ts's top comment), so it costs nothing extra and
// every existing account gets it immediately.
export default function FullChartScreen() {
  const { state } = useProfile();

  const profile = state.status === "ready" ? state.profile : null;
  const details =
    profile &&
    profile.dateOfBirth &&
    (profile.birthTime || !profile.birthTimeKnown) &&
    profile.place &&
    profile.chart
      ? {
          dateOfBirth: profile.dateOfBirth,
          birthTime: profile.birthTime ?? "",
          birthTimeKnown: profile.birthTimeKnown,
          place: profile.place,
          chart: profile.chart,
        }
      : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-12">
      {header}
      {hero}

      {state.status === "loading" ? null : state.status === "error" ? (
        <p className="mt-16 text-center text-[15px] text-ink-soft">
          We couldn&rsquo;t load your chart.
        </p>
      ) : details ? (
        details.birthTimeKnown && details.chart.kind === "full" ? (
          <FullChart
            dateOfBirth={details.dateOfBirth}
            birthTime={details.birthTime}
            place={details.place}
          />
        ) : (
          <ReducedChartBody chart={details.chart as ReducedChart} />
        )
      ) : (
        <section className={cardClass}>
          <p className="font-serif text-[20px] leading-tight font-medium">
            Your chart hasn&rsquo;t been created yet.
          </p>
          <p className="mt-2 text-[15px] text-ink-soft">
            Head back to your profile to create it from your birth details.
          </p>
          <Link
            to="/profile"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90"
          >
            Back to profile
          </Link>
        </section>
      )}
    </main>
  );
}
