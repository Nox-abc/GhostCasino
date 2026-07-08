// Keno — pick up to 10 of 40 numbers, 10 are drawn.

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";

const TOTAL = 40, DRAWN = 10, MAX_PICKS = 10;

// Multiplier table: PAYTABLE[picks][hits]
const PAYTABLE = {
  1:  { 1: 3.8 },
  2:  { 2: 9 },
  3:  { 2: 2, 3: 25 },
  4:  { 2: 1, 3: 8, 4: 80 },
  5:  { 3: 3, 4: 20, 5: 250 },
  6:  { 3: 2, 4: 8, 5: 60, 6: 600 },
  7:  { 4: 5, 5: 22, 6: 150, 7: 1500 },
  8:  { 4: 3, 5: 12, 6: 60, 7: 400, 8: 4000 },
  9:  { 5: 8, 6: 30, 7: 150, 8: 1200, 9: 8000 },
  10: { 5: 5, 6: 18, 7: 80, 8: 500, 9: 2500, 10: 15000 },
};

export function renderKeno(container) {
  container.innerHTML = `
    <div class="keno-info">
      <div class="mstat"><b id="kenoPicks">0 / ${MAX_PICKS}</b><span>PICKED</span></div>
      <div class="mstat"><b id="kenoHits">–</b><span>HITS</span></div>
      <button class="bet-chip" id="kenoClear">Clear</button>
      <button class="bet-chip" id="kenoRandom">Random ×5</button>
    </div>
    <div class="keno-board" id="kenoBoard"></div>
    <div class="keno-paytable" id="kenoPay"></div>
  `;
  const board = container.querySelector("#kenoBoard");
  const picksEl = container.querySelector("#kenoPicks");
  const hitsEl = container.querySelector("#kenoHits");
  const payEl = container.querySelector("#kenoPay");
  const result = resultLine();

  const picked = new Set();
  let drawing = false;
  const cells = [];

  for (let n = 1; n <= TOTAL; n++) {
    const cell = document.createElement("button");
    cell.className = "keno-cell";
    cell.textContent = n;
    cell.addEventListener("click", () => {
      if (drawing) return;
      if (picked.has(n)) picked.delete(n);
      else if (picked.size < MAX_PICKS) picked.add(n);
      sync();
    });
    board.appendChild(cell);
    cells.push(cell);
  }

  function sync() {
    cells.forEach((c, i) => {
      c.classList.toggle("picked", picked.has(i + 1));
      c.classList.remove("hit", "drawn");
    });
    picksEl.textContent = `${picked.size} / ${MAX_PICKS}`;
    hitsEl.textContent = "–";
    const table = PAYTABLE[picked.size];
    payEl.innerHTML = table
      ? Object.entries(table).map(([h, m]) => `<span>${h} hits = ${m}×</span>`).join("")
      : `<span>Pick 1–${MAX_PICKS} numbers</span>`;
  }
  sync();

  container.querySelector("#kenoClear").addEventListener("click", () => { if (!drawing) { picked.clear(); sync(); } });
  container.querySelector("#kenoRandom").addEventListener("click", () => {
    if (drawing) return;
    picked.clear();
    while (picked.size < 5) picked.add(1 + Math.floor(Math.random() * TOTAL));
    sync();
  });

  const bar = betBar({
    action: "DRAW",
    onAction() {
      if (drawing) return;
      if (picked.size === 0) { toast("Pick some numbers first", "info"); return; }
      const bet = bar.getBet();
      if (!placeBet(bet, "keno")) { toast("Not enough Value", "info"); return; }
      drawing = true;
      bar.setDisabled(true);
      result.set("", "");
      cells.forEach((c) => c.classList.remove("hit", "drawn"));

      const drawn = new Set();
      while (drawn.size < DRAWN) drawn.add(1 + Math.floor(Math.random() * TOTAL));
      const drawnArr = [...drawn];

      drawnArr.forEach((n, i) => {
        setTimeout(() => {
          const cell = cells[n - 1];
          cell.classList.add(picked.has(n) ? "hit" : "drawn");
          const hits = drawnArr.slice(0, i + 1).filter((x) => picked.has(x)).length;
          hitsEl.textContent = hits;
          if (i === drawnArr.length - 1) finish(bet, hits);
        }, 260 * (i + 1));
      });
    },
  });

  function finish(bet, hits) {
    const mult = (PAYTABLE[picked.size] || {})[hits] || 0;
    const payout = Math.floor(bet * mult);
    settle("Keno", bet, payout);
    if (payout > 0) {
      result.set(`${hits} hits — WIN ◆ ${fmt(payout)} (${mult}×)`, "win");
      toast(`Keno paid <b>◆ ${fmt(payout)}</b>`, "win");
    } else {
      result.set(`${hits} hits — no win`, "lose");
    }
    drawing = false;
    bar.setDisabled(false);
  }

  container.appendChild(bar.root);
  container.appendChild(result);
}
