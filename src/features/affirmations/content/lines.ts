// Every affirmation line, kept in the app itself (founder, 2026-09-29) — the
// same for everyone, so there's nothing to fetch: the picker works offline
// and at once. Only her own days (which line, how far she got) are saved in
// the database, by id.
//
// Five of each kind per house — theme, goal, belief — so they don't become
// repetitive; which three she's offered each day is daily-lines.ts's job.
// House 0 is the general set, for someone with no house at all.
//
// Ids never change, so a day she has already practised always points at the
// same words: the original line of each kind is house * 10 + 1/2/3, the rest
// 1000 + house * 100 + kind * 10 + variant (theme 1, goal 2, belief 3).
// Polishing a line's wording is fine; never reuse or renumber an id.
//
// Rules: first person, present tense, about ten words (she says it 18 times
// a day), warm and direct, no astrology words.

import type { Affirmation } from "../affirmations-api";

export const AFFIRMATION_LINES: readonly Affirmation[] = [
  // 0 · general (no house)
  { id: 1, house: 0, type: "theme", text: "I am aligned with the life I want." },
  { id: 1012, house: 0, type: "theme", text: "I am becoming the woman I imagine." },
  { id: 1013, house: 0, type: "theme", text: "My energy is focused and clear today." },
  { id: 1014, house: 0, type: "theme", text: "I move through today with ease and intention." },
  { id: 1015, house: 0, type: "theme", text: "I live in alignment with what I want." },
  { id: 2, house: 0, type: "goal", text: "I take one clear step toward my goals today." },
  { id: 1022, house: 0, type: "goal", text: "I finish what I start today." },
  { id: 1023, house: 0, type: "goal", text: "I give my best energy to what matters most." },
  { id: 1024, house: 0, type: "goal", text: "I make one bold move toward my dream." },
  { id: 1025, house: 0, type: "goal", text: "I choose progress over perfection today." },
  { id: 3, house: 0, type: "belief", text: "Everything I need is coming to me." },
  { id: 1032, house: 0, type: "belief", text: "I am ready to receive more." },
  { id: 1033, house: 0, type: "belief", text: "Good things find me easily." },
  { id: 1034, house: 0, type: "belief", text: "I trust myself to handle whatever comes." },
  { id: 1035, house: 0, type: "belief", text: "My dreams are already on their way." },

  // 1 · self
  { id: 11, house: 1, type: "theme", text: "I trust who I am becoming." },
  { id: 1112, house: 1, type: "theme", text: "I love who I am becoming." },
  { id: 1113, house: 1, type: "theme", text: "I lead my life with confidence." },
  { id: 1114, house: 1, type: "theme", text: "I show up as my full self today." },
  { id: 1115, house: 1, type: "theme", text: "My presence is magnetic and calm." },
  { id: 12, house: 1, type: "goal", text: "I show up fully for my goals today." },
  { id: 1122, house: 1, type: "goal", text: "I choose myself first today." },
  { id: 1123, house: 1, type: "goal", text: "I act like the woman I want to be." },
  { id: 1124, house: 1, type: "goal", text: "I take up space and speak up." },
  { id: 1125, house: 1, type: "goal", text: "I keep the promises I make to myself." },
  { id: 13, house: 1, type: "belief", text: "I am enough exactly as I am." },
  { id: 1132, house: 1, type: "belief", text: "I am worthy of everything I want." },
  { id: 1133, house: 1, type: "belief", text: "My confidence grows every single day." },
  { id: 1134, house: 1, type: "belief", text: "I am allowed to change and begin again." },
  { id: 1135, house: 1, type: "belief", text: "Being me is my greatest strength." },

  // 2 · money
  { id: 21, house: 2, type: "theme", text: "I earn well and I spend with intention." },
  { id: 1212, house: 2, type: "theme", text: "Money flows to me with ease." },
  { id: 1213, house: 2, type: "theme", text: "I am a magnet for abundance." },
  { id: 1214, house: 2, type: "theme", text: "I value my time, my work and myself." },
  { id: 1215, house: 2, type: "theme", text: "My wealth grows while I rest." },
  { id: 22, house: 2, type: "goal", text: "I am growing my income with ease." },
  { id: 1222, house: 2, type: "goal", text: "I ask for what I am worth." },
  { id: 1223, house: 2, type: "goal", text: "I make one smart money choice today." },
  { id: 1224, house: 2, type: "goal", text: "I save with joy and spend with purpose." },
  { id: 1225, house: 2, type: "goal", text: "I am creating new streams of income." },
  { id: 23, house: 2, type: "belief", text: "I am worthy of wealth and rest." },
  { id: 1232, house: 2, type: "belief", text: "I deserve to be paid well." },
  { id: 1233, house: 2, type: "belief", text: "Abundance is my natural state." },
  { id: 1234, house: 2, type: "belief", text: "There is always more than enough for me." },
  { id: 1235, house: 2, type: "belief", text: "I am safe with money, and money is safe with me." },

  // 3 · mind
  { id: 31, house: 3, type: "theme", text: "I speak clearly and I am heard." },
  { id: 1312, house: 3, type: "theme", text: "My words are clear, kind and confident." },
  { id: 1313, house: 3, type: "theme", text: "My mind is sharp and curious today." },
  { id: 1314, house: 3, type: "theme", text: "I say what I mean with ease." },
  { id: 1315, house: 3, type: "theme", text: "I express myself with confidence." },
  { id: 32, house: 3, type: "goal", text: "I learn quickly and share what I know." },
  { id: 1322, house: 3, type: "goal", text: "I write, share and speak my truth." },
  { id: 1323, house: 3, type: "goal", text: "I learn something new today." },
  { id: 1324, house: 3, type: "goal", text: "I reach out and start the conversation." },
  { id: 1325, house: 3, type: "goal", text: "I focus on one thing at a time." },
  { id: 33, house: 3, type: "belief", text: "My ideas are valuable and worth sharing." },
  { id: 1332, house: 3, type: "belief", text: "My voice deserves to be heard." },
  { id: 1333, house: 3, type: "belief", text: "I am smart and I learn with ease." },
  { id: 1334, house: 3, type: "belief", text: "The right words always come to me." },
  { id: 1335, house: 3, type: "belief", text: "What I have to say matters." },

  // 4 · home
  { id: 41, house: 4, type: "theme", text: "My home is calm and full of love." },
  { id: 1412, house: 4, type: "theme", text: "My home holds me with warmth." },
  { id: 1413, house: 4, type: "theme", text: "I am safe and at peace where I am." },
  { id: 1414, house: 4, type: "theme", text: "My space reflects the life I want." },
  { id: 1415, house: 4, type: "theme", text: "I nourish my roots and my family." },
  { id: 42, house: 4, type: "goal", text: "I am creating a home I love returning to." },
  { id: 1422, house: 4, type: "goal", text: "I make my space feel like me." },
  { id: 1423, house: 4, type: "goal", text: "I create calm wherever I go." },
  { id: 1424, house: 4, type: "goal", text: "I care for the people who feel like home." },
  { id: 1425, house: 4, type: "goal", text: "I clear space for peace today." },
  { id: 43, house: 4, type: "belief", text: "I am safe, rooted and supported." },
  { id: 1432, house: 4, type: "belief", text: "I belong exactly where I am." },
  { id: 1433, house: 4, type: "belief", text: "I am held, supported and loved." },
  { id: 1434, house: 4, type: "belief", text: "I deserve a soft place to land." },
  { id: 1435, house: 4, type: "belief", text: "Peace is always available to me." },

  // 5 · creativity
  { id: 51, house: 5, type: "theme", text: "I create freely and enjoy the process." },
  { id: 1512, house: 5, type: "theme", text: "I let joy lead me today." },
  { id: 1513, house: 5, type: "theme", text: "My creativity flows freely." },
  { id: 1514, house: 5, type: "theme", text: "I play, create and shine." },
  { id: 1515, house: 5, type: "theme", text: "My life feels light and full of fun." },
  { id: 52, house: 5, type: "goal", text: "I make time for what lights me up." },
  { id: 1522, house: 5, type: "goal", text: "I make something just because I love it." },
  { id: 1523, house: 5, type: "goal", text: "I follow what excites me today." },
  { id: 1524, house: 5, type: "goal", text: "I share my work with the world." },
  { id: 1525, house: 5, type: "goal", text: "I say yes to pleasure and play." },
  { id: 53, house: 5, type: "belief", text: "Joy is my natural state." },
  { id: 1532, house: 5, type: "belief", text: "My creativity is a gift." },
  { id: 1533, house: 5, type: "belief", text: "I am allowed to have fun." },
  { id: 1534, house: 5, type: "belief", text: "I shine without holding back." },
  { id: 1535, house: 5, type: "belief", text: "Joy is a worthy use of my time." },

  // 6 · routine
  { id: 61, house: 6, type: "theme", text: "My daily habits support the life I want." },
  { id: 1612, house: 6, type: "theme", text: "My routines make me feel strong." },
  { id: 1613, house: 6, type: "theme", text: "I care for my body with love." },
  { id: 1614, house: 6, type: "theme", text: "My days are calm and well organised." },
  { id: 1615, house: 6, type: "theme", text: "Small habits are building my dream life." },
  { id: 62, house: 6, type: "goal", text: "I care for my body and keep my promises." },
  { id: 1622, house: 6, type: "goal", text: "I move my body with joy today." },
  { id: 1623, house: 6, type: "goal", text: "I finish my most important task first." },
  { id: 1624, house: 6, type: "goal", text: "I rest when I need to." },
  { id: 1625, house: 6, type: "goal", text: "I keep today simple and focused." },
  { id: 63, house: 6, type: "belief", text: "Small steps every day change my life." },
  { id: 1632, house: 6, type: "belief", text: "Consistency comes easily to me." },
  { id: 1633, house: 6, type: "belief", text: "My body is my home, and I honour it." },
  { id: 1634, house: 6, type: "belief", text: "I am disciplined and kind to myself." },
  { id: 1635, house: 6, type: "belief", text: "Every small effort counts." },

  // 7 · relationships
  { id: 71, house: 7, type: "theme", text: "I attract steady, kind relationships." },
  { id: 1712, house: 7, type: "theme", text: "I am surrounded by loving connections." },
  { id: 1713, house: 7, type: "theme", text: "My relationships are honest and warm." },
  { id: 1714, house: 7, type: "theme", text: "Love comes to me easily." },
  { id: 1715, house: 7, type: "theme", text: "I attract people who match my energy." },
  { id: 72, house: 7, type: "goal", text: "I give and receive love with ease." },
  { id: 1722, house: 7, type: "goal", text: "I speak my needs with love." },
  { id: 1723, house: 7, type: "goal", text: "I show up fully for the people I love." },
  { id: 1724, house: 7, type: "goal", text: "I open my heart a little more today." },
  { id: 1725, house: 7, type: "goal", text: "I set boundaries with kindness." },
  { id: 73, house: 7, type: "belief", text: "I deserve people who choose me fully." },
  { id: 1732, house: 7, type: "belief", text: "I am deeply loveable." },
  { id: 1733, house: 7, type: "belief", text: "The right people stay." },
  { id: 1734, house: 7, type: "belief", text: "I am worthy of a love that feels safe." },
  { id: 1735, house: 7, type: "belief", text: "Healthy love is my normal." },

  // 8 · transformation
  { id: 81, house: 8, type: "theme", text: "I let go of what no longer fits." },
  { id: 1812, house: 8, type: "theme", text: "I am becoming who I am meant to be." },
  { id: 1813, house: 8, type: "theme", text: "I release the past with grace." },
  { id: 1814, house: 8, type: "theme", text: "My power grows as I let go." },
  { id: 1815, house: 8, type: "theme", text: "Change is working in my favour." },
  { id: 82, house: 8, type: "goal", text: "I grow stronger through every change." },
  { id: 1822, house: 8, type: "goal", text: "I release one old habit today." },
  { id: 1823, house: 8, type: "goal", text: "I face what I have been avoiding." },
  { id: 1824, house: 8, type: "goal", text: "I make room for something new." },
  { id: 1825, house: 8, type: "goal", text: "I choose growth over comfort today." },
  { id: 83, house: 8, type: "belief", text: "I am safe to grow and change." },
  { id: 1832, house: 8, type: "belief", text: "Endings make space for better things." },
  { id: 1833, house: 8, type: "belief", text: "I am stronger than I know." },
  { id: 1834, house: 8, type: "belief", text: "I am allowed to outgrow old versions of me." },
  { id: 1835, house: 8, type: "belief", text: "Every change brings me closer to myself." },

  // 9 · growth
  { id: 91, house: 9, type: "theme", text: "My world is expanding in beautiful ways." },
  { id: 1912, house: 9, type: "theme", text: "My life is full of adventure." },
  { id: 1913, house: 9, type: "theme", text: "I see the bigger picture clearly." },
  { id: 1914, house: 9, type: "theme", text: "I am open to new horizons." },
  { id: 1915, house: 9, type: "theme", text: "Life is teaching me beautiful things." },
  { id: 92, house: 9, type: "goal", text: "I say yes to new places and ideas." },
  { id: 1922, house: 9, type: "goal", text: "I try something new today." },
  { id: 1923, house: 9, type: "goal", text: "I learn from every experience." },
  { id: 1924, house: 9, type: "goal", text: "I plan my next adventure." },
  { id: 1925, house: 9, type: "goal", text: "I stretch beyond my comfort zone." },
  { id: 93, house: 9, type: "belief", text: "Every experience is guiding me forward." },
  { id: 1932, house: 9, type: "belief", text: "The world is full of opportunities for me." },
  { id: 1933, house: 9, type: "belief", text: "My horizons are always expanding." },
  { id: 1934, house: 9, type: "belief", text: "I trust the journey I am on." },
  { id: 1935, house: 9, type: "belief", text: "There is so much more waiting for me." },

  // 10 · career
  { id: 101, house: 10, type: "theme", text: "I am building work I am proud of." },
  { id: 2012, house: 10, type: "theme", text: "My work makes a real difference." },
  { id: 2013, house: 10, type: "theme", text: "I am recognised for what I create." },
  { id: 2014, house: 10, type: "theme", text: "My career is growing in the right direction." },
  { id: 2015, house: 10, type: "theme", text: "I lead with confidence and grace." },
  { id: 102, house: 10, type: "goal", text: "I move steadily toward my biggest goals." },
  { id: 2022, house: 10, type: "goal", text: "I take one clear step toward my ambition." },
  { id: 2023, house: 10, type: "goal", text: "I show my work with pride today." },
  { id: 2024, house: 10, type: "goal", text: "I focus on the work that moves me forward." },
  { id: 2025, house: 10, type: "goal", text: "I claim the opportunities meant for me." },
  { id: 103, house: 10, type: "belief", text: "I am capable of great success." },
  { id: 2032, house: 10, type: "belief", text: "Success comes naturally to me." },
  { id: 2033, house: 10, type: "belief", text: "I deserve to be seen and rewarded." },
  { id: 2034, house: 10, type: "belief", text: "I am the right woman for the job." },
  { id: 2035, house: 10, type: "belief", text: "My ambition is welcome and good." },

  // 11 · future
  { id: 111, house: 11, type: "theme", text: "I am surrounded by people who lift me." },
  { id: 2112, house: 11, type: "theme", text: "My dreams are coming to life." },
  { id: 2113, house: 11, type: "theme", text: "I am part of something bigger." },
  { id: 2114, house: 11, type: "theme", text: "My people are finding their way to me." },
  { id: 2115, house: 11, type: "theme", text: "My future is bright and full of possibility." },
  { id: 112, house: 11, type: "goal", text: "I am creating the future I dream of." },
  { id: 2122, house: 11, type: "goal", text: "I reach out to someone who inspires me." },
  { id: 2123, house: 11, type: "goal", text: "I take one step toward my vision today." },
  { id: 2124, house: 11, type: "goal", text: "I show up for my community." },
  { id: 2125, house: 11, type: "goal", text: "I dream bigger than I did yesterday." },
  { id: 113, house: 11, type: "belief", text: "I belong, and my people find me." },
  { id: 2132, house: 11, type: "belief", text: "My vision is worth building." },
  { id: 2133, house: 11, type: "belief", text: "I am connected to the right people." },
  { id: 2134, house: 11, type: "belief", text: "The future I want is already forming." },
  { id: 2135, house: 11, type: "belief", text: "I belong in rooms that lift me higher." },

  // 12 · inner world
  { id: 121, house: 12, type: "theme", text: "I rest deeply and trust the timing." },
  { id: 2212, house: 12, type: "theme", text: "I trust what I feel." },
  { id: 2213, house: 12, type: "theme", text: "Peace lives within me." },
  { id: 2214, house: 12, type: "theme", text: "I rest and let life unfold." },
  { id: 2215, house: 12, type: "theme", text: "My inner world is soft and safe." },
  { id: 122, house: 12, type: "goal", text: "I make quiet space to hear myself." },
  { id: 2222, house: 12, type: "goal", text: "I slow down and listen within." },
  { id: 2223, house: 12, type: "goal", text: "I give myself time to rest today." },
  { id: 2224, house: 12, type: "goal", text: "I let go of what I cannot control." },
  { id: 2225, house: 12, type: "goal", text: "I honour my intuition today." },
  { id: 123, house: 12, type: "belief", text: "I am guided, even when I cannot see." },
  { id: 2232, house: 12, type: "belief", text: "My intuition always guides me well." },
  { id: 2233, house: 12, type: "belief", text: "It is safe to slow down." },
  { id: 2234, house: 12, type: "belief", text: "Everything is unfolding in perfect time." },
  { id: 2235, house: 12, type: "belief", text: "I am held by something greater." },
];

const BY_ID = new Map(AFFIRMATION_LINES.map((line) => [line.id, line]));

// The words for a saved day's line, or null for an id the app doesn't know.
export function lineById(id: number): Affirmation | null {
  return BY_ID.get(id) ?? null;
}

// Every line for a house (five of each kind), theme first, then goal, then belief.
export function linesForHouse(house: number): Affirmation[] {
  return AFFIRMATION_LINES.filter((line) => line.house === house);
}
