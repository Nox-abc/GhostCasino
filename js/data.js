// Static catalog data: games, providers, quests, fake players, chat lines.
// All `icon` fields reference names in js/icons.js (monochrome SVG set).

export const GAMES = [
  // ---- Classics (playable) ----
  { id: "slots",     name: "Ghost Slots",    provider: "Ghost Originals", icon: "slots",    bg: "linear-gradient(160deg,#3a1602,#7a2d00)", badge: "hot",  cats: ["classic", "popular", "slots"], playable: true },
  { id: "roulette",  name: "Roulette",       provider: "Ghost Originals", icon: "roulette", bg: "linear-gradient(160deg,#12071f,#3d1160)", badge: "hot",  cats: ["classic", "popular", "table"], playable: true },
  { id: "blackjack", name: "Blackjack",      provider: "Ghost Originals", icon: "cards",    bg: "linear-gradient(160deg,#0d2618,#1a5533)", badge: null,   cats: ["classic", "popular", "table"], playable: true },
  { id: "baccarat",  name: "Baccarat",       provider: "Ghost Originals", icon: "baccarat", bg: "linear-gradient(160deg,#2e1a02,#6e4207)", badge: null,   cats: ["classic", "table"], playable: true },

  // ---- Multiplayer (playable, simulated players) ----
  { id: "crash",      name: "Crash",         provider: "Ghost Originals", icon: "crash",   bg: "linear-gradient(160deg,#031c33,#0a4a7a)", badge: "hot", cats: ["multiplayer", "popular"], playable: true },
  { id: "cases",      name: "Case Opening",  provider: "Ghost Originals", icon: "case",    bg: "linear-gradient(160deg,#1a0533,#4a0f7a)", badge: "new", cats: ["multiplayer", "popular"], playable: true },
  { id: "casebattle", name: "Case Battles",  provider: "Ghost Originals", icon: "swords",  bg: "linear-gradient(160deg,#33071c,#7a1042)", badge: "new", cats: ["multiplayer"], playable: true },
  { id: "jackpot",    name: "Jackpot",       provider: "Ghost Originals", icon: "jackpot", bg: "linear-gradient(160deg,#032e33,#0a6e7a)", badge: null,  cats: ["multiplayer"], playable: true },

  // ---- Mini games (playable) ----
  { id: "mines",    name: "Mines",    provider: "Ghost Originals", icon: "mines",  bg: "linear-gradient(160deg,#1c1c26,#39394a)", badge: null, cats: ["mini", "popular"], playable: true },
  { id: "dice",     name: "Dice",     provider: "Ghost Originals", icon: "dice",   bg: "linear-gradient(160deg,#0d2b1c,#12563a)", badge: null, cats: ["mini", "popular"], playable: true },
  { id: "coinflip", name: "Coinflip", provider: "Ghost Originals", icon: "coin",   bg: "linear-gradient(160deg,#3a2a02,#7a5a00)", badge: null, cats: ["mini"], playable: true },
  { id: "keno",     name: "Keno",     provider: "Ghost Originals", icon: "keno",   bg: "linear-gradient(160deg,#0a1a2e,#123a6e)", badge: "new", cats: ["mini"], playable: true },
  { id: "plinko",   name: "Plinko",   provider: "Ghost Originals", icon: "plinko", bg: "linear-gradient(160deg,#2e0a26,#6e1a5a)", badge: "new", cats: ["mini"], playable: true },
  { id: "tower",    name: "Tower",    provider: "Ghost Originals", icon: "tower",  bg: "linear-gradient(160deg,#26140a,#6e3812)", badge: null, cats: ["mini"], playable: true },
  { id: "limbo",    name: "Limbo",    provider: "Ghost Originals", icon: "limbo",  bg: "linear-gradient(160deg,#1a0a33,#3d1a7a)", badge: null, cats: ["mini"], playable: true },

  // ---- Provider showcase (coming soon) ----
  { id: "bigbass",    name: "Big Bass Bonanza", provider: "Pragmatic",  icon: "fish",   bg: "linear-gradient(160deg,#062a33,#0f5a7a)", badge: "hot", cats: ["slots", "popular"] },
  { id: "sweetbnz",   name: "Sweet Bonanza",    provider: "Pragmatic",  icon: "candy",  bg: "linear-gradient(160deg,#2e0633,#6e0f7a)", badge: "hot", cats: ["slots", "popular"] },
  { id: "gatesoly",   name: "Gates of Olympus", provider: "Pragmatic",  icon: "bolt",   bg: "linear-gradient(160deg,#1a0a33,#3d1a7a)", badge: null,  cats: ["slots"] },
  { id: "bookofdead", name: "Book of Dead",     provider: "Play'n GO",  icon: "scroll", bg: "linear-gradient(160deg,#33230a,#7a5512)", badge: null,  cats: ["slots"] },
  { id: "starburst",  name: "Starburst XXL",    provider: "NetEnt",     icon: "sparkle",bg: "linear-gradient(160deg,#0a0a33,#1a1a7a)", badge: null,  cats: ["slots"] },
  { id: "piggygold",  name: "Piggy Gold",       provider: "PG Soft",    icon: "pig",    bg: "linear-gradient(160deg,#33071c,#7a1042)", badge: null,  cats: ["slots"] },
  { id: "viralata",   name: "Vira-Lata Caramelo", provider: "PG Soft",  icon: "dog",    bg: "linear-gradient(160deg,#33200a,#7a4a12)", badge: "new", cats: ["slots", "new"] },
  { id: "mineisland", name: "Mine Island",      provider: "BGaming",    icon: "island", bg: "linear-gradient(160deg,#032e33,#0a6e7a)", badge: "new", cats: ["slots", "new"] },
  { id: "wildwest",   name: "Wild West Gold",   provider: "Pragmatic",  icon: "hat",    bg: "linear-gradient(160deg,#33260a,#7a5512)", badge: null,  cats: ["slots"] },
  { id: "fortunebags",name: "Fortune Bags",     provider: "Hacksaw",    icon: "money",  bg: "linear-gradient(160deg,#0d2e12,#1a6e28)", badge: null,  cats: ["slots"] },
  { id: "chillibells",name: "Hot Chilli Bells", provider: "Amusnet",    icon: "chili",  bg: "linear-gradient(160deg,#330606,#7a0f0f)", badge: null,  cats: ["slots"] },
  { id: "moonrush",   name: "Moon Rush",        provider: "Spinomenal", icon: "moon",   bg: "linear-gradient(160deg,#0a0a2e,#26266e)", badge: "new", cats: ["slots", "new"] },
  { id: "speedauto",  name: "Speed Auto Roulette", provider: "Evolution", icon: "roulette", bg: "linear-gradient(160deg,#1a1a26,#3a3a55)", badge: "live", cats: ["live", "table"] },
  { id: "blackjacklive", name: "Blackjack Lobby", provider: "Evolution", icon: "cards", bg: "linear-gradient(160deg,#0d2618,#1a5533)", badge: "live", cats: ["live", "table"] },
  { id: "megawheel",  name: "Mega Wheel",       provider: "Pragmatic",  icon: "wheel",  bg: "linear-gradient(160deg,#2e0a26,#6e1a5a)", badge: "live", cats: ["live"] },
  { id: "baccaratlive", name: "Golden Baccarat", provider: "Evolution", icon: "baccarat", bg: "linear-gradient(160deg,#2e1a02,#6e4207)", badge: "live", cats: ["live", "table"] },
];

