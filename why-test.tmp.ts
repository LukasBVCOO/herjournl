import { whyThisCard } from "/src/features/daily-focus/content/why-card";
const c = (o: object) => ({ moonLongitude: 285, activeHouse: 10, label: "Career & Direction", moonAspectPlanet: "venus", moonAspectName: "trine", ...o }) as never;
for (const card of [c({}), c({ activeHouse: 1, label: "Self & Identity", moonAspectPlanet: "mars", moonAspectName: "square", moonLongitude: 2 }), c({ activeHouse: null, label: "Emotional Renewal", moonAspectPlanet: null, moonAspectName: null, moonLongitude: 359.9 })]) {
  const w = whyThisCard(card);
  console.log(`[${w.pill}]\n  ${w.lines.join("\n  ")}\n`);
}
