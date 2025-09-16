export interface LoLQueue {
  queueId: number;
  map: string;
  description: string | null;
  notes: string | null;
}

export type LoLQueueKeyType =
  | "custom_games"
  | "_blind_pick_old"
  | "_ranked_solo_old"
  | "_ranked_premade"
  | "_coop_vs_ai_old"
  | "_3v3_normal_old"
  | "_3v3_ranked_flex_old"
  | "_draft_pick_old"
  | "_dominion_blind_pick"
  | "_dominion_draft_pick"
  | "_dominion_coop_vs_ai"
  | "_coop_vs_ai_intro_old"
  | "_coop_vs_ai_beginner_old"
  | "_coop_vs_ai_intermediate_old"
  | "_3v3_ranked_team"
  | "_5v5_ranked_team"
  | "_3v3_coop_vs_ai_old"
  | "_team_builder"
  | "_aram_old"
  | "_aram_coop_vs_ai"
  | "_one_for_all_old"
  | "snowdown_1v1"
  | "snowdown_2v2"
  | "hexakill_sr"
  | "urf"
  | "one_for_all_mirror"
  | "coop_vs_ai_urf"
  | "_doom_bots_rank_1"
  | "_doom_bots_rank_2"
  | "_doom_bots_rank_5"
  | "_ascension_old"
  | "hexakill_tt"
  | "aram_butchers_bridge"
  | "_poro_king_old"
  | "nemesis"
  | "black_market_brawlers"
  | "_nexus_siege_old"
  | "definitely_not_dominion"
  | "_arurf_old"
  | "all_random"
  | "draft_pick"
  | "_ranked_dynamic"
  | "RANKED_SOLO_5x5"
  | "blind_pick"
  | "RANKED_FLEX_SR"
  | "aram"
  | "_3v3_blind_pick"
  | "_3v3_ranked_flex"
  | "blood_hunt_assassin"
  | "dark_star_singularity"
  | "clash_sr"
  | "clash_aram"
  | "_3v3_coop_vs_ai_intermediate"
  | "_3v3_coop_vs_ai_intro"
  | "3v3_coop_vs_ai_beginner"
  | "coop_vs_ai_intro"
  | "coop_vs_ai_beginner"
  | "coop_vs_ai_intermediate"
  | "arurf"
  | "ascension"
  | "poro_king"
  | "nexus_siege"
  | "doom_bots_voting"
  | "doom_bots_standard"
  | "star_guardian_normal"
  | "star_guardian_onslaught"
  | "project_hunters"
  | "snow_arurf"
  | "one_for_all"
  | "odyssey_intro"
  | "odyssey_cadet"
  | "odyssey_crewmember"
  | "odyssey_captain"
  | "odyssey_onslaught"
  | "tft"
  | "tft_ranked"
  | "tft_tutorial"
  | "tft_test"
  | "_nexus_blitz_old"
  | "nexus_blitz"
  | "ultimate_spellbook"
  | "pick_urf"
  | "tutorial_1"
  | "tutorial_2"
  | "tutorial_3";

