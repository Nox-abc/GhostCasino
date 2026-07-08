// Case Opening — pick a case, spin the item reel, win the item's Value.
// Shared case definitions are also used by Case Battles.

import { placeBet, settle, fmt } from "../state.js";
import { betBar as _unused, resultLine, toast, esc } from "../ui.js";
import { icon } from "../icons.js";

export const CASES = [
  {
    id: "starter", name: "Starter Case", price: 250, accent: "#3498ff",
    items: [
      { n: "Scrap",    icon: "tag",     v: 50,   w: 36, r: 0 },
      { n: "Shard",    icon: "diamond", v: 130,  w: 30, r: 0 },
      { n: "Relic",    icon: "scroll",  v: 260,  w: 17, r: 1 },
      { n: "Prism",    icon: "gem",     v: 520,  w: 10, r: 1 },
      { n: "Crown",    icon: "crown",   v: 1200, w: 5.2, r: 2 },
      { n: "Phantom",  icon: "burst",   v: 3200, w: 1.8, r: 3 },
    ],
  },
  {
    id: "deluxe", name: "Deluxe Case", price: 1000, accent: "#8e44ff",
    items: [
      { n: "Token",    icon: "coin",    v: 200,  w: 34, r: 0 },
      { n: "Ingot",    icon: "tag",     v: 550,  w: 30, r: 0 },
      { n: "Chalice",  icon: "trophy",  v: 1100, w: 19, r: 1 },
      { n: "Scepter",  icon: "bolt",    v: 2200, w: 11, r: 2 },
      { n: "Halo",     icon: "sparkle", v: 5000, w: 4.6, r: 2 },
      { n: "Eclipse",  icon: "moon",    v: 14000, w: 1.4, r: 3 },
    ],
  },
  {
    id: "ghost", name: "Ghost Case", price: 5000, accent: "#ffc233",
    items: [
      { n: "Ember",    icon: "fire",    v: 1000,  w: 33, r: 0 },
      { n: "Vault",    icon: "case",    v: 2800,  w: 30, r: 0 },
      { n: "Meteor",   icon: "star",    v: 5500,  w: 19, r: 1 },
      { n: "Dynasty",  icon: "crown",   v: 11000, w: 11, r: 2 },
      { n: "Oblivion", icon: "moon",    v: 26000, w: 5.4, r: 2 },
      { n: "GHOST",    icon: "diamond", v: 75000, w: 1.6, r: 3 },
    ],
  },
];

export const RARITY = ["r-common", "r-rare", "r-epic", "r-legend"];

export function pickItem(caseDef) {
  const totalW = caseDef.items.reduce((a, i) => a + i.w, 0);
  let roll = Math.random() * totalW;
  for (const item of caseDef.items) {
    roll -= item.w;
    if (roll <= 0) return item;
  }
  return caseDef.items[0];
}

export function itemHTML(item, extra = "") {
  return `
    <div class="case-item ${RARITY[item.r]} ${extra}">
      ${icon(item.icon, "case-item-ico")}
      <span class="case-item-name">${esc(item.n)}</span>
      <span class="case-item-value">◆ ${fmt(item.v)}</span>
    </div>`;
}

export function renderCases(container) {
  container.innerHTML = `
    <div class="case-picker">
      ${CASES.map((c, i) => `
        <button class="case-option${i === 0 ? " selected" : ""}" data-case="${c.id}" style="--case-accent:${c.accent}">
          ${icon("case", "case-option-ico")}
          <span class="case-option-name">${esc(c.name)}</span>
          <span class="case-option-price">◆ ${fmt(c.price)}</span>
        </button>`).join("")}
    </div>
    <div class="case-reel-wrap">
      <div class="case-reel-marker"></div>
      <div class="case-reel" id="caseReel"></div>
    </div>
    <div class="case-contents" id="caseContents"></div>
    <div style="display:flex;justify-content:center;margin-top:16px">
      <button class="spin-btn" id="openCaseBtn">OPEN CASE</button>
    </div>
  `;
  const reel = container.querySelector("#caseReel");
  const contents = container.querySelector("#caseContents");
  const openBtn = container.querySelector("#openCaseBtn");
  const result = resultLine();
  container.appendChild(result);

  let selected = CASES[0];
  let opening = false;

  function showContents() {
    contents.innerHTML = `
      <div class="case-contents-title">Contains:</div>
      <div class="case-contents-row">${selected.items.map((i) => itemHTML(i)).join("")}</div>`;
    // Idle reel filler
    reel.style.transition = "none";
    reel.style.transform = "translateX(0)";
    reel.innerHTML = Array.from({ length: 12 }, () => itemHTML(pickItem(selected))).join("");
  }

  container.querySelectorAll(".case-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (opening) return;
      selected = CASES.find((c) => c.id === btn.dataset.case);
      container.querySelectorAll(".case-option").forEach((b) => b.classList.toggle("selected", b === btn));
      openBtn.textContent = `OPEN CASE — ◆ ${fmt(selected.price)}`;
      showContents();
    });
  });
  openBtn.textContent = `OPEN CASE — ◆ ${fmt(selected.price)}`;
  showContents();

  openBtn.addEventListener("click", () => {
    if (opening) return;
    if (!placeBet(selected.price, "cases")) { toast("Not enough Value", "info"); return; }
    opening = true;
    openBtn.disabled = true;
    result.set("", "");

    const winner = pickItem(selected);
    const STRIP = 40, WIN_IDX = 34;
    const items = Array.from({ length: STRIP }, (_, i) => (i === WIN_IDX ? winner : pickItem(selected)));
    reel.innerHTML = items.map((i, idx) => itemHTML(i, idx === WIN_IDX ? "case-win-slot" : "")).join("");

    // Each item is 112px wide + 8px gap = 120. Center the winner under the marker.
    const itemW = 120;
    const wrapW = reel.parentElement.clientWidth;
    const offset = WIN_IDX * itemW + itemW / 2 - wrapW / 2 - (Math.random() * 40 - 20);
    reel.style.transition = "none";
    reel.style.transform = "translateX(0)";
    void reel.offsetWidth;
    reel.style.transition = "transform 4.6s cubic-bezier(0.1, 0.8, 0.16, 1)";
    reel.style.transform = `translateX(${-offset}px)`;

    setTimeout(() => {
      settle(selected.name, selected.price, winner.v);
      reel.querySelector(".case-win-slot")?.classList.add("case-win-flash");
      const profit = winner.v >= selected.price;
      result.set(`You unboxed ${winner.n} — ◆ ${fmt(winner.v)}`, profit ? "win" : "lose");
      if (winner.r >= 2) toast(`Unboxed <b>${esc(winner.n)}</b> worth <b>◆ ${fmt(winner.v)}</b>!`, "win", 4500);
      opening = false;
      openBtn.disabled = false;
    }, 4800);
  });
}
