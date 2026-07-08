// Tower — climb 8 floors, each has 3 tiles and 1 trap. Cash out anytime.

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";

const FLOORS = 8, TILES = 3;

function multAt(floor) { // floor = floors cleared
  return Math.max(1, 0.97 * Math.pow(1.5, floor));
}

export function renderTower(container) {
  container.innerHTML = `
    <div class="mines-stats">
      <div class="mstat"><b id="twMult">1.00×</b><span>CURRENT</span></div>
      <div class="mstat"><b id="twNext">1.46×</b><span>NEXT FLOOR</span></div>
      <div class="mstat"><b id="twFloor">0 / ${FLOORS}</b><span>FLOOR</span></div>
    </div>
    <div class="tower-board" id="towerBoard"></div>
  `;
  const board = container.querySelector("#towerBoard");
  const twMult = container.querySelector("#twMult");
  const twNext = container.querySelector("#twNext");
  const twFloor = container.querySelector("#twFloor");
  const result = resultLine();

  let playing = false, floor = 0, curBet = 0, traps = [];
  const rows = [];

  for (let f = FLOORS - 1; f >= 0; f--) {
    const row = document.createElement("div");
    row.className = "tower-row";
    row.dataset.floor = f;
    const label = document.createElement("span");
    label.className = "tower-mult";
    label.textContent = multAt(f + 1).toFixed(2) + "×";
    row.appendChild(label);
    for (let t = 0; t < TILES; t++) {
      const tile = document.createElement("button");
      tile.className = "tower-tile";
      tile.disabled = true;
      tile.addEventListener("click", () => step(f, t, tile));
      row.appendChild(tile);
    }
    board.appendChild(row);
    rows[f] = row;
  }

  function syncStats() {
    twMult.textContent = (floor === 0 ? 1 : multAt(floor)).toFixed(2) + "×";
    twNext.textContent = floor < FLOORS ? multAt(floor + 1).toFixed(2) + "×" : "MAX";
    twFloor.textContent = `${floor} / ${FLOORS}`;
  }

  function setActiveFloor() {
    rows.forEach((row, f) => {
      row.classList.toggle("tower-active", playing && f === floor);
      row.querySelectorAll(".tower-tile").forEach((t) => (t.disabled = !(playing && f === floor)));
    });
  }

  const bar = betBar({
    action: "START",
    onAction() {
      if (!playing) start();
      else cashOut();
    },
  });

  function start() {
    const bet = bar.getBet();
    if (!placeBet(bet, "tower")) { toast("Not enough Value", "info"); return; }
    curBet = bet;
    playing = true;
    floor = 0;
    traps = Array.from({ length: FLOORS }, () => Math.floor(Math.random() * TILES));
    rows.forEach((row) => row.querySelectorAll(".tower-tile").forEach((t) => {
      t.className = "tower-tile";
      t.textContent = "";
    }));
    result.set("", "");
    syncStats();
    setActiveFloor();
    bar.actionBtn.textContent = "CASH OUT";
    bar.actionBtn.classList.add("cashout");
    bar.actionBtn.disabled = true;
    bar.root.querySelector(".bet-input").disabled = true;
    bar.root.querySelectorAll(".bet-chip").forEach((c) => (c.disabled = true));
  }

  function step(f, t, tile) {
    if (!playing || f !== floor) return;
    if (traps[f] === t) {
      tile.classList.add("tower-trap");
      tile.textContent = "✕";
      playing = false;
      settle("Tower", curBet, 0);
      result.set(`Trap on floor ${f + 1} — better luck next climb`, "lose");
      revealFloor(f);
      endRound();
      return;
    }
    tile.classList.add("tower-safe");
    tile.textContent = "✓";
    floor++;
    syncStats();
    setActiveFloor();
    bar.actionBtn.disabled = false;
    bar.actionBtn.textContent = `CASH OUT ◆ ${fmt(curBet * multAt(floor))}`;
    if (floor === FLOORS) cashOut();
  }

  function revealFloor(f) {
    rows[f].querySelectorAll(".tower-tile").forEach((tile, i) => {
      if (traps[f] === i && !tile.textContent) { tile.classList.add("tower-trap"); tile.textContent = "✕"; tile.style.opacity = "0.5"; }
    });
  }

  function cashOut() {
    if (!playing || floor === 0) return;
    playing = false;
    const payout = Math.floor(curBet * multAt(floor));
    settle("Tower", curBet, payout);
    result.set(`Cashed out at floor ${floor} — WIN ◆ ${fmt(payout)}`, "win");
    toast(`Tower paid <b>◆ ${fmt(payout)}</b>`, "win");
    endRound();
  }

  function endRound() {
    setActiveFloor();
    bar.actionBtn.textContent = "START";
    bar.actionBtn.classList.remove("cashout");
    bar.actionBtn.disabled = false;
    bar.root.querySelector(".bet-input").disabled = false;
    bar.root.querySelectorAll(".bet-chip").forEach((c) => (c.disabled = false));
    setTimeout(() => rows.forEach((r) => r.querySelectorAll(".tower-tile").forEach((t) => (t.style.opacity = ""))), 2000);
  }

  syncStats();
  container.appendChild(bar.root);
  container.appendChild(result);
}
