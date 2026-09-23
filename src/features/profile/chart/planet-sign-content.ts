// What it actually means for THIS planet to be in THIS sign — not a generic
// sign trait reused under every planet (the earlier version of this page did
// that, and it read as repetitive: the same sentence under Mercury, Venus and
// Mars whenever they shared a sign). 8 planets × 12 signs, each one genuinely
// about that planet's own territory — thinking, loving, asserting, growing —
// filtered through how that sign tends to run it.
//
// Sun, Moon and Rising aren't here: they keep their own bespoke copy from
// onboarding (reveal/placement-content.ts), reused as-is on the big-three
// section of this page — see full-chart-screen.tsx.
//
// Rules: two short sentences. "You" / "you tend to" / "you may", not "this
// person" or the planet's name. A gentle tension in the second sentence where
// it's honest to include one, not just strengths. No astrology jargon.

import type { Sign } from "@/features/onboarding";
import type { FullPlanetName } from "./full-chart";

export type SignedPlanet = Exclude<FullPlanetName, "sun" | "moon">;

// The short label under each placement's title, before the interpretation —
// what this planet is actually about, in plain words.
export const PLANET_THEME: Record<SignedPlanet, string> = {
  mercury: "Thinking & communication",
  venus: "Love & attraction",
  mars: "Drive & assertiveness",
  jupiter: "Growth & opportunity",
  saturn: "Responsibility & boundaries",
  uranus: "Freedom & change",
  neptune: "Imagination & ideals",
  pluto: "Power & transformation",
};