export const PROVIDERS = [
  { name: "Ghost Originals", icon: "diamond", games: 15 },
  { name: "Pragmatic Play", icon: "target", games: 6 },
  { name: "Evolution", icon: "video", games: 3 },
  { name: "PG Soft", icon: "sparkle", games: 2 },
  { name: "NetEnt", icon: "star", games: 1 },
  { name: "Play'n GO", icon: "scroll", games: 1 },
  { name: "Hacksaw Gaming", icon: "bolt", games: 1 },
  { name: "BGaming", icon: "gem", games: 1 },
  { name: "Spinomenal", icon: "moon", games: 1 },
  { name: "Amusnet", icon: "fire", games: 1 },
];

export const QUESTS = [
  { id: "welcome",       icon: "gift",    name: "Welcome to GhostCasino", desc: "Claim your welcome gift — on the house.", target: 0, reward: 1000 },
  { id: "play_any",      icon: "grid",    name: "Warming Up",     desc: "Play 5 rounds of any game.", target: 5, reward: 500 },
  { id: "play_slots",    icon: "slots",   name: "Reel Deal",      desc: "Spin Ghost Slots 10 times.", target: 10, reward: 750 },
  { id: "play_roulette", icon: "roulette",name: "Round & Round",  desc: "Play 5 rounds of roulette.", target: 5, reward: 600 },
  { id: "play_blackjack",icon: "cards",   name: "Hit Me",         desc: "Play 5 hands of blackjack.", target: 5, reward: 600 },
  { id: "play_cases",    icon: "case",    name: "Unboxer",        desc: "Open 3 cases.", target: 3, reward: 700 },
  { id: "win_2x",        icon: "burst",   name: "Double Trouble", desc: "Win 2x your bet or more, 3 times.", target: 3, reward: 900 },
  { id: "play_crash",    icon: "crash",   name: "To the Moon",    desc: "Play 5 rounds of Crash.", target: 5, reward: 600 },
  { id: "play_mines",    icon: "mines",   name: "Minesweeper",    desc: "Play 5 rounds of Mines.", target: 5, reward: 600 },
  { id: "wager_total",   icon: "trophy",  name: "High Roller",    desc: "Wager 10,000 Value in total.", target: 10000, reward: 2500 },
];

