// Shared UI helpers: toasts, balance display, bet bar, live-wins ticker, chat sim.

import { state, fmt, subscribe } from "./state.js";
import { FAKE_PLAYERS, CHAT_LINES, WIN_GAMES, rand, randInt } from "./data.js";
import { icon } from "./icons.js";

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Monochrome initials avatar ---------- */
export function initialsAvatar(name, cls = "") {
  const parts = String(name).trim().split(/[\s_]+/).filter(Boolean);
  const initials = (parts.length > 1 ? parts[0][0] + parts[1][0] : String(name).slice(0, 2)).toUpperCase();
  return `<span class="mono-ava${cls ? " " + cls : ""}">${esc(initials)}</span>`;
}

/* ---------- Toasts ---------- */
export function toast(msg, type = "info", ms = 3200) {
  const box = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = msg;
  box.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 0.3s"; setTimeout(() => el.remove(), 320); }, ms);
}

/* ---------- Balance in topbar ---------- */
let lastBalance = state.balance;
export function initBalance() {
  const el = document.getElementById("balanceAmount");
  el.textContent = fmt(state.balance);
  subscribe(() => {
    if (state.balance === lastBalance) return;
    const up = state.balance > lastBalance;
    lastBalance = state.balance;
    el.textContent = fmt(state.balance);
    el.classList.remove("bump-up", "bump-down");
    void el.offsetWidth; // restart animation
    el.classList.add(up ? "bump-up" : "bump-down");
  });
}

/* ---------- Bet bar (shared by all games) ---------- */
export function betBar({ action = "PLAY", defaultBet = 100, onAction }) {
  const root = document.createElement("div");
  root.className = "bet-bar";
  root.innerHTML = `
    <span class="bet-label">BET</span>
    <div class="bet-input-wrap">
      <span class="value-coin">◆</span>
      <input class="bet-input" type="number" min="1" step="1" value="${defaultBet}" />
    </div>
    <button class="bet-chip" data-op="half">½</button>
    <button class="bet-chip" data-op="double">2×</button>
    <button class="bet-chip" data-op="100">100</button>
    <button class="bet-chip" data-op="500">500</button>
    <button class="bet-chip" data-op="max">MAX</button>
    <button class="spin-btn">${action}</button>
  `;
  const input = root.querySelector(".bet-input");
  const btn = root.querySelector(".spin-btn");

  root.querySelectorAll(".bet-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const cur = Math.max(1, Math.floor(+input.value || 0));
      const op = chip.dataset.op;
      if (op === "half") input.value = Math.max(1, Math.floor(cur / 2));
      else if (op === "double") input.value = Math.min(state.balance, cur * 2) || cur * 2;
      else if (op === "max") input.value = Math.max(1, Math.floor(state.balance));
      else input.value = +op;
    });
  });

  btn.addEventListener("click", () => onAction && onAction());

  return {
    root,
    actionBtn: btn,
    getBet() {
      const v = Math.floor(+input.value || 0);
      return v > 0 ? v : 0;
    },
    setDisabled(dis) {
      btn.disabled = dis;
      input.disabled = dis;
      root.querySelectorAll(".bet-chip").forEach((c) => (c.disabled = dis));
    },
  };
}

export function resultLine() {
  const el = document.createElement("div");
  el.className = "game-result";
  el.set = (text, cls) => { el.textContent = text; el.className = "game-result" + (cls ? " " + cls : ""); };
  return el;
}

/* ---------- Live wins ticker ---------- */
export function startLiveWins(container) {
  function winCard() {
    const g = rand(WIN_GAMES);
    const amount = [randInt(500, 9000), randInt(1000, 25000), randInt(4000, 80000)][randInt(0, 2)];
    const el = document.createElement("div");
    el.className = "win-card";
    el.innerHTML = `
      <div class="win-thumb" style="background:${g.bg}">${icon(g.icon, "win-thumb-ico")}</div>
      <div class="win-info">
        <div class="win-amount"><span class="value-coin">◆</span> ${fmt(amount)}</div>
        <div class="win-game">${esc(g.name)}</div>
        <div class="win-player">${esc(rand(FAKE_PLAYERS))}</div>
      </div>`;
    return el;
  }
  for (let i = 0; i < 8; i++) container.appendChild(winCard());
  const timer = setInterval(() => {
    if (!container.isConnected) { clearInterval(timer); return; }
    container.prepend(winCard());
    while (container.children.length > 9) container.lastChild.remove();
  }, randInt(2500, 4000));
}

/* ---------- Chat simulation ---------- */
function timeNow() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function addChatMessage(name, text, self = false) {
  const body = document.getElementById("chatBody");
  const el = document.createElement("div");
  el.className = "chat-msg" + (self ? " self" : "");
  el.innerHTML = `
    <div class="chat-ava">${initialsAvatar(name)}</div>
    <div class="chat-bubble">
      <div class="chat-name">${esc(name)}<span class="chat-time">${timeNow()}</span></div>
      <div class="chat-text">${esc(text)}</div>
    </div>`;
  body.appendChild(el);
  while (body.children.length > 40) body.firstChild.remove();
  body.scrollTop = body.scrollHeight;
}

export function initChat() {
  for (let i = 0; i < 6; i++) addChatMessage(rand(FAKE_PLAYERS), rand(CHAT_LINES));

  setInterval(() => addChatMessage(rand(FAKE_PLAYERS), rand(CHAT_LINES)), randInt(8000, 14000));

  const onlineEl = document.getElementById("chatOnline");
  let online = 1324;
  setInterval(() => {
    online = Math.max(900, online + randInt(-18, 22));
    onlineEl.textContent = online.toLocaleString("en-US");
  }, 5000);

  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addChatMessage(state.username, text, true);
    input.value = "";
  });
}
