// Creating her chart.
//
// PLACEHOLDER. There is no chart service connected yet. The Sun sign is worked
// out from her birth date (approximately); the Moon and Rising are fixed
// samples, the same ones the onboarding spec uses as its example. The real
// version sends her birth details to the server, which asks the astrology
// service, and returns this same shape or throws if it fails.

import type { Answers } from "./answers-store";
import { type Sign, sunSignFor } from "./sun-sign";

export type Chart = {
  sun: Sign;
  moon: Sign;
  rising: Sign;
};

export async function createChart(answers: Answers): Promise<Chart> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // TESTING ONLY: adding ?fail to the address of the "Mapping your chart"
  // screen makes this fail, so the error screen can be seen.
  if (new URLSearchParams(window.location.search).has("fail")) {
    throw new Error("Placeholder chart failure");
  }

  return {
    sun: sunSignFor(Number(answers.day), Number(answers.month)),
    moon: "Aquarius",
    rising: "Scorpio",
  };
}
