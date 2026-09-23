// Where each "going deeper" point's pattern actually shows up in her life —
// a genuine point-in-house sentence, not the house's own generic description
// reused under every point. 4 points × 12 houses = 48 pieces, only shown when
// a house is actually known (a full chart, not reduced mode).
//
// Each entry is two parts: a sentence explaining how the point's own pattern
// specifically plays out in that house's area of life, then a short
// reflection prompt — not a bare "reflect on X" with no context for why.

import type { HouseNumber } from "@/features/daily-focus";
import type { FullPointName } from "./full-chart";

export const POINT_IN_HOUSE: Record<FullPointName, Record<HouseNumber, string>> = {
  northnode: {
    1: "Your growth here is about showing up as fully yourself, not the version you think is expected of you. Reflect on what it looks like to lead with what you actually want, rather than what feels safe.",
    2: "Your growth here is about building your own sense of security, rather than looking outside yourself for it. Reflect on what would feel secure if you were the one who built it.",
    3: "Your growth here is about asking real questions instead of arriving with the answer already decided. Reflect on what changes in a conversation once you're genuinely curious.",
    4: "Your growth here is about letting yourself be cared for at home, not just being the one who does the caring. Reflect on what it would take to let someone look after you there.",
    5: "Your growth here is about creating or playing simply because it moves you, with no one else watching. Reflect on what you'd make if it never had to be shown to anyone.",
    6: "Your growth here is about building habits that actually serve who you're becoming, not just what's easiest to maintain. Reflect on what one honest routine change would do for you.",
    7: "Your growth here is about letting a partner in fully, rather than managing everything on your own. Reflect on what it would mean to actually need someone.",
    8: "Your growth here is about trusting someone enough to be truly vulnerable with them. Reflect on what it would take to let your guard down first, instead of waiting for proof.",
    9: "Your growth here is about following a conviction before you have full proof it's right. Reflect on what you'd pursue if you trusted your own instinct on it.",
    10: "Your growth here is about choosing a direction because it's genuinely yours, not because it looks right from the outside. Reflect on what you'd choose if no one else were watching your career.",
    11: "Your growth here is about thinking beyond your own path to the people and causes around you. Reflect on what shifts when you factor in who else is affected by your choices.",
    12: "Your growth here is about trusting what you sense before you can fully explain it. Reflect on what you already know, even without the proof to back it up yet.",
  },
  southnode: {
    1: "You default to leading here entirely on your own, even when that isn't actually necessary. Reflect on when going it alone truly serves you, and when it's simply the easier habit.",
    2: "You default to staying with what already feels financially familiar, even once it's stopped truly working for you. Reflect on what you're holding onto here purely out of comfort.",
    3: "You default to explaining rather than actually listening in conversation. Reflect on how often you're already forming your reply before someone's finished speaking.",
    4: "You default to taking care of everyone at home before you consider your own needs. Reflect on what you're avoiding by staying focused on everyone else.",
    5: "You default to performing or impressing rather than simply enjoying a creative or romantic moment. Reflect on how often you're doing something for how it looks, not how it feels.",
    6: "You default to fixing or managing details in your routine that were never actually broken. Reflect on what happens if you leave something alone for once.",
    7: "You default to smoothing things over in close relationships rather than saying what's actually true. Reflect on what you're not saying in order to keep the peace.",
    8: "You default to staying guarded in intimate or shared situations, even with people who've already earned your trust. Reflect on what it would cost you to let someone in a little sooner.",
    9: "You default to moving on to the next belief or plan before finishing the one you started. Reflect on what's been left unfinished by chasing what's next.",
    10: "You default to carrying your career or public responsibilities entirely by yourself. Reflect on what it would feel like to actually let the weight be shared.",
    11: "You default to keeping some real distance from your friends and communities, even the ones you're close to. Reflect on what you're protecting by staying a little apart.",
    12: "You default to absorbing whatever mood or energy is around you in quiet moments, rather than noticing your own. Reflect on where your own preference got left out.",
  },
  lilith: {
    1: "You may soften how confident you actually are before anyone can call you ‘too much’. Reflect on what you'd claim about yourself if you weren't managing how it lands.",
    2: "You may hold back from fully enjoying money or resources until you feel you've earned the right to. Reflect on what you'd allow yourself if you didn't have to justify it first.",
    3: "You may edit your real opinions down to whatever feels safest to say out loud. Reflect on what you'd actually say if you weren't managing how it's received.",
    4: "You may present as fine at home long before you actually feel it. Reflect on what it would take to let your family see you when you're genuinely not okay.",
    5: "You may downplay something you've made or want before anyone can dismiss it. Reflect on what you'd create or pursue if you weren't bracing for judgement.",
    6: "You may hide the parts of your daily life that don't look put-together. Reflect on what you're allowed to need, not just what's useful to keep doing.",
    7: "You may go along with what keeps a partnership easy, even at your own expense. Reflect on how you balance real commitment with still having room to be yourself.",
    8: "You may keep your real feelings at a manageable distance, even in your most intimate moments. Reflect on what it would mean to stop managing how much you let yourself feel.",
    9: "You may soften a genuine belief before someone else gets the chance to challenge it. Reflect on what you actually believe, without the disclaimer attached.",
    10: "You may minimise your own ambition so it seems like your career doesn't matter that much to you. Reflect on what you want to achieve without pretending otherwise.",
    11: "You may blend into a group rather than let your real differences show. Reflect on whether you're hiding what makes you different, or just keeping your distance.",
    12: "You may explain away what you feel privately as ‘too much’ before anyone else gets the chance to. Reflect on what it would mean to trust your own sensitivity instead.",
  },
  chiron: {
    1: "You may doubt your own confidence more easily than the moment actually calls for. Reflect on the self-assurance you've quietly built in spite of that doubt.",
    2: "You may feel less secure about money or resources than your actual situation reflects. Reflect on the stability you've built for yourself, even without it ever feeling fully guaranteed.",
    3: "You may worry that what you say comes out wrong more than most people would. Reflect on how much clearer you've actually become at saying exactly what you mean.",
    4: "You may feel unsure of your place at home, even somewhere you're genuinely wanted. Reflect on the sense of home you've learned to build for yourself, wherever you are.",
    5: "You may doubt whether what you create or feel is good enough to share. Reflect on what you've made anyway, in spite of that doubt.",
    6: "You may feel like what you do day to day never quite measures up. Reflect on how much you've actually gotten right, even on days it doesn't feel that way.",
    7: "You may feel disagreement in close relationships more sharply than the moment calls for. Reflect on the fairness you bring once you're actually in a hard conversation.",
    8: "You may expect betrayal in intimate situations a little before it's ever shown up. Reflect on the depth you're able to offer once real trust is there.",
    9: "You may worry that what you believe in won't actually hold up under scrutiny. Reflect on how often your instincts turn out to be right once you follow them.",
    10: "You may feel that what you've achieved in your career is never quite enough to count. Reflect on the respect you've genuinely earned, even on the days it doesn't feel that way.",
    11: "You may feel like an outsider even in communities built for people like you. Reflect on the belonging you've found or built on your own terms.",
    12: "You may feel like what you sense privately is hard to explain in a way others fully understand. Reflect on how often your intuition turns out to be exactly right.",
  },
};
