// App bootstrap: sidebar/topbar rendering, hash router, search, welcome bonus.

import { state, markWelcomed, fmt } from "./state.js";
import { GAMES } from "./data.js";
import { icon } from "./icons.js";
import { initBalance, initChat, toast, esc } from "./ui.js";
import {
  renderHome, renderCategory, renderGame, renderWheel,
  renderQuests, renderProfile, renderProviders, renderTournaments, renderSupport,
} from "./views.js";

const content = document.getElementById("content");
const app = document.getElementById("app");

/* ---------- Sidebar nav (one icon = one game; minis grouped) ---------- */
const NAV = [
  { icon: "grid", label: "All Games", route: "/", primary: true },
  { icon: "slots", label: "Slots", route: "/game/slots" },
  { icon: "roulette", label: "Roulette", route: "/game/roulette" },
  { icon: "cards", label: "Blackjack", route: "/game/blackjack" },
  { icon: "baccarat", label: "Baccarat", route: "/game/baccarat" },
  { icon: "crash", label: "Crash", route: "/game/crash" },
  { icon: "case", label: "Case Opening", route: "/game/cases" },
  { icon: "swords", label: "Case Battles", route: "/game/casebattle" },
  { icon: "jackpot", label: "Jackpot", route: "/game/jackpot" },
  {
    icon: "mini", label: "Mini Games", group: "minis", children: [
      { icon: "mines", label: "Mines", route: "/game/mines" },
      { icon: "dice", label: "Dice", route: "/game/dice" },
      { icon: "coin", label: "Coinflip", route: "/game/coinflip" },
      { icon: "keno", label: "Keno", route: "/game/keno" },
      { icon: "plinko", label: "Plinko", route: "/game/plinko" },
      { icon: "tower", label: "Tower", route: "/game/tower" },
      { icon: "limbo", label: "Limbo", route: "/game/limbo" },
    ],
  },
  { sep: true },
  { icon: "building", label: "Providers", route: "/providers" },
  { icon: "trophy", label: "Tournaments", route: "/tournaments" },
  { icon: "headset", label: "Support", route: "/support" },
];

const MINI_ROUTES = NAV.find((n) => n.group)?.children.map((c) => c.route) || [];

function renderSidebar() {
  const nav = document.getElementById("sideNav");
  nav.innerHTML = NAV.map((item) => {
    if (item.sep) return `<div class="side-sep"></div>`;
    if (item.group) {
      return `
        <button class="side-link side-group-toggle" id="miniToggle" title="Mini Games">
          ${icon(item.icon, "side-ico")}<span class="side-label">${item.label}</span>
          <span class="side-caret">${icon("chevron")}</span>
        </button>
        <div class="side-submenu" id="miniSubmenu">
          ${item.children.map((c) => `
            <a href="#${c.route}" class="side-link side-sub-link" data-route="${c.route}" title="${c.label}">
              ${icon(c.icon, "side-ico")}<span class="side-label">${c.label}</span>
            </a>`).join("")}
        </div>`;
    }
    return `
      <a href="#${item.route}" class="side-link${item.primary ? " side-link-primary" : ""}" data-route="${item.route}" title="${item.label}">
        ${icon(item.icon, "side-ico")}<span class="side-label">${item.label}</span>
      </a>`;
  }).join("");

  document.getElementById("miniToggle").addEventListener("click", () => {
    nav.classList.toggle("minis-open");
  });

  document.getElementById("sidebarPromos").innerHTML = `
    <button class="promo-tile promo-wheel" data-nav="#/wheel">
      <span class="promo-tile-label">WHEEL</span>
      <span class="promo-tile-art">${icon("wheel", "promo-ico")}</span>
    </button>
    <button class="promo-tile promo-quests" data-nav="#/quests">
      <span class="promo-tile-label">QUESTS</span>
      <span class="promo-tile-art">${icon("target", "promo-ico")}</span>
    </button>`;
}

function renderTopbarIcons() {
  document.getElementById("searchBtn").innerHTML = icon("search");
  document.getElementById("bonusesGift").innerHTML = icon("gift");
  document.getElementById("topAvatar").innerHTML = icon("user");
  document.getElementById("bellIco").innerHTML = icon("bell");
  document.getElementById("chatSend").innerHTML = icon("send");
}

