// Page views: home lobby, categories, game page, wheel, quests, profile, misc.

import { state, fmt, level, levelProgress, claimQuest, markWheelSpun, grant } from "./state.js";
import { GAMES, PROVIDERS, QUESTS, CATEGORY_LABELS } from "./data.js";
import { startLiveWins, toast, esc, initialsAvatar } from "./ui.js";
import { icon } from "./icons.js";
import { renderSlots } from "./games/slots.js";
import { renderRoulette } from "./games/roulette.js";
import { renderBlackjack } from "./games/blackjack.js";
import { renderBaccarat } from "./games/baccarat.js";
import { renderCrash } from "./games/crash.js";
import { renderCases } from "./games/cases.js";
import { renderCaseBattle } from "./games/casebattle.js";
import { renderJackpot } from "./games/jackpot.js";
import { renderMines } from "./games/mines.js";
import { renderDice } from "./games/dice.js";
import { renderCoinflip } from "./games/coinflip.js";
import { renderKeno } from "./games/keno.js";
import { renderPlinko } from "./games/plinko.js";
import { renderTower } from "./games/tower.js";
import { renderLimbo } from "./games/limbo.js";

const GAME_RENDERERS = {
  slots: renderSlots, roulette: renderRoulette, blackjack: renderBlackjack, baccarat: renderBaccarat,
  crash: renderCrash, cases: renderCases, casebattle: renderCaseBattle, jackpot: renderJackpot,
  mines: renderMines, dice: renderDice, coinflip: renderCoinflip, keno: renderKeno,
  plinko: renderPlinko, tower: renderTower, limbo: renderLimbo,
};

/* ---------- shared: game card ---------- */
export function gameCard(g) {
  const badge = g.badge ? `<span class="badge ${g.badge}">${g.badge.toUpperCase()}</span>` : "";
  return `
    <button class="game-card" data-nav="#/game/${g.id}">
      <div class="game-card-art" style="background:${g.bg}">${badge}${icon(g.icon, "game-card-ico")}</div>
      <div class="game-card-meta">
        <div class="game-card-name">${esc(g.name)}</div>
        <div class="game-card-provider">${esc(g.provider)}</div>
      </div>
      <div class="play-overlay"><span class="play-btn">▶</span></div>
    </button>`;
}

function gameGrid(games) {
  return `<div class="game-grid">${games.map(gameCard).join("")}</div>`;
}

function sectionHTML(iconName, title, cat, games) {
  return `
    <section class="section">
      <div class="section-head">
        <div class="section-title">${icon(iconName)}${title}</div>
        <div class="spacer"></div>
        ${cat ? `<button class="section-btn" data-nav="#/category/${cat}">All</button>` : ""}
      </div>
      ${gameGrid(games)}
    </section>`;
}

function chipRow(active) {
  const chips = [
    { id: "lobby", icon: "grid", label: "Lobby", nav: "#/" },
    { id: "popular", icon: "fire", label: "Popular", nav: "#/category/popular" },
    { id: "classic", icon: "chip", label: "Classics", nav: "#/category/classic" },
    { id: "multiplayer", icon: "swords", label: "Multiplayer", nav: "#/category/multiplayer" },
    { id: "mini", icon: "mini", label: "Mini Games", nav: "#/category/mini" },
    { id: "slots", icon: "slots", label: "Slots", nav: "#/category/slots" },
    { id: "live", icon: "video", label: "Live", nav: "#/category/live" },
    { id: "new", icon: "sparkle", label: "New", nav: "#/category/new" },
  ];
  return `<div class="chip-row">
    ${chips.map((c) => `<button class="chip${c.id === active ? " active" : ""}" data-nav="${c.nav}">${icon(c.icon)}${c.label}</button>`).join("")}
  </div>`;
}