export const FAKE_PLAYERS = [
  "Alex Marceler", "Nikol Gordon", "Kas Samurski", "Murad Ahmedov", "Viktoria K.",
  "Mikhael B.", "Tatiana V.", "Igor P.", "Sasha_777", "LuckyLena", "CrashKing",
  "SpinMaster", "NightOwl", "GoldenGoose", "PixelPirate", "MoonShot88",
];

export const CHAT_LINES = [
  "Hey! I will be glad to new acquaintances!",
  "Is someone participating in the jackpot? What are the chances?",
  "Who will go play roulette?",
  "I'm going to play blackjack in a couple of minutes. New tactic.",
  "How to get more Value from the quests? I won for the first time!",
  "Just hit 12x on Crash!!",
  "Mines is so addictive lol",
  "Anyone else grinding the daily wheel?",
  "GG to whoever won 19,600 on the case battle",
  "New here, this place looks amazing",
  "Tip: cash out early on crash, trust me",
  "The quests give free Value, don't sleep on them",
  "Coinflip is 50/50 but my luck is 0/100",
  "Big win on Dice, let's gooo",
  "What's everyone's favorite Original?",
  "Spin the wheel every day, it adds up!",
  "Opened a Phantom from the Starter case, insane",
  "Jackpot pot is getting huge right now",
];

export const WIN_GAMES = [
  { name: "Case Opening", icon: "case", bg: "linear-gradient(160deg,#1a0533,#4a0f7a)" },
  { name: "Case Battles", icon: "swords", bg: "linear-gradient(160deg,#33071c,#7a1042)" },
  { name: "Big Bass Bonanza", icon: "fish", bg: "linear-gradient(160deg,#062a33,#0f5a7a)" },
  { name: "Jackpot", icon: "jackpot", bg: "linear-gradient(160deg,#032e33,#0a6e7a)" },
  { name: "Sweet Bonanza", icon: "candy", bg: "linear-gradient(160deg,#2e0633,#6e0f7a)" },
  { name: "Blackjack", icon: "cards", bg: "linear-gradient(160deg,#0d2618,#1a5533)" },
  { name: "Crash", icon: "crash", bg: "linear-gradient(160deg,#031c33,#0a4a7a)" },
  { name: "Ghost Slots", icon: "slots", bg: "linear-gradient(160deg,#3a1602,#7a2d00)" },
  { name: "Mines", icon: "mines", bg: "linear-gradient(160deg,#1c1c26,#39394a)" },
  { name: "Plinko", icon: "plinko", bg: "linear-gradient(160deg,#2e0a26,#6e1a5a)" },
];

export const CATEGORY_LABELS = {
  popular: "Popular", classic: "Classics", multiplayer: "Multiplayer",
  mini: "Mini Games", slots: "Slots", table: "Table Games",
  live: "Live Casino", new: "New",
};

export function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function randInt(min, max) { return Math.floor(min + Math.random() * (max - min + 1)); }
