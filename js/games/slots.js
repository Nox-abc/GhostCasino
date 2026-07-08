// Ghost Slots — 3-reel slot machine with monochrome glyph symbols.

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";

// Payouts for 3-of-a-kind (multiplier on bet)
const PAY3 = { "♣": 4, "♠": 6, "♥": 10, "♦": 15, "★": 25, "7": 50, "G": 100 };
// Weighted reel strip — rarer symbols appear less
const STRIP = ["♣","♣","♣","♣","♣","♠","♠","♠","♠","♥","♥","♥","♦","♦","★","★","7","G"];

function pick() { return STRIP[Math.floor(Math.random() * STRIP.length)]; }

export function renderSlots(container) {
  container.innerHTML = `
    <div class="slot-machine">
      ${[0,1,2].map(() => `<div class="reel"><span class="reel-symbol">G</span></div>`).join("")}
    </div>
    <div class="paytable">
      ${Object.entries(PAY3).map(([s, m]) => `<span>${s} ${s} ${s} = ${m}×</span>`).join("")}
      <span>Any two G = 2×</span>
    </div>
  `;
  const reels = [...container.querySelectorAll(".reel")];
  const result = resultLine();

  let spinning = false;
  const bar = betBar({
    action: "SPIN",
    onAction() {
      if (spinning) return;
      const bet = bar.getBet();
      if (!placeBet(bet, "slots")) { toast("Not enough Value", "info"); return; }
      spinning = true;
      bar.setDisabled(true);
      result.set("", "");
      reels.forEach((r) => { r.classList.remove("win-flash"); r.classList.add("spinning"); });

      const final = [pick(), pick(), pick()];
      final.forEach((sym, i) => {
        setTimeout(() => {
          reels[i].classList.remove("spinning");
          reels[i].querySelector(".reel-symbol").textContent = sym;
          if (i === 2) finish(final, bet);
        }, 900 + i * 550);
      });
    },
  });

  function finish(syms, bet) {
    let mult = 0;
    if (syms[0] === syms[1] && syms[1] === syms[2]) mult = PAY3[syms[0]];
    else if (syms.filter((s) => s === "G").length === 2) mult = 2;

    const payout = Math.floor(bet * mult);
    settle("Ghost Slots", bet, payout);

    if (payout > 0) {
      reels.forEach((r) => r.classList.add("win-flash"));
      result.set(`WIN ◆ ${fmt(payout)} (${mult}×)`, "win");
      toast(`Slots paid <b>◆ ${fmt(payout)}</b>!`, "win");
    } else {
      result.set("No luck — spin again!", "lose");
    }
    spinning = false;
    bar.setDisabled(false);
  }

  container.appendChild(bar.root);
  container.appendChild(result);
}