/* ---------- HOME ---------- */
export function renderHome(content) {
  content.innerHTML = `
    <div class="hero-row">
      <div class="hero-banner hero-quests">
        <h2>Get Ready For<br/>Casino Quests</h2>
        <span class="hero-art">${icon("target", "hero-art-ico")}</span>
        <button class="hero-cta" data-nav="#/quests">Go To Quests</button>
      </div>
      <div class="hero-banner hero-bonus">
        <h2>Spin the Daily<br/>Value Wheel</h2>
        <span class="hero-art">${icon("wheel", "hero-art-ico")}</span>
        <button class="hero-cta" data-nav="#/wheel">Claim Now</button>
      </div>
    </div>

    ${chipRow("lobby")}

    <section class="section">
      <div class="section-head">
        <div class="section-title"><span class="dot"></span>Live Wins</div>
        <div class="spacer"></div>
      </div>
      <div class="live-wins" id="liveWins"></div>
    </section>

    ${sectionHTML("swords", "Multiplayer", "multiplayer", GAMES.filter((g) => g.cats.includes("multiplayer") && g.playable))}
    ${sectionHTML("chip", "Classics", "classic", GAMES.filter((g) => g.cats.includes("classic") && g.playable))}
    ${sectionHTML("mini", "Mini Games", "mini", GAMES.filter((g) => g.cats.includes("mini") && g.playable))}
    ${sectionHTML("slots", "Slots", "slots", GAMES.filter((g) => g.cats.includes("slots") && !g.playable).slice(0, 12))}
    ${sectionHTML("video", "Live Casino", "live", GAMES.filter((g) => g.cats.includes("live")))}
  `;
  startLiveWins(content.querySelector("#liveWins"));
}

/* ---------- CATEGORY ---------- */
export function renderCategory(content, cat) {
  const label = CATEGORY_LABELS[cat] || cat;
  const games = GAMES.filter((g) => g.cats.includes(cat));
  content.innerHTML = `
    ${chipRow(cat)}
    <section class="section">
      <div class="section-head"><div class="section-title">${esc(label)} <span style="color:var(--text-faint);font-size:13px">(${games.length})</span></div></div>
      ${games.length ? gameGrid(games) : `<div class="info-page">${icon("search", "info-ico")}<h2>Nothing here yet</h2><p>Check back soon.</p></div>`}
    </section>
  `;
}

/* ---------- GAME PAGE ---------- */
export function renderGame(content, id) {
  const g = GAMES.find((x) => x.id === id);
  if (!g) { renderHome(content); return; }

  content.innerHTML = `
    <div class="game-page">
      <div class="game-page-head">
        <button class="back-btn" data-nav="#/">‹ Lobby</button>
        <div class="game-page-titlebox">
          ${icon(g.icon, "game-page-ico")}
          <span class="game-page-title">${esc(g.name)}</span>
          <span class="game-page-provider">${esc(g.provider)}</span>
        </div>
      </div>
      <div class="game-frame" id="gameFrame"></div>
    </div>
  `;
  const frame = content.querySelector("#gameFrame");
  const renderer = GAME_RENDERERS[id];
  if (renderer) {
    renderer(frame);
  } else {
    frame.innerHTML = `
      <div class="info-page" style="margin:20px auto">
        ${icon(g.icon, "info-ico")}
        <h2>${esc(g.name)}</h2>
        <p>This provider game is coming soon. Try a Ghost Original in the meantime!</p>
        <br/>
        <button class="hero-cta" data-nav="#/game/slots">Play Ghost Slots</button>
      </div>`;
  }
}

/* ---------- WHEEL ---------- */
const WHEEL_PRIZES = [250, 50, 500, 100, 1000, 50, 2500, 100, 250, 50, 5000, 100];
const WHEEL_COLORS = ["#ff4e00", "#23232e", "#8e44ff", "#23232e", "#ffc233", "#23232e", "#2ecc71", "#23232e", "#ff4e00", "#23232e", "#e91e63", "#23232e"];
const WHEEL_COOLDOWN = 6 * 60 * 60 * 1000; // 6h

