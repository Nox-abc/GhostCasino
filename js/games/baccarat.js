// Baccarat — bet Player / Banker / Tie, simplified third-card rule.

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";

const SUITS = ["♠", "♥", "♦", "♣"];

function drawCard() {
  const rank = Math.floor(Math.random() * 13) + 1; // 1..13
  const label = rank === 1 ? "A" : rank === 11 ? "J" : rank === 12 ? "Q" : rank === 13 ? "K" : String(rank);
  return { label, s: SUITS[Math.floor(Math.random() * 4)], points: rank >= 10 ? 0 : rank };
}

function total(hand) { return hand.reduce((a, c) => a + c.points, 0) % 10; }
function cardHTML(c) { return `<span class="pcard"><b>${c.label}</b><i>${c.s}</i></span>`; }

const BETS = [
  { id: "player", label: "PLAYER", sub: "pays 2×", pays: 2 },
  { id: "banker", label: "BANKER", sub: "pays 1.95×", pays: 1.95 },
  { id: "tie",    label: "TIE",    sub: "pays 9×", pays: 9 },
];

export function renderBaccarat(container) {
  container.innerHTML = `
    <div class="bj-table">
      <div class="bj-row">
        <div class="bj-label">PLAYER <span class="bj-total" id="bacPlayerTotal"></span></div>
        <div class="bj-cards" id="bacPlayer"></div>
      </div>
      <div class="bj-row">
        <div class="bj-label">BANKER <span class="bj-total" id="bacBankerTotal"></span></div>
        <div class="bj-cards" id="bacBanker"></div>
      </div>
      <div class="bac-bets">
        ${BETS.map((b, i) => `<button class="bac-bet${i === 0 ? " selected" : ""}" data-bet="${b.id}">${b.label}<small>${b.sub}</small></button>`).join("")}
      </div>
    </div>
  `;
  const pEl = container.querySelector("#bacPlayer");
  const bEl = container.querySelector("#bacBanker");
  const pTot = container.querySelector("#bacPlayerTotal");
  const bTot = container.querySelector("#bacBankerTotal");
  const result = resultLine();

  let selected = "player", dealing = false;
  container.querySelectorAll(".bac-bet").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (dealing) return;
      selected = btn.dataset.bet;
      container.querySelectorAll(".bac-bet").forEach((b) => b.classList.toggle("selected", b === btn));
    });
  });

  const bar = betBar({
    action: "DEAL",
    onAction() {
      if (dealing) return;
      const bet = bar.getBet();
      if (!placeBet(bet, "baccarat")) { toast("Not enough Value", "info"); return; }
      dealing = true;
      bar.setDisabled(true);
      result.set("Dealing…", "");
      pEl.innerHTML = bEl.innerHTML = "";
      pTot.textContent = bTot.textContent = "";

      const player = [drawCard(), drawCard()];
      const banker = [drawCard(), drawCard()];
      // Simplified third-card rule: draw if total <= 5 (no natural on either side)
      const natural = total(player) >= 8 || total(banker) >= 8;
      if (!natural && total(player) <= 5) player.push(drawCard());
      if (!natural && total(banker) <= 5) banker.push(drawCard());

      // Reveal cards one by one
      const seq = [];
      player.forEach((c, i) => seq.push(() => { pEl.innerHTML += cardHTML(c); pTot.textContent = total(player.slice(0, i + 1)); }));
      banker.forEach((c, i) => seq.push(() => { bEl.innerHTML += cardHTML(c); bTot.textContent = total(banker.slice(0, i + 1)); }));
      seq.forEach((fn, i) => setTimeout(fn, 350 * i));

      setTimeout(() => {
        const pt = total(player), bt = total(banker);
        const outcome = pt > bt ? "player" : bt > pt ? "banker" : "tie";
        const betDef = BETS.find((x) => x.id === selected);
        const won = outcome === selected;
        const payout = won ? Math.floor(bet * betDef.pays) : 0;
        settle("Baccarat", bet, payout);
        const outLabel = outcome === "tie" ? `TIE ${pt}–${bt}` : `${outcome.toUpperCase()} wins ${Math.max(pt, bt)}–${Math.min(pt, bt)}`;
        if (won) {
          result.set(`${outLabel} — WIN ◆ ${fmt(payout)}`, "win");
          toast(`Baccarat paid <b>◆ ${fmt(payout)}</b>`, "win");
        } else {
          result.set(`${outLabel} — no win`, "lose");
        }
        dealing = false;
        bar.setDisabled(false);
      }, 350 * seq.length + 400);
    },
  });

  container.appendChild(bar.root);
  container.appendChild(result);
}
