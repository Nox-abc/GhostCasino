// Coinflip — heads or tails, 1.96× payout.

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";

export function renderCoinflip(container) {
  container.innerHTML = `
    <div class="coin-stage">
      <div class="coin">H</div>
      <div class="coin-choices">
        <button class="coin-choice selected" data-side="heads">HEADS</button>
        <button class="coin-choice" data-side="tails">TAILS</button>
      </div>
    </div>
  `;
  const coin = container.querySelector(".coin");
  const choices = [...container.querySelectorAll(".coin-choice")];
  const result = resultLine();
  let side = "heads";
  let flipping = false;

  choices.forEach((btn) => btn.addEventListener("click", () => {
    if (flipping) return;
    side = btn.dataset.side;
    choices.forEach((b) => b.classList.toggle("selected", b === btn));
  }));

  const bar = betBar({
    action: "FLIP",
    onAction() {
      if (flipping) return;
      const bet = bar.getBet();
      if (!placeBet(bet, "coinflip")) { toast("Not enough Value", "info"); return; }
      flipping = true;
      bar.setDisabled(true);
      result.set("", "");
      coin.classList.add("flipping");

      const outcome = Math.random() < 0.5 ? "heads" : "tails";
      setTimeout(() => {
        coin.classList.remove("flipping");
        coin.textContent = outcome === "heads" ? "H" : "T";
        const won = outcome === side;
        const payout = won ? Math.floor(bet * 1.96) : 0;
        settle("Coinflip", bet, payout);
        if (won) {
          result.set(`${outcome.toUpperCase()} — WIN ◆ ${fmt(payout)}`, "win");
          toast(`Coinflip paid <b>◆ ${fmt(payout)}</b>!`, "win");
        } else {
          result.set(`${outcome.toUpperCase()} — you picked ${side}`, "lose");
        }
        flipping = false;
        bar.setDisabled(false);
      }, 1400);
    },
  });

  container.appendChild(bar.root);
  container.appendChild(result);
}