export function renderWheel(content) {
  const seg = 360 / WHEEL_PRIZES.length;
  const gradient = `conic-gradient(${WHEEL_PRIZES.map((_, i) => `${WHEEL_COLORS[i]} ${i * seg}deg ${(i + 1) * seg}deg`).join(",")})`;

  content.innerHTML = `
    <div class="wheel-page">
      <h2 style="font-size:24px">Daily Value Wheel</h2>
      <p style="color:var(--text-dim)">Spin for free Value every 6 hours. Prizes: ◆50 – ◆5,000</p>
      <div class="fortune-wheel-wrap">
        <div class="fortune-pointer"></div>
        <div class="fortune-wheel" style="background:${gradient}"></div>
        <div class="fortune-hub">◆</div>
      </div>
      <button class="hero-cta" id="spinWheelBtn" style="font-size:16px;padding:14px 40px">SPIN FREE</button>
      <div class="wheel-timer" id="wheelTimer"></div>
    </div>
  `;

  const wheel = content.querySelector(".fortune-wheel");
  const btn = content.querySelector("#spinWheelBtn");
  const timerEl = content.querySelector("#wheelTimer");
  let rotation = 0;

  function remaining() { return state.lastWheelSpin + WHEEL_COOLDOWN - Date.now(); }

  function tickTimer() {
    const r = remaining();
    if (r <= 0) {
      btn.disabled = false;
      btn.style.opacity = "1";
      timerEl.textContent = "Free spin available!";
      return;
    }
    btn.disabled = true;
    btn.style.opacity = "0.5";
    const h = Math.floor(r / 3600000), m = Math.floor((r % 3600000) / 60000), s = Math.floor((r % 60000) / 1000);
    timerEl.textContent = `Next free spin in ${h}h ${m}m ${s}s`;
  }
  tickTimer();
  const timer = setInterval(() => { if (!timerEl.isConnected) { clearInterval(timer); return; } tickTimer(); }, 1000);

  btn.addEventListener("click", () => {
    if (remaining() > 0) return;
    btn.disabled = true;
    const idx = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const prize = WHEEL_PRIZES[idx];
    const target = 360 * 5 - (idx * seg + seg / 2);
    rotation += 360 * 5 + ((target - (rotation % 360)) % 360);
    wheel.style.transform = `rotate(${rotation}deg)`;
    setTimeout(() => {
      grant(prize, "wheel");
      markWheelSpun();
      toast(`The wheel landed on <b>◆ ${fmt(prize)}</b>!`, "win", 4200);
      tickTimer();
    }, 5200);
  });
}

/* ---------- QUESTS ---------- */
export function renderQuests(content) {
  content.innerHTML = `
    <div style="max-width:760px;margin:0 auto 18px;text-align:center">
      <h2 style="font-size:24px">Casino Quests</h2>
      <p style="color:var(--text-dim)">Complete quests to earn free Value</p>
    </div>
    <div class="quest-list" id="questList"></div>
  `;
  const list = content.querySelector("#questList");

  function draw() {
    list.innerHTML = QUESTS.map((q) => {
      const st = state.quests[q.id] || { progress: 0, claimed: false };
      const done = st.progress >= q.target;
      const pct = q.target === 0 ? 100 : Math.min(100, (st.progress / q.target) * 100);
      let btn;
      if (st.claimed) btn = `<button class="quest-claim claimed" disabled>✓ Claimed</button>`;
      else if (done) btn = `<button class="quest-claim" data-claim="${q.id}">Claim</button>`;
      else btn = `<button class="quest-claim" disabled>Claim</button>`;
      return `
        <div class="quest-card">
          <div class="quest-ico">${icon(q.icon, "quest-ico-svg")}</div>
          <div class="quest-info">
            <div class="quest-name">${esc(q.name)}</div>
            <div class="quest-desc">${esc(q.desc)}</div>
            <div class="quest-bar"><div class="quest-bar-fill" style="width:${st.claimed ? 100 : pct}%"></div></div>
            <div class="quest-progress-label">${q.target === 0 ? "Ready to claim" : `${fmt(Math.min(st.progress, q.target))} / ${fmt(q.target)}`}</div>
          </div>
          <div class="quest-reward">
            <div class="quest-reward-amount">◆ ${fmt(q.reward)}</div>
            ${btn}
          </div>
        </div>`;
    }).join("");

    list.querySelectorAll("[data-claim]").forEach((b) => {
      b.addEventListener("click", () => {
        const q = QUESTS.find((x) => x.id === b.dataset.claim);
        if (claimQuest(q.id, q.reward)) {
          toast(`Quest complete! <b>+◆ ${fmt(q.reward)}</b>`, "win");
          draw();
        }
      });
    });
  }
  draw();
}

