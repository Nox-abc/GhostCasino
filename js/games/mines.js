// Phantom Mines — 5×5 grid, 5 mines. Reveal gems, cash out anytime.

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";

const SIZE = 25, MINES = 5;

// Fair multiplier for k safe picks with 5 mines in 25 cells, with a small house edge.
function multiplierFor(picks) {
  let m = 1;
  for (let i = 0; i < picks; i++) m *= (SIZE - i) / (SIZE - MINES - i);
  return Math.max(1, m * 0.97);
}

export function renderMines(container) {
  container.innerHTML = `
    <div class="mines-stats">
      <div class="mstat"><b id="mMult">1.00×</b><span>MULTIPLIER</span></div>
      <div class="mstat"><b id="mNext">–</b><span>NEXT PICK</span></div>
      <div class="mstat"><b id="mGems">0 / ${SIZE - MINES}</b><span>GEMS FOUND</span></div>
      <div class="mstat"><b>${MINES}</b><span>MINES</span></div>
    </div>
    <div class="mines-board"></div>
  `;
  const board = container.querySelector(".mines-board");
  const mMult = container.querySelector("#mMult");
  const mNext = container.querySelector("#mNext");
  const mGems = container.querySelector("#mGems");
  const result = resultLine();

  let playing = false, mines = new Set(), picks = 0, curBet = 0;

  const cells = [];
  for (let i = 0; i < SIZE; i++) {
    const cell = document.createElement("button");
    cell.className = "mine-cell";
    cell.disabled = true;
    cell.addEventListener("click", () => reveal(i));
    board.appendChild(cell);
    cells.push(cell);
  }

  const bar = betBar({
    action: "START",
    onAction() {
      if (!playing) start();
      else cashOut();
    },
  });

  function updateStats() {
    mMult.textContent = multiplierFor(picks).toFixed(2) + "×";
    mNext.textContent = multiplierFor(picks + 1).toFixed(2) + "×";
    mGems.textContent = `${picks} / ${SIZE - MINES}`;
  }

  function start() {
    const bet = bar.getBet();
    if (!placeBet(bet, "mines")) { toast("Not enough Value", "info"); return; }
    curBet = bet;
    playing = true;
    picks = 0;
    mines = new Set();
    while (mines.size < MINES) mines.add(Math.floor(Math.random() * SIZE));
    cells.forEach((c) => { c.className = "mine-cell"; c.textContent = ""; c.disabled = false; });
    result.set("", "");
    updateStats();
    bar.actionBtn.textContent = "CASH OUT";
    bar.actionBtn.classList.add("cashout");
    bar.actionBtn.disabled = true; // must reveal at least one cell
    bar.root.querySelector(".bet-input").disabled = true;
    bar.root.querySelectorAll(".bet-chip").forEach((c) => (c.disabled = true));
  }

  function reveal(i) {
    if (!playing || cells[i].textContent) return;
    if (mines.has(i)) {
      cells[i].classList.add("revealed-mine");
      cells[i].textContent = "✕";
      boom();
      return;
    }
    cells[i].classList.add("revealed-gem");
    cells[i].textContent = "✦";
    picks++;
    updateStats();
    bar.actionBtn.disabled = false;
    bar.actionBtn.textContent = `CASH OUT ◆ ${fmt(curBet * multiplierFor(picks))}`;
    if (picks === SIZE - MINES) cashOut(); // cleared the board
  }

  function boom() {
    playing = false;
    settle("Mines", curBet, 0);
    mines.forEach((m) => {
      if (!cells[m].textContent) { cells[m].classList.add("revealed-mine"); cells[m].textContent = "✕"; }
    });
    cells.forEach((c) => (c.disabled = true));
    result.set("Boom! You hit a mine.", "lose");
    endRound();
  }

  function cashOut() {
    if (!playing || picks === 0) return;
    playing = false;
    const payout = Math.floor(curBet * multiplierFor(picks));
    settle("Mines", curBet, payout);
    // Show remaining mines faded
    mines.forEach((m) => { cells[m].textContent = "✕"; cells[m].style.opacity = "0.45"; });
    cells.forEach((c) => (c.disabled = true));
    result.set(`Cashed out ${multiplierFor(picks).toFixed(2)}× — WIN ◆ ${fmt(payout)}`, "win");
    toast(`Mines paid <b>◆ ${fmt(payout)}</b>!`, "win");
    endRound();
  }

  function endRound() {
    bar.actionBtn.textContent = "START";
    bar.actionBtn.classList.remove("cashout");
    bar.actionBtn.disabled = false;
    bar.root.querySelector(".bet-input").disabled = false;
    bar.root.querySelectorAll(".bet-chip").forEach((c) => (c.disabled = false));
    setTimeout(() => cells.forEach((c) => (c.style.opacity = "")), 2000);
  }

  updateStats();
  container.appendChild(bar.root);
  container.appendChild(result);
}
