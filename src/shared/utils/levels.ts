export type CombinedSummonerLevels = {
  level: number;
  progressXp: number;
  xpToNext: number;
  progressPct: number;
  totalXp: number;
};

// XP needed to go from current level -> next level
const XP_1_29 = [
  144, 144, 192, 240, 336, 432, 528, 624, 720, 816, 912, 984, 1056, 1128, 1344,
  1440, 1536, 1680, 1824, 1968, 2112, 2208, 2304, 2304, 2496, 2496, 2592, 2688,
  2688,
] as const;

const XP_30_49 = [
  2688, 2688, 2688, 2784, 2784, 2784, 2880, 2880, 2880, 3072, 3072, 3168, 3168,
  3264, 3264, 3360, 3360, 3456, 3456, 3456,
] as const;

// repeating 25-level block for 50+
const XP_50_74 = [
  2592, 2688, 2688, 2688, 2688, 2880, 2880, 2880, 3072, 3072, 3072, 3264, 3264,
  3264, 3360, 3360, 3360, 3456, 3456, 3456, 3456, 3552, 3552, 3648, 3648,
] as const;

// prefix sums, ps[i] is sum of steps up through index i-1
const pref = (arr: readonly number[]) => {
  const out = new Array<number>(arr.length + 1);
  out[0] = 0;
  for (let i = 0; i < arr.length; i++) out[i + 1] = out[i]! + arr[i]!;
  return out;
};

const P1 = pref(XP_1_29); // length 30
const P2 = pref(XP_30_49); // length 21
const PB = pref(XP_50_74); // length 26

// safe getter, guarantees number to TS and throws if out of bounds
const at = (arr: readonly number[], i: number): number => {
  if (i < 0 || i >= arr.length)
    throw new RangeError(`index ${i} out of range ${arr.length}`);
  return arr[i]!;
};

const T30 = at(P1, 29); // XP to reach level 30
const T50 = T30 + at(P2, 20); // XP to reach level 50
const S = at(PB, 25); // sum of one 25-level block

const stepFor = (lvl: number): number => {
  if (lvl <= 1) return at(XP_1_29, 0);
  if (lvl <= 29) return at(XP_1_29, lvl - 1);
  if (lvl <= 49) return at(XP_30_49, lvl - 30);
  return at(XP_50_74, (lvl - 50) % 25);
};

// total XP to reach `level`
const totalXpForLevel = (level: number): number => {
  const l = Math.max(1, Math.floor(level));
  if (l <= 30) return at(P1, l - 1);
  if (l <= 50) return T30 + at(P2, l - 30);
  const d = l - 50;
  const q = Math.floor(d / 25);
  const r = d % 25;
  return T50 + q * S + at(PB, r);
};

// inverse, from total XP -> current level and progress
const levelFromTotalXp = (xp: number) => {
  const x = Math.max(0, Math.floor(xp));

  // < 30
  if (x < T30) {
    let l = 1;
    while (l < 30 && x >= at(P1, l)) l++;
    const base = at(P1, l - 1); // XP to be at level l
    return { level: l, progressXp: x - base, xpToNext: stepFor(l) };
  }

  // 30..49
  if (x < T50) {
    const y = x - T30;
    let k = 0;
    while (k < 20 && y >= at(P2, k + 1)) k++;
    const l = 30 + k;
    const base = T30 + at(P2, k); // XP to be at level l
    return { level: l, progressXp: x - base, xpToNext: stepFor(l) };
  }

  // 50+
  const y = x - T50;
  const q = Math.floor(y / S);
  const rem = y - q * S;
  let r = 0;
  while (r < 25 && rem >= at(PB, r + 1)) r++;
  const l = 50 + q * 25 + r;
  const base = T50 + q * S + at(PB, r); // XP to be at level l
  return { level: l, progressXp: x - base, xpToNext: stepFor(l) };
};

// combine any list of summoner levels
export function combinedSummonerLevels(
  levels: number[]
): CombinedSummonerLevels {
  let totalXp = 0;
  for (let i = 0; i < levels.length; i++) {
    totalXp += totalXpForLevel(Math.max(1, Math.floor(levels[i] ?? 1)));
  }
  const { level, progressXp, xpToNext } = levelFromTotalXp(totalXp);
  const progressPct = xpToNext
    ? +(100 * (progressXp / xpToNext)).toFixed(2)
    : 0;
  return { level, progressXp, xpToNext, progressPct, totalXp };
}