/* ---------- Router ---------- */
function route() {
  const hash = location.hash.replace(/^#/, "") || "/";
  content.scrollTop = 0;

  let m;
  if (hash === "/") renderHome(content);
  else if ((m = hash.match(/^\/category\/(\w+)$/))) renderCategory(content, m[1]);
  else if ((m = hash.match(/^\/game\/(\w+)$/))) renderGame(content, m[1]);
  else if (hash === "/wheel") renderWheel(content);
  else if (hash === "/quests") renderQuests(content);
  else if (hash === "/profile") renderProfile(content);
  else if (hash === "/providers") renderProviders(content);
  else if (hash === "/tournaments") renderTournaments(content);
  else if (hash === "/support") renderSupport(content);
  else renderHome(content);

  // Active states in sidebar + topbar; auto-open minis group when a mini is active
  document.querySelectorAll("[data-route]").forEach((el) => {
    el.classList.toggle("active", el.dataset.route === hash);
  });
  if (MINI_ROUTES.includes(hash)) {
    document.getElementById("sideNav").classList.add("minis-open");
    document.getElementById("miniToggle").classList.add("active");
  } else {
    document.getElementById("miniToggle").classList.remove("active");
  }
}
window.addEventListener("hashchange", route);

/* ---------- Global click delegation for data-nav ---------- */
document.addEventListener("click", (e) => {
  const nav = e.target.closest("[data-nav]");
  if (nav) location.hash = nav.dataset.nav.replace(/^#/, "");
});

/* ---------- Sidebar & chat toggles ---------- */
document.getElementById("burger").addEventListener("click", () => app.classList.toggle("sidebar-collapsed"));
document.getElementById("chatCollapse").addEventListener("click", () => app.classList.add("chat-collapsed"));
document.getElementById("chatExpand").addEventListener("click", () => app.classList.remove("chat-collapsed"));

/* ---------- Search ---------- */
const overlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

function openSearch() {
  overlay.classList.add("open");
  searchInput.value = "";
  drawResults("");
  setTimeout(() => searchInput.focus(), 50);
}
function closeSearch() { overlay.classList.remove("open"); }

function drawResults(q) {
  const games = GAMES.filter((g) =>
    g.name.toLowerCase().includes(q) || g.provider.toLowerCase().includes(q)
  ).slice(0, 10);
  searchResults.innerHTML = games.map((g) => `
    <button class="search-result" data-game="${g.id}">
      <span class="sr-ico" style="background:${g.bg}">${icon(g.icon)}</span>
      <span><span class="sr-name">${esc(g.name)}</span><br/><span class="sr-provider">${esc(g.provider)}</span></span>
    </button>`).join("") || `<div style="color:var(--text-faint);text-align:center;padding:20px">No games found</div>`;
  searchResults.querySelectorAll("[data-game]").forEach((b) => {
    b.addEventListener("click", () => { closeSearch(); location.hash = "/game/" + b.dataset.game; });
  });
}

document.getElementById("searchBtn").addEventListener("click", openSearch);
document.getElementById("searchClose").addEventListener("click", closeSearch);
searchInput.addEventListener("input", () => drawResults(searchInput.value.trim().toLowerCase()));
overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSearch(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSearch();
  if (e.key === "/" && !overlay.classList.contains("open") && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    e.preventDefault();
    openSearch();
  }
});

/* ---------- Notifications bell ---------- */
const bellDot = document.getElementById("bellDot");
bellDot.classList.add("show");
document.getElementById("bellBtn").addEventListener("click", () => {
  bellDot.classList.remove("show");
  toast("No new notifications — spin the Daily Wheel for free Value!", "info");
});

/* ---------- Boot ---------- */
renderSidebar();
renderTopbarIcons();
initBalance();
initChat();
route();

if (!state.welcomed) {
  markWelcomed();
  setTimeout(() => {
    toast(`Welcome to <b>GhostCasino</b>! You start with <b>◆ ${fmt(state.balance)}</b> Value. Check the Quests tab for a welcome gift!`, "win", 6000);
  }, 800);
}