export const PLANET_IN_SIGN: Record<SignedPlanet, Record<Sign, string>> = {
  mercury: {
    Aries:
      "You tend to think and speak quickly, often saying what's on your mind before you've fully worked it out. Directness comes naturally, even if it means speaking before you're ready.",
    Taurus:
      "You think in a steady, practical way, and you're slow to change your mind once it's made up. Comfort with the familiar can also mean resisting an idea just because it's new.",
    Gemini:
      "Your mind moves fast between ideas, and talking things through is often how you figure out what you actually think. It can be hard to sit with one thought for very long.",
    Cancer:
      "You think with feeling as much as logic, and what you say is often shaped by what you sense in the room. Staying objective can be harder when something touches you personally.",
    Leo: "You communicate with warmth and confidence, and you like your ideas to be heard, not just noted. Being questioned can feel more personal than it's meant to.",
    Virgo:
      "You think carefully and notice details other people miss, often editing your words before you say them. That precision can tip into overthinking when the stakes feel high.",
    Libra:
      "You weigh both sides before speaking, and you're good at finding words that keep a conversation fair. Choosing a side can take you longer than it takes other people.",
    Scorpio:
      "You think in depth rather than on the surface, and you're drawn to what isn't being said out loud. You may keep your real opinion to yourself until you trust who's asking.",
    Sagittarius:
      "You think in big, sweeping ideas, and you'd rather talk about what's possible than what's already known. Details can lose your interest before the bigger picture does.",
    Capricorn:
      "You think in practical terms, usually with an eye on where an idea actually leads. That focus can make it hard to enjoy an idea that isn't going anywhere yet.",
    Aquarius:
      "You think independently, and you're drawn to ideas that go against the obvious answer. Explaining your reasoning to someone who hasn't followed the same logic can be frustrating.",
    Pisces:
      "You think in images and impressions more than straight lines, and your ideas often arrive before the words for them do. Pinning a feeling down into something precise can take real effort.",
  },
  venus: {
    Aries:
      "You're drawn to people who are direct and a little bold, and you'd rather pursue what you want than wait to be chosen. Patience isn't usually where your romantic instincts lead.",
    Taurus:
      "You love steadily and physically, and you're drawn to comfort, consistency and people who don't play games. Once you're attached, letting go can be genuinely hard.",
    Gemini:
      "You're drawn to people who keep you interested and talking, and wit matters to you as much as looks. Staying curious about one person for the long haul can take real effort.",
    Cancer:
      "You love by caring for people, and you're drawn to warmth, familiarity and a real sense of home. Being vulnerable enough to ask for that same care back doesn't always come easily.",
    Leo: "You love generously and openly, and you're drawn to people who make you feel genuinely admired. Feeling overlooked can hurt more than you tend to let on.",
    Virgo:
      "You show love through small, practical acts more than grand gestures, and you're drawn to people who show up reliably. It can be hard to believe you're loved until it's proven.",
    Libra:
      "You're drawn to balance, beauty and connection, and you naturally want the people around you to feel good too. Keeping the peace can matter more to you than saying what you actually want.",
    Scorpio:
      "You love intensely and privately, and you're drawn to people who feel real rather than easy. Trust has to be earned before you let someone see very much of you at all.",
    Sagittarius:
      "You're drawn to people who bring a sense of adventure and give you room to roam. Commitment can feel like it's asking you to choose between someone and your own freedom.",
    Capricorn:
      "You love in a committed, long-term way, and you're drawn to people who take things as seriously as you do. Showing the softer side of that commitment can take longer than showing the loyalty itself.",
    Aquarius:
      "You may be drawn to people who think differently and give you room to be yourself. Friendship and independence can be important parts of feeling close.",
    Pisces:
      "You love with real tenderness, and you're drawn to people you can dream and feel things deeply with. Idealising someone can make it hard to see them exactly as they are.",
  },
  mars: {
    Aries:
      "You act fast and go after what you want without waiting for permission. Patience isn't usually your strong suit when you already know what you're after.",
    Taurus:
      "You push forward slowly and steadily, and once you're moving, you're genuinely hard to stop. Getting started in the first place can take longer than the effort itself.",
    Gemini:
      "You get things done in short, energetic bursts, often on more than one thing at a time. Staying focused on a single effort long enough to finish it can be the harder part.",
    Cancer:
      "You act when something or someone you care about is at stake, and protecting matters more to you than winning. Anger can come out sideways if it isn't named directly.",
    Leo: "You act with confidence and want your effort to be seen, not just felt. Losing face can sting more than losing the actual thing you were going for.",
    Virgo:
      "You push forward by getting the details right, and you'd rather be effective than fast. Waiting for something to feel 'ready enough' can quietly become an excuse not to start.",
    Libra:
      "You're most motivated when there's someone to act alongside, and fairness matters to how you compete. Discomfort with conflict can mean not asserting yourself at all.",
    Scorpio:
      "You act with real intensity once you've decided something matters, and you don't let go easily. That same intensity can turn into holding a grudge longer than it's worth.",
    Sagittarius:
      "You're driven by the chase of something bigger, and you'd rather aim high and miss than play it safe. Follow-through can suffer once the initial excitement wears off.",
    Capricorn:
      "You push forward with discipline, playing a longer game than most people are willing to play. Rest can feel like falling behind, even when you've genuinely earned it.",
    Aquarius:
      "You act on principle, and you're willing to go against the group if that's what you believe is right. Compromise can feel like giving something up rather than meeting in the middle.",
    Pisces:
      "You act on instinct and feeling rather than a fixed plan, driven by what moves you emotionally. Direct confrontation isn't usually where your energy wants to go.",
  },
  jupiter: {
    Aries:
      "You grow by taking the leap before you feel fully ready, and confidence tends to follow the action rather than come before it. Overcommitting to too many starts at once is a real risk.",
    Taurus:
      "You grow steadily, trusting what you can build slowly more than what arrives all at once. Growth can be slower to show up, but it tends to be the kind that lasts.",
    Gemini:
      "You grow through learning and conversation, and new information genuinely excites you. Depth can lose out to breadth if you're not careful about where your curiosity goes.",
    Cancer:
      "You grow through what feels emotionally meaningful, often through family, home or close relationships. Opportunities that feel emotionally unsafe are easy to pass up, even good ones.",
    Leo: "You grow by being seen doing what you're genuinely good at, and confidence expands the more you're recognised. Ambition can be undercut by needing that recognition too often.",
    Virgo:
      "You grow by getting better at something specific, one useful improvement at a time. Big-picture opportunities can go unnoticed while you're focused on refining the details.",
    Libra:
      "You grow through your relationships and partnerships, and opportunity often arrives through other people. It can be easy to wait for the right partner before taking your own next step.",
    Scorpio:
      "You grow through what tests and transforms you, not through what's simply comfortable. Opportunities that feel too easy can be met with real suspicion.",
    Sagittarius:
      "You grow through exploration — new places, new beliefs, new ways of seeing things. Enthusiasm can outpace planning, so follow-through matters more than it feels like it should.",
    Capricorn:
      "You grow through sustained effort, trusting achievement earned slowly over the shortcut. Enjoying how far you've come can take a back seat to what's still ahead.",
    Aquarius:
      "You grow through ideas and causes bigger than yourself, drawn to opportunities that feel meaningfully different. Traditional paths can be dismissed a little too quickly.",
    Pisces:
      "You grow through imagination, compassion and what you can't fully explain yet. Turning a genuinely good instinct into a concrete next step is often the harder half.",
  },
  saturn: {
    Aries:
      "You take responsibility by learning patience the hard way, usually through trial and real error. Waiting for the right moment can feel like a discipline you're still building.",
    Taurus:
      "You take responsibility for building something stable and lasting, brick by brick. Letting go of control, even when it would genuinely help, doesn't come easily.",
    Gemini:
      "You take responsibility through what you know and how clearly you can explain it. Committing to one idea, one plan or one answer can feel more restrictive than it should.",
    Cancer:
      "You take responsibility for the people close to you, often before you take care of yourself. Asking for support in return can feel like admitting a weakness it isn't.",
    Leo: "You take responsibility by leading, holding yourself to a high standard when others are watching. Self-doubt can hide behind confidence that isn't always as solid as it looks.",
    Virgo:
      "You take responsibility by being genuinely useful and getting the details right. It can be hard to feel like enough has actually been done.",
    Libra:
      "You take responsibility for fairness, in your relationships and in how you treat people. Making a decision that might upset someone can be harder for you than for most.",
    Scorpio:
      "You take responsibility by facing what's hard rather than looking away from it. Trusting someone else to carry part of the weight can take real, deliberate effort.",
    Sagittarius:
      "You take responsibility for what you believe, holding your own convictions to a high standard. Following through on a big idea can be harder than believing in it.",
    Capricorn:
      "You take responsibility naturally, sometimes carrying more than anyone's actually asked of you. Letting yourself off the hook, even briefly, can feel unearned.",
    Aquarius:
      "You take responsibility for standing by what you believe, even when it isn't the popular position. Staying emotionally close while doing that can be the harder skill to build.",
    Pisces:
      "You take responsibility quietly, often absorbing more than you let on. Setting a boundary can feel unkind, even when it's genuinely necessary.",
  },
  uranus: {
    Aries:
      "You break from convention suddenly and on your own terms, often before anyone sees it coming. Consistency can be the first casualty of your need for something new.",
    Taurus:
      "You break from convention slowly, testing the ground before you actually leap. Change can feel unsettling even when part of you clearly wants it.",
    Gemini:
      "You break from convention through new ideas, and shaking up how something's usually explained comes naturally. Landing on one answer can feel less interesting than exploring all of them.",
    Cancer:
      "You break from convention around home and family, redefining what those words mean on your own terms. Needing both stability and freedom at once can feel like a real contradiction.",
    Leo: "You break from convention by being unapologetically yourself, even when it draws attention. Being told to tone it down can land as a real threat to who you are.",
    Virgo:
      "You break from convention by improving on the usual way of doing something. Perfecting the new method can quietly become its own kind of rigidity.",
    Libra:
      "You break from convention in your relationships, wanting connection that doesn't box you in. Needing both closeness and independence can leave a relationship feeling hard to define.",
    Scorpio:
      "You break from convention through radical honesty, saying what other people are only thinking. That same intensity can make real change feel more disruptive than it needs to.",
    Sagittarius:
      "You break from convention by questioning belief systems most people take for granted. Committing to any one answer can feel like it's closing a door too early.",
    Capricorn:
      "You break from convention while still working within existing structures, changing them from the inside. That tension between rebellion and responsibility can be hard to hold at once.",
    Aquarius:
      "You break from convention naturally, and you're genuinely energised by ideas that go against the grain. Fitting into a group whose rules you haven't chosen yourself can feel uncomfortable.",
    Pisces:
      "You break from convention through imagination, seeing past what's currently accepted as real. Grounding a big, unconventional idea into something workable is often the harder step.",
  },
  neptune: {
    Aries:
      "You dream in bold, immediate terms — what you imagine, you want to act on right away. The gap between the dream and its slower reality can be a hard one to sit with.",
    Taurus:
      "You dream through your senses, drawn to beauty you can actually touch, see or hold. It can be hard to tell whether you're settling for comfort or genuinely settling in.",
    Gemini:
      "You dream in ideas and stories, and imagination often arrives through words more than images. Fact and possibility can blur together before you notice the line has moved.",
    Cancer:
      "You dream about home, family and belonging, often idealising what safety should feel like. Reality rarely matches that picture exactly, and it can be disappointing when it doesn't.",
    Leo: "You dream in a personal, larger-than-life way, imagining yourself as the one living the story. It can be hard to separate the dream from the need to be seen living it.",
    Virgo:
      "You dream about being genuinely useful, and service can become something you idealise. Real limits, your own and other people's, can be harder to accept than the ideal itself.",
    Libra:
      "You dream of harmony and connection, sometimes idealising relationships before you've fully tested them. Disappointment can hit harder when the real thing doesn't match the picture.",
    Scorpio:
      "You dream in intensity, drawn to what feels mysterious or transformative. It can be hard to tell whether you're seeing someone clearly or seeing what you want to.",
    Sagittarius:
      "You dream about meaning on a large scale — belief, freedom, the bigger picture. It's easy to idealise a path before you've actually walked far enough down it.",
    Capricorn:
      "You dream while staying practical, holding your ideals to a real standard. It can be hard to let an idea stay unfinished, even while it's still forming.",
    Aquarius:
      "You dream about a better collective future, and your idealism tends to point outward, toward everyone. It can be easier to imagine changing the world than to sit with one person's ordinary need.",
    Pisces:
      "You dream easily and fully, moving between imagination and reality more fluidly than most people do. Knowing where the dream ends and the situation begins can take real, deliberate effort.",
  },
  pluto: {
    Aries:
      "You go through change abruptly, often through a decisive break rather than a slow shift. Power struggles can show up early and directly in whatever you're going through.",
    Taurus:
      "You go through change slowly and reluctantly, holding on until holding on stops being possible. What eventually shifts tends to shift permanently.",
    Gemini:
      "You go through change by completely rethinking how you understand something. Old ideas can be hard to let go of, even once you've clearly outgrown them.",
    Cancer:
      "You go through change around home, family or what makes you feel safe. Old emotional patterns can resurface long after you thought they were behind you.",
    Leo: "You go through change around identity — who you are versus who you're expected to be. Letting go of control over how you're seen can be a genuine struggle.",
    Virgo:
      "You go through change by breaking something down and rebuilding it, piece by piece. Perfectionism can intensify right when you're already under the most pressure.",
    Libra:
      "You go through change within your relationships, often through power imbalances that eventually have to be faced. Avoiding conflict can only postpone that reckoning, not prevent it.",
    Scorpio:
      "You go through change intensely and completely — transformation is simply how you're built. Very little about you stays the same for very long.",
    Sagittarius:
      "You go through change in your beliefs, and a conviction you once held completely can be replaced by its opposite. Losing an old belief can feel like losing part of your identity.",
    Capricorn:
      "You go through change in how you relate to authority and structure, sometimes by having to rebuild both from the ground up. Letting go of control during that rebuild is rarely comfortable.",
    Aquarius:
      "You go through change in how you relate to groups and causes, sometimes becoming the person who breaks from what everyone else assumed was fixed. Isolation can be the price of that conviction.",
    Pisces:
      "You go through change on a spiritual or emotional level, often through periods of real surrender. Boundaries can dissolve at exactly the moments you need them most.",
  },
};