export const LOL_QUEUES: Record<LoLQueueKeyType, LoLQueue> = {
  custom_games: {
    queueId: 0,
    map: "Custom games",
    description: null,
    notes: null,
  },
  _blind_pick_old: {
    queueId: 2,
    map: "Summoner's Rift",
    description: "5v5 Blind Pick games",
    notes: "Deprecated in patch 7.19 in favor of queueId 430",
  },
  _ranked_solo_old: {
    queueId: 4,
    map: "Summoner's Rift",
    description: "5v5 Ranked Solo games",
    notes: "Deprecated in favor of queueId 420",
  },
  _ranked_premade: {
    queueId: 6,
    map: "Summoner's Rift",
    description: "5v5 Ranked Premade games",
    notes: "Game mode deprecated",
  },
  _coop_vs_ai_old: {
    queueId: 7,
    map: "Summoner's Rift",
    description: "Co-op vs AI games",
    notes: "Deprecated in favor of queueId 32 and 33",
  },
  _3v3_normal_old: {
    queueId: 8,
    map: "Twisted Treeline",
    description: "3v3 Normal games",
    notes: "Deprecated in patch 7.19 in favor of queueId 460",
  },
  _3v3_ranked_flex_old: {
    queueId: 9,
    map: "Twisted Treeline",
    description: "3v3 Ranked Flex games",
    notes: "Deprecated in patch 7.19 in favor of queueId 470",
  },
  _draft_pick_old: {
    queueId: 14,
    map: "Summoner's Rift",
    description: "5v5 Draft Pick games",
    notes: "Deprecated in favor of queueId 400",
  },
  _dominion_blind_pick: {
    queueId: 16,
    map: "Crystal Scar",
    description: "5v5 Dominion Blind Pick games",
    notes: "Game mode deprecated",
  },
  _dominion_draft_pick: {
    queueId: 17,
    map: "Crystal Scar",
    description: "5v5 Dominion Draft Pick games",
    notes: "Game mode deprecated",
  },
  _dominion_coop_vs_ai: {
    queueId: 25,
    map: "Crystal Scar",
    description: "Dominion Co-op vs AI games",
    notes: "Game mode deprecated",
  },
  _coop_vs_ai_intro_old: {
    queueId: 31,
    map: "Summoner's Rift",
    description: "Co-op vs AI Intro Bot games",
    notes: "Deprecated in patch 7.19 in favor of queueId 830",
  },
  _coop_vs_ai_beginner_old: {
    queueId: 32,
    map: "Summoner's Rift",
    description: "Co-op vs AI Beginner Bot games",
    notes: "Deprecated in patch 7.19 in favor of queueId 840",
  },
  _coop_vs_ai_intermediate_old: {
    queueId: 33,
    map: "Summoner's Rift",
    description: "Co-op vs AI Intermediate Bot games",
    notes: "Deprecated in patch 7.19 in favor of queueId 850",
  },
  _3v3_ranked_team: {
    queueId: 41,
    map: "Twisted Treeline",
    description: "3v3 Ranked Team games",
    notes: "Game mode deprecated",
  },
  _5v5_ranked_team: {
    queueId: 42,
    map: "Summoner's Rift",
    description: "5v5 Ranked Team games",
    notes: "Game mode deprecated",
  },
  _3v3_coop_vs_ai_old: {
    queueId: 52,
    map: "Twisted Treeline",
    description: "Co-op vs AI games",
    notes: "Deprecated in patch 7.19 in favor of queueId 800",
  },
  _team_builder: {
    queueId: 61,
    map: "Summoner's Rift",
    description: "5v5 Team Builder games",
    notes: "Game mode deprecated",
  },
  _aram_old: {
    queueId: 65,
    map: "Howling Abyss",
    description: "5v5 ARAM games",
    notes: "Deprecated in patch 7.19 in favor of queueId 450",
  },
  _aram_coop_vs_ai: {
    queueId: 67,
    map: "Howling Abyss",
    description: "ARAM Co-op vs AI games",
    notes: "Game mode deprecated",
  },
  _one_for_all_old: {
    queueId: 70,
    map: "Summoner's Rift",
    description: "One for All games",
    notes: "Deprecated in patch 8.6 in favor of queueId 1020",
  },
  snowdown_1v1: {
    queueId: 72,
    map: "Howling Abyss",
    description: "1v1 Snowdown Showdown games",
    notes: null,
  },
  snowdown_2v2: {
    queueId: 73,
    map: "Howling Abyss",
    description: "2v2 Snowdown Showdown games",
    notes: null,
  },
  hexakill_sr: {
    queueId: 75,
    map: "Summoner's Rift",
    description: "6v6 Hexakill games",
    notes: null,
  },
  urf: {
    queueId: 76,
    map: "Summoner's Rift",
    description: "Ultra Rapid Fire games",
    notes: null,
  },
  one_for_all_mirror: {
    queueId: 78,
    map: "Howling Abyss",
    description: "One For All: Mirror Mode games",
    notes: null,
  },
  coop_vs_ai_urf: {
    queueId: 83,
    map: "Summoner's Rift",
    description: "Co-op vs AI Ultra Rapid Fire games",
    notes: null,
  },
  _doom_bots_rank_1: {
    queueId: 91,
    map: "Summoner's Rift",
    description: "Doom Bots Rank 1 games",
    notes: "Deprecated in patch 7.19 in favor of queueId 950",
  },
  _doom_bots_rank_2: {
    queueId: 92,
    map: "Summoner's Rift",
    description: "Doom Bots Rank 2 games",
    notes: "Deprecated in patch 7.19 in favor of queueId 950",
  },
  _doom_bots_rank_5: {
    queueId: 93,
    map: "Summoner's Rift",
    description: "Doom Bots Rank 5 games",
    notes: "Deprecated in patch 7.19 in favor of queueId 950",
  },
  _ascension_old: {
    queueId: 96,
    map: "Crystal Scar",
    description: "Ascension games",
    notes: "Deprecated in patch 7.19 in favor of queueId 910",
  },
  hexakill_tt: {
    queueId: 98,
    map: "Twisted Treeline",
    description: "6v6 Hexakill games",
    notes: null,
  },
  aram_butchers_bridge: {
    queueId: 100,
    map: "Butcher's Bridge",
    description: "5v5 ARAM games",
    notes: null,
  },
  _poro_king_old: {
    queueId: 300,
    map: "Howling Abyss",
    description: "Legend of the Poro King games",
    notes: "Deprecated in patch 7.19 in favor of queueId 920",
  },
  nemesis: {
    queueId: 310,
    map: "Summoner's Rift",
    description: "Nemesis games",
    notes: null,
  },
  black_market_brawlers: {
    queueId: 313,
    map: "Summoner's Rift",
    description: "Black Market Brawlers games",
    notes: null,
  },
  _nexus_siege_old: {
    queueId: 315,
    map: "Summoner's Rift",
    description: "Nexus Siege games",
    notes: "Deprecated in patch 7.19 in favor of queueId 940",
  },
  definitely_not_dominion: {
    queueId: 317,
    map: "Crystal Scar",
    description: "Definitely Not Dominion games",
    notes: null,
  },
  _arurf_old: {
    queueId: 318,
    map: "Summoner's Rift",
    description: "ARURF games",
    notes: "Deprecated in patch 7.19 in favor of queueId 900",
  },
  all_random: {
    queueId: 325,
    map: "Summoner's Rift",
    description: "All Random games",
    notes: null,
  },
  draft_pick: {
    queueId: 400,
    map: "Summoner's Rift",
    description: "5v5 Draft Pick games",
    notes: null,
  },
  _ranked_dynamic: {
    queueId: 410,
    map: "Summoner's Rift",
    description: "5v5 Ranked Dynamic games",
    notes: "Game mode deprecated in patch 6.22",
  },
  RANKED_SOLO_5x5: {
    queueId: 420,
    map: "Summoner's Rift",
    description: "Ranked Solo",
    notes: null,
  },
  blind_pick: {
    queueId: 430,
    map: "Summoner's Rift",
    description: "5v5 Blind Pick games",
    notes: null,
  },
  RANKED_FLEX_SR: {
    queueId: 440,
    map: "Summoner's Rift",
    description: "Ranked Flex",
    notes: null,
  },
  aram: {
    queueId: 450,
    map: "Howling Abyss",
    description: "5v5 ARAM games",
    notes: null,
  },
  _3v3_blind_pick: {
    queueId: 460,
    map: "Twisted Treeline",
    description: "3v3 Blind Pick games",
    notes: "Deprecated in patch 9.23",
  },
  _3v3_ranked_flex: {
    queueId: 470,
    map: "Twisted Treeline",
    description: "3v3 Ranked Flex games",
    notes: "Deprecated in patch 9.23",
  },
  blood_hunt_assassin: {
    queueId: 600,
    map: "Summoner's Rift",
    description: "Blood Hunt Assassin games",
    notes: null,
  },
  dark_star_singularity: {
    queueId: 610,
    map: "Cosmic Ruins",
    description: "Dark Star: Singularity games",
    notes: null,
  },
  clash_sr: {
    queueId: 700,
    map: "Summoner's Rift",
    description: "Summoner's Rift Clash games",
    notes: null,
  },
  clash_aram: {
    queueId: 720,
    map: "Howling Abyss",
    description: "ARAM Clash games",
    notes: null,
  },
  _3v3_coop_vs_ai_intermediate: {
    queueId: 800,
    map: "Twisted Treeline",
    description: "Co-op vs. AI Intermediate Bot games",
    notes: "Deprecated in patch 9.23",
  },
  _3v3_coop_vs_ai_intro: {
    queueId: 810,
    map: "Twisted Treeline",
    description: "Co-op vs. AI Intro Bot games",
    notes: "Deprecated in patch 9.23",
  },
  "3v3_coop_vs_ai_beginner": {
    queueId: 820,
    map: "Twisted Treeline",
    description: "Co-op vs. AI Beginner Bot games",
    notes: null,
  },
  coop_vs_ai_intro: {
    queueId: 830,
    map: "Summoner's Rift",
    description: "Co-op vs. AI Intro Bot games",
    notes: null,
  },
  coop_vs_ai_beginner: {
    queueId: 840,
    map: "Summoner's Rift",
    description: "Co-op vs. AI Beginner Bot games",
    notes: null,
  },
  coop_vs_ai_intermediate: {
    queueId: 850,
    map: "Summoner's Rift",
    description: "Co-op vs. AI Intermediate Bot games",
    notes: null,
  },
  arurf: {
    queueId: 900,
    map: "Summoner's Rift",
    description: "ARURF games",
    notes: null,
  },
  ascension: {
    queueId: 910,
    map: "Crystal Scar",
    description: "Ascension games",
    notes: null,
  },
  poro_king: {
    queueId: 920,
    map: "Howling Abyss",
    description: "Legend of the Poro King games",
    notes: null,
  },
  nexus_siege: {
    queueId: 940,
    map: "Summoner's Rift",
    description: "Nexus Siege games",
    notes: null,
  },
  doom_bots_voting: {
    queueId: 950,
    map: "Summoner's Rift",
    description: "Doom Bots Voting games",
    notes: null,
  },
  doom_bots_standard: {
    queueId: 960,
    map: "Summoner's Rift",
    description: "Doom Bots Standard games",
    notes: null,
  },
  star_guardian_normal: {
    queueId: 980,
    map: "Valoran City Park",
    description: "Star Guardian Invasion: Normal games",
    notes: null,
  },
  star_guardian_onslaught: {
    queueId: 990,
    map: "Valoran City Park",
    description: "Star Guardian Invasion: Onslaught games",
    notes: null,
  },
  project_hunters: {
    queueId: 1000,
    map: "Overcharge",
    description: "PROJECT: Hunters games",
    notes: null,
  },
  snow_arurf: {
    queueId: 1010,
    map: "Summoner's Rift",
    description: "Snow ARURF games",
    notes: null,
  },
  one_for_all: {
    queueId: 1020,
    map: "Summoner's Rift",
    description: "One for All games",
    notes: null,
  },
  odyssey_intro: {
    queueId: 1030,
    map: "Crash Site",
    description: "Odyssey Extraction: Intro games",
    notes: null,
  },
  odyssey_cadet: {
    queueId: 1040,
    map: "Crash Site",
    description: "Odyssey Extraction: Cadet games",
    notes: null,
  },
  odyssey_crewmember: {
    queueId: 1050,
    map: "Crash Site",
    description: "Odyssey Extraction: Crewmember games",
    notes: null,
  },
  odyssey_captain: {
    queueId: 1060,
    map: "Crash Site",
    description: "Odyssey Extraction: Captain games",
    notes: null,
  },
  odyssey_onslaught: {
    queueId: 1070,
    map: "Crash Site",
    description: "Odyssey Extraction: Onslaught games",
    notes: null,
  },
  tft: {
    queueId: 1090,
    map: "Convergence",
    description: "Teamfight Tactics games",
    notes: null,
  },
  tft_ranked: {
    queueId: 1100,
    map: "Convergence",
    description: "Ranked Teamfight Tactics games",
    notes: null,
  },
  tft_tutorial: {
    queueId: 1110,
    map: "Convergence",
    description: "Teamfight Tactics Tutorial games",
    notes: null,
  },
  tft_test: {
    queueId: 1111,
    map: "Convergence",
    description: "Teamfight Tactics test games",
    notes: null,
  },
  _nexus_blitz_old: {
    queueId: 1200,
    map: "Nexus Blitz",
    description: "Nexus Blitz games",
    notes: "Deprecated in patch 9.2",
  },
  nexus_blitz: {
    queueId: 1300,
    map: "Nexus Blitz",
    description: "Nexus Blitz games",
    notes: null,
  },
  ultimate_spellbook: {
    queueId: 1400,
    map: "Summoner's Rift",
    description: "Ultimate Spellbook games",
    notes: null,
  },
  pick_urf: {
    queueId: 1900,
    map: "Summoner's Rift",
    description: "Pick URF games",
    notes: null,
  },
  tutorial_1: {
    queueId: 2000,
    map: "Summoner's Rift",
    description: "Tutorial 1",
    notes: null,
  },
  tutorial_2: {
    queueId: 2010,
    map: "Summoner's Rift",
    description: "Tutorial 2",
    notes: null,
  },
  tutorial_3: {
    queueId: 2020,
    map: "Summoner's Rift",
    description: "Tutorial 3",
    notes: null,
  },
} as const;

// Helper functions for type safety
export function getQueueById(queueId: number): LoLQueue | undefined {
  return Object.values(LOL_QUEUES).find((queue) => queue.queueId === queueId);
}

export function getQueueByKey(key: LoLQueueKeyType): LoLQueue {
  return LOL_QUEUES[key];
}

export function isDeprecatedQueue(key: LoLQueueKeyType): boolean {
  return key.startsWith("_");
}

export function getActiveQueues(): Record<string, LoLQueue> {
  return Object.fromEntries(Object.entries(LOL_QUEUES).filter(([key]) => !key.startsWith("_")));
}

export function getDeprecatedQueues(): Record<string, LoLQueue> {
  return Object.fromEntries(Object.entries(LOL_QUEUES).filter(([key]) => key.startsWith("_")));
}
