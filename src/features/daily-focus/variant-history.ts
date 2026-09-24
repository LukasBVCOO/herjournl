// What she's already seen recently for a given area of life (or reduced-mode
// theme), so a new card's reflection and three prompts can avoid repeating
// them — see deterministic-seed.ts's pickIndexAvoiding, which is what
// actually uses this. Read-only, and never lets a database hiccup block a
// card from being made: any problem here just means nothing is avoided,
// which reads exactly the same as "no history yet" (empty sets).
//
// No owner filter is written here on purpose, the same as card-store.ts's
// findCard: the database only ever returns her own rows.

import { supabase } from "@/lib/supabase/client";
import { NO_RECENT_VARIANTS, type RecentVariants } from "./assemble-card";

// How many of her most recent cards for this exact area to look back over.
// Comfortably covers the pool sizes in content/houses.ts and
// content/moon-sign-themes.ts (3-5 each), so a genuine repeat only happens
// once every variant in the pool has already been shown recently.
const LOOKBACK = 8;

// Keeps the query's own most-recent-first order (see the `.order` below) —
// pickIndexAvoiding only reads as many entries as it needs from the front,
// so the order these arrive in is what actually decides which ones count as
// "recent" once the pool is bigger than one field's history so far.
function toOrderedList(values: (number | null)[]): readonly number[] {
  return values.filter((v): v is number => typeof v === "number");
}

// `area` is a house number (1-12) on a full card, or the reduced-mode
// category ("moon_<key>", see content/moon-sign-themes.ts's themeCategory)
// on a reduced one — whichever one the card being made will itself be filed
// under, so only genuinely-repeatable history is read back.
export async function recentVariants(area: { house: number } | { category: string }): Promise<RecentVariants> {
  try {
    const base = supabase
      .from("daily_focus_cards")
      .select("reflection_variant, prompt_variant, belief_prompt_variant, next_step_prompt_variant");
    const filtered = "house" in area ? base.eq("active_house", area.house) : base.eq("focus_category", area.category);
    const { data, error } = await filtered.order("local_date", { ascending: false }).limit(LOOKBACK);
    if (error || !data) return NO_RECENT_VARIANTS;
    return {
      reflection: toOrderedList(data.map((row) => row.reflection_variant)),
      intentionPrompt: toOrderedList(data.map((row) => row.prompt_variant)),
      beliefPrompt: toOrderedList(data.map((row) => row.belief_prompt_variant)),
      nextStepPrompt: toOrderedList(data.map((row) => row.next_step_prompt_variant)),
    };
  } catch {
    return NO_RECENT_VARIANTS;
  }
}

// The same idea as recentVariants, but for the evening reflection's own flat
// pool (content/evening-reflection.ts) — not grouped by house or Moon sign,
// so this just looks at her last few cards regardless of area.
export async function recentEveningReflectionVariants(): Promise<readonly number[]> {
  try {
    const { data, error } = await supabase
      .from("daily_focus_cards")
      .select("evening_reflection_prompt_variant")
      .order("local_date", { ascending: false })
      .limit(LOOKBACK);
    if (error || !data) return [];
    return toOrderedList(data.map((row) => row.evening_reflection_prompt_variant));
  } catch {
    return [];
  }
}
