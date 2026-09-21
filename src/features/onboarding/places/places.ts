// Finding a birthplace. The birthplace screen only ever talks to this file.
//
// The places live in the worldmap table in Supabase (about 50,000 cities and
// towns), searched by the search_places database function, so a search costs
// nothing and needs no outside service or secret key.

import { supabase } from "@/lib/supabase/client";

export type Place = {
  id: string;
  city: string;
  // The state, county or province, when it helps tell places apart.
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  // The name of the place's time zone, e.g. "Europe/Vilnius". The chart also
  // needs the offset that applied on her birthday, which is worked out later
  // from this name.
  timezone: string;
};

// What search_places sends back for each place.
type PlaceRow = {
  id: string;
  city: string;
  region: string | null;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

// Lowercase and drop accents, so "Marijampolė" and "marijampole" compare equal.
function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// "Texas, United States". The region is left out when it only repeats the city,
// as some entries do ("Marijampolė, Marijampolė, Lithuania").
export function placeDetail(place: Place) {
  const region =
    place.region && fold(place.region) !== fold(place.city)
      ? place.region
      : undefined;
  return [region, place.country].filter(Boolean).join(", ");
}

// "Paris, Texas, United States"
export function formatPlace(place: Place) {
  return `${place.city}, ${placeDetail(place)}`;
}

// The best few matches for what she has typed. Throws if the search can't be
// reached, which the screen shows as "please try again".
export async function searchPlaces(query: string): Promise<Place[]> {
  const { data, error } = await supabase.rpc("search_places", { query });
  if (error) throw error;

  return ((data ?? []) as PlaceRow[]).map((row) => ({
    id: row.id,
    city: row.city,
    region: row.region ?? undefined,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    timezone: row.timezone,
  }));
}
