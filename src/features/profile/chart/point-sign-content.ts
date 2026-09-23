// Her actual, calculated placement for each "going deeper" point — genuinely
// matched to its real sign, not a generic point description. 4 points × 12
// signs = 48 fixed, reviewed-once interpretations (see full-chart-screen.tsx's
// note on why these are prewritten rather than generated per visit).
//
// Each entry is three distinct pieces, not one paragraph:
//   title       a specific, concrete name for the pattern ("Learning to
//               receive care."), shown even while the row is collapsed.
//   pattern     something she might recognise in herself, in "you may" terms.
//   reflection  a short prompt to notice, not a promise or a fix.
//
// Rules, as everywhere else in this feature: gentle language ("you may",
// "notice"), no absolute claims, no assumption of trauma or a fixed destiny —
// especially for Chiron (sensitivity she's learned to work with, not a wound)
// and the nodes (a direction to grow toward / lean on, not a verdict).

import type { Sign } from "@/features/onboarding";
import type { FullPointName } from "./full-chart";

export type PointSignEntry = { title: string; pattern: string; reflection: string };

export const POINT_IN_SIGN: Record<FullPointName, Record<Sign, PointSignEntry>> = {
  northnode: {
    Aries: {
      title: "Learning to act for yourself.",
      pattern: "You may be used to considering everyone else's needs before your own.",
      reflection: "Notice what you actually want, before you ask what's fair to everyone else.",
    },
    Taurus: {
      title: "Learning to slow down and trust what lasts.",
      pattern: "You may be used to chasing the next exciting thing instead of building something steady.",
      reflection: "Notice what happens when you let a good thing stay simple.",
    },
    Gemini: {
      title: "Learning to stay curious rather than certain.",
      pattern: "You may be used to having the answer before you've really heard the question.",
      reflection: "Notice what you learn when you ask instead of tell.",
    },
    Cancer: {
      title: "Learning to let yourself be taken care of.",
      pattern: "You may be more comfortable being dependable than asking for support.",
      reflection: "Notice whether you feel you have to earn care.",
    },
    Leo: {
      title: "Learning to take up space on purpose.",
      pattern: "You may be used to stepping back so the moment isn't about you.",
      reflection: "Notice what changes when you let yourself be seen without shrinking first.",
    },
    Virgo: {
      title: "Learning that useful doesn't have to mean perfect.",
      pattern: "You may be used to trusting a bigger vision more than the practical next step.",
      reflection: "Notice what gets done once you stop waiting to know everything.",
    },
    Libra: {
      title: "Learning to let someone else in.",
      pattern: "You may be used to relying mostly on yourself, even when support is offered.",
      reflection: "Notice what it costs you to always go it alone.",
    },
    Scorpio: {
      title: "Learning to go past the surface.",
      pattern: "You may be used to keeping things light rather than sitting with what's real.",
      reflection: "Notice what you avoid feeling by staying easy-going.",
    },
    Sagittarius: {
      title: "Learning to trust your own belief.",
      pattern: "You may be used to sticking to what's familiar rather than reaching for what's possible.",
      reflection: "Notice what you'd try if you weren't worried about getting it wrong.",
    },
    Capricorn: {
      title: "Learning to follow through on your own terms.",
      pattern: "You may be used to keeping your options open rather than committing to one direction.",
      reflection: "Notice what becomes possible once you actually choose.",
    },
    Aquarius: {
      title: "Learning to think beyond yourself.",
      pattern: "You may be used to focusing on your own path rather than the wider picture.",
      reflection: "Notice what shifts when you consider who else is affected.",
    },
    Pisces: {
      title: "Learning to trust what you can't fully explain.",
      pattern: "You may be used to needing proof before you let yourself believe something.",
      reflection: "Notice what your instincts already know before the evidence catches up.",
    },
  },
  southnode: {
    Aries: {
      title: "The instinct to go first.",
      pattern: "You may default to acting quickly and independently, even when it isn't asked of you.",
      reflection: "Notice when going first is genuinely useful, and when it's just habit.",
    },
    Taurus: {
      title: "The pull toward what's comfortable.",
      pattern: "You may default to staying with what's familiar, even once it's stopped serving you.",
      reflection: "Notice what you're keeping simply because it's easy.",
    },
    Gemini: {
      title: "The habit of already knowing.",
      pattern: "You may default to having an answer ready, even before you've fully considered the question.",
      reflection: "Notice when you're explaining instead of actually listening.",
    },
    Cancer: {
      title: "The instinct to look after everyone else first.",
      pattern: "You may default to caretaking, even when no one's asked you to.",
      reflection: "Notice what you're avoiding by staying focused on someone else's needs.",
    },
    Leo: {
      title: "The pull to perform rather than just be.",
      pattern: "You may default to making sure you're noticed, even in moments that don't call for it.",
      reflection: "Notice what it feels like to do something just for you, with no audience.",
    },
    Virgo: {
      title: "The habit of fixing what isn't broken.",
      pattern: "You may default to improving or managing the details, even when nothing's actually wrong.",
      reflection: "Notice what happens when you leave something alone.",
    },
    Libra: {
      title: "The pull to keep the peace.",
      pattern: "You may default to agreeing or smoothing things over, even when you don't actually agree.",
      reflection: "Notice what you're not saying in order to avoid friction.",
    },
    Scorpio: {
      title: "The instinct to hold back.",
      pattern: "You may default to staying guarded, even with people who've already earned your trust.",
      reflection: "Notice what it would cost you to let someone in a little sooner.",
    },
    Sagittarius: {
      title: "The pull toward the next thing.",
      pattern: "You may default to reaching for something new, even before you've finished the last thing.",
      reflection: "Notice what you leave unfinished by moving on too soon.",
    },
    Capricorn: {
      title: "The habit of carrying it alone.",
      pattern: "You may default to taking full responsibility, even when help is genuinely available.",
      reflection: "Notice what it would feel like to let the weight be shared.",
    },
    Aquarius: {
      title: "The pull to stay separate.",
      pattern: "You may default to keeping some distance, even from people you're close to.",
      reflection: "Notice what you protect by staying a little apart.",
    },
    Pisces: {
      title: "The instinct to disappear into something bigger.",
      pattern: "You may default to going along with the mood or the moment, even when it isn't really you.",
      reflection: "Notice where your own preference got left out.",
    },
  },
  lilith: {
    Aries: {
      title: "Anger you've learned to soften.",
      pattern: "You may have learned to cool your temper down before anyone else has to deal with it.",
      reflection: "Notice what you're allowed to want, without needing to justify it first.",
    },
    Taurus: {
      title: "Pleasure you've learned to earn.",
      pattern: "You may hold back from enjoying something fully until you feel you've done enough to deserve it.",
      reflection: "Notice what changes if you let yourself simply enjoy it.",
    },
    Gemini: {
      title: "Opinions you've learned to keep quiet.",
      pattern: "You may edit your real thoughts down to whatever feels safest to say out loud.",
      reflection: "Notice what you'd say if you weren't managing how it lands.",
    },
    Cancer: {
      title: "Need you've learned to hide.",
      pattern: "You may present as fine long before you actually feel it.",
      reflection: "Notice what it would take to let someone see you when you're not okay.",
    },
    Leo: {
      title: "Confidence you've learned to shrink.",
      pattern: "You may downplay what you're proud of before anyone can accuse you of being too much.",
      reflection: "Notice what you'd claim if you weren't worried about taking up too much room.",
    },
    Virgo: {
      title: "Imperfection you've learned to hide.",
      pattern: "You may hold back from showing something until it feels finished or good enough.",
      reflection: "Notice what's true about you that has nothing to do with being useful.",
    },
    Libra: {
      title: "Disagreement you've learned to avoid.",
      pattern: "You may go along with what keeps things smooth, even at your own expense.",
      reflection: "Notice what you actually want, separate from what keeps the peace.",
    },
    Scorpio: {
      title: "Intensity you've learned to mute.",
      pattern: "You may keep your real feelings at a manageable distance, even from yourself.",
      reflection: "Notice what you're not letting yourself fully feel.",
    },
    Sagittarius: {
      title: "Belief you've learned to water down.",
      pattern: "You may soften a strong opinion before someone else can push back on it.",
      reflection: "Notice what you actually believe, without the disclaimer.",
    },
    Capricorn: {
      title: "Ambition you've learned to downplay.",
      pattern: "You may minimise what you're working toward so it seems less like it matters to you.",
      reflection: "Notice what you want to achieve, without pretending you don't care.",
    },
    Aquarius: {
      title: "Difference you've learned to blend in.",
      pattern: "You may want to feel part of a group while resisting the pressure to fit in.",
      reflection: "Notice whether you hide your differences or keep your distance when you want connection.",
    },
    Pisces: {
      title: "Sensitivity you've learned to explain away.",
      pattern: "You may brush off what you feel as 'too much' before anyone else can call it that.",
      reflection: "Notice what it would mean to trust your own sensitivity instead.",
    },
  },
  chiron: {
    Aries: {
      title: "Sensitivity around confidence.",
      pattern: "You may be quick to doubt yourself in moments that call for quick, decisive action.",
      reflection: "Notice how you've learned to act anyway, even when the doubt is loud.",
    },
    Taurus: {
      title: "Sensitivity around security.",
      pattern: "You may feel unsettled more easily than others when things around you change.",
      reflection: "Notice the steadiness you've built for yourself, even without perfect stability.",
    },
    Gemini: {
      title: "Sensitivity around being understood.",
      pattern: "You may worry that what you say comes out wrong, more than most people would.",
      reflection: "Notice how much clearer you've gotten at saying exactly what you mean.",
    },
    Cancer: {
      title: "Sensitivity around belonging.",
      pattern: "You may feel unsure of your place, even somewhere you're genuinely wanted.",
      reflection: "Notice the home you've learned to build for yourself, wherever you are.",
    },
    Leo: {
      title: "Sensitivity around being seen.",
      pattern: "You may feel overlooked more easily than the moment actually calls for.",
      reflection: "Notice the confidence you've built in spite of that, not because it was ever proven wrong.",
    },
    Virgo: {
      title: "Sensitivity around being enough.",
      pattern: "You may hold yourself to a standard that's harder to reach than what you'd ask of anyone else.",
      reflection: "Notice how much you've already gotten right, even without it feeling that way.",
    },
    Libra: {
      title: "Sensitivity around conflict.",
      pattern: "You may feel disagreement more sharply than the moment actually calls for.",
      reflection: "Notice the fairness you bring to hard conversations, once you're actually in them.",
    },
    Scorpio: {
      title: "Sensitivity around trust.",
      pattern: "You may expect betrayal a little before it's ever actually shown up.",
      reflection: "Notice the depth you're able to offer once trust is real.",
    },
    Sagittarius: {
      title: "Sensitivity around meaning.",
      pattern: "You may worry that what you believe in won't actually hold up.",
      reflection: "Notice how often your instincts turn out to be right, once you follow them.",
    },
    Capricorn: {
      title: "Sensitivity around achievement.",
      pattern: "You may feel that what you've done is never quite enough to count.",
      reflection: "Notice the respect you've earned, even on the days it doesn't feel that way.",
    },
    Aquarius: {
      title: "Sensitivity around fitting in.",
      pattern: "You may feel like the outsider even in spaces built for people like you.",
      reflection: "Notice the community you've found, or built, on your own terms.",
    },
    Pisces: {
      title: "Sensitivity around being misunderstood.",
      pattern: "You may feel like what you sense is hard to explain in a way others fully get.",
      reflection: "Notice how often your intuition turns out to be exactly right.",
    },
  },
};
