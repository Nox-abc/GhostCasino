// Central state: Value balance, stats, quests, history. Persisted to localStorage.

const KEY = "ghostcasino_v1";

const DEFAULTS = {
  balance: 5000, // starting Value for new players
  username: "Ghost_" + Math.floor(1000 + Math.random() * 9000),
  xp: 0,
  stats: { wagered: 0, won: 0, gamesPlayed: 0, biggestWin: 0 },
  quests: {}, // id -> { progress, claimed }
  history: [], // { game, bet, payout, ts }
  lastWheelSpin: 0,
  welcomed: false,
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...structuredClone(DEFAULTS), ...JSON.parse(raw) };
  } catch (e) { /* corrupted storage — start fresh */ }
  return structuredClone(DEFAULTS);
}

export const state = load();

const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function persist() {
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((fn) => fn(state));
}

export function fmt(n) {
  return Math.floor(n).toLocaleString("en-US");
}

export function canAfford(amount) {
  return amount > 0 && amount <= state.balance;
}

/** Deduct a bet. Returns false if unaffordable. */
export function placeBet(amount, game) {
  amount = Math.floor(amount);
  if (!canAfford(amount)) return false;
  state.balance -= amount;
  state.stats.wagered += amount;
  state.stats.gamesPlayed += 1;
  state.xp += Math.max(1, Math.round(amount / 10));
  bumpQuest("play_any", 1);
  bumpQuest("wager_total", amount);
  if (game) bumpQuest("play_" + game, 1);
  persist();
  return true;
}

/** Credit a payout (0 for a loss) and record history. */
export function settle(game, bet, payout) {
  payout = Math.floor(payout);
  if (payout > 0) {
    state.balance += payout;
    state.stats.won += payout;
    if (payout - bet > state.stats.biggestWin) state.stats.biggestWin = payout - bet;
    if (payout >= bet * 2) bumpQuest("win_2x", 1);
  }
  state.history.unshift({ game, bet, payout, ts: Date.now() });
  if (state.history.length > 50) state.history.length = 50;
  persist();
}

/** Free Value grants (wheel, quests, welcome bonus). */
export function grant(amount, reason) {
  state.balance += Math.floor(amount);
  persist();
}

export function bumpQuest(id, by) {
  const q = state.quests[id] || (state.quests[id] = { progress: 0, claimed: false });
  if (!q.claimed) q.progress += by;
}

export function claimQuest(id, reward) {
  const q = state.quests[id] || (state.quests[id] = { progress: 0, claimed: false });
  if (q.claimed) return false;
  q.claimed = true;
  state.balance += reward;
  persist();
  return true;
}

export function markWheelSpun() { state.lastWheelSpin = Date.now(); persist(); }
export function markWelcomed() { state.welcomed = true; persist(); }
export function save() { persist(); }

export function level() { return Math.floor(Math.sqrt(state.xp / 50)) + 1; }
export function levelProgress() {
  const lv = level();
  const cur = (lv - 1) ** 2 * 50, next = lv ** 2 * 50;
  return Math.min(1, (state.xp - cur) / (next - cur));
}