/* ---------- PROFILE ---------- */
export function renderProfile(content) {
  const lv = level();
  const hist = state.history.slice(0, 15);
  content.innerHTML = `
    <div class="profile-wrap">
      <div class="profile-card">
        <div class="profile-ava">${initialsAvatar(state.username, "mono-ava-lg")}</div>
        <div>
          <div class="profile-name">${esc(state.username)}</div>
          <div class="profile-level">Level ${lv} · ${fmt(state.xp)} XP</div>
          <div class="xp-bar"><div class="xp-fill" style="width:${Math.round(levelProgress() * 100)}%"></div></div>
        </div>
      </div>
      <div class="stat-grid">
        <div class="stat-card"><b>◆ ${fmt(state.balance)}</b><span>BALANCE</span></div>
        <div class="stat-card"><b>${fmt(state.stats.gamesPlayed)}</b><span>GAMES PLAYED</span></div>
        <div class="stat-card"><b>◆ ${fmt(state.stats.wagered)}</b><span>TOTAL WAGERED</span></div>
        <div class="stat-card"><b>◆ ${fmt(state.stats.won)}</b><span>TOTAL WON</span></div>
        <div class="stat-card"><b>◆ ${fmt(state.stats.biggestWin)}</b><span>BIGGEST WIN</span></div>
      </div>
      <div class="game-frame">
        <h3 style="margin-bottom:10px">Recent Bets</h3>
        ${hist.length ? `
        <table class="history-table">
          <thead><tr><th>GAME</th><th>BET</th><th>PAYOUT</th><th>RESULT</th></tr></thead>
          <tbody>
            ${hist.map((h) => `
              <tr>
                <td>${esc(h.game)}</td>
                <td>◆ ${fmt(h.bet)}</td>
                <td>◆ ${fmt(h.payout)}</td>
                <td class="${h.payout >= h.bet && h.payout > 0 ? "h-win" : "h-lose"}">${h.payout > 0 ? (h.payout >= h.bet ? "WIN" : "PARTIAL") : "LOSS"}</td>
              </tr>`).join("")}
          </tbody>
        </table>` : `<p style="color:var(--text-dim)">No bets yet — go play something!</p>`}
      </div>
    </div>
  `;
}

/* ---------- PROVIDERS / TOURNAMENTS / SUPPORT ---------- */
export function renderProviders(content) {
  content.innerHTML = `
    <section class="section">
      <div class="section-head"><div class="section-title">${icon("building")}Providers</div></div>
      <div class="tile-grid">
        ${PROVIDERS.map((p) => `
          <button class="plain-tile" data-nav="#/">
            <div class="pt-ico">${icon(p.icon, "pt-ico-svg")}</div>
            <div class="pt-name">${esc(p.name)}</div>
            <div class="pt-sub">${p.games} games</div>
          </button>`).join("")}
      </div>
    </section>
  `;
}

export function renderTournaments(content) {
  const events = [
    { icon: "swords", name: "Daily Battle", sub: "Prize pool ◆ 100,000 · ends in 6h" },
    { icon: "trophy", name: "Weekend Race", sub: "Prize pool ◆ 500,000 · starts Saturday" },
    { icon: "slots", name: "Slots Marathon", sub: "Top wager wins ◆ 250,000" },
    { icon: "crash", name: "Crash Masters", sub: "Highest multiplier of the day wins ◆ 50,000" },
  ];
  content.innerHTML = `
    <section class="section">
      <div class="section-head"><div class="section-title">${icon("trophy")}Tournaments & Events</div></div>
      <div class="tile-grid">
        ${events.map((e) => `
          <div class="plain-tile">
            <div class="pt-ico">${icon(e.icon, "pt-ico-svg")}</div>
            <div class="pt-name">${esc(e.name)}</div>
            <div class="pt-sub">${esc(e.sub)}</div>
          </div>`).join("")}
      </div>
      <div class="info-page"><p>Tournament play launches soon — keep grinding Value in the meantime.</p></div>
    </section>
  `;
}

export function renderSupport(content) {
  content.innerHTML = `
    <div class="info-page">
      ${icon("headset", "info-ico")}
      <h2>Support</h2>
      <p>GhostCasino is a play-for-fun casino. All balances are in <b style="color:var(--gold)">Value ◆</b> — a virtual currency with no real-world worth.</p>
      <br/>
      <p>Out of Value? Spin the <a href="#/wheel" style="color:var(--accent-2)">Daily Wheel</a> or complete <a href="#/quests" style="color:var(--accent-2)">Quests</a>.</p>
    </div>
  `;
}
