// Limbo — pick a target multiplier; the roll must reach it. Win chance = 99% / target.

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";

export function renderLimbo(container) {
  container.innerHTML = `
    <div class="limbo-stage">
      <div class="limbo-display" id="limboDisplay">1.00×</div>
      <div class="dice-stats-row">
        <div class="mstat">
          <b><input type="number" id="limboTarget" class="limbo-target" value="2.00" min="1.01" max="1000" step="0.01" /></b>
          <span>TARGET ×</span>
        </div>
        <div class="mstat"><b id="limboChance">49.50%</b><span>WIN CHANCE</span></div>
      </div>
      <div class="crash-history" id="limboHistory" style="justify-content:center"></div>
    </div>
  `;
  const display = container.querySelector("#limboDisplay");
  const targetInput = container.querySelector("#limboTarget");
  const chanceEl = container.querySelector("#limboChance");
  const history = container.querySelector("#limboHistory");
  const result = resultLine();

  function target() { return Math.min(1000, Math.max(1.01, +targetInput.value || 2)); }
  function syncChance() { chanceEl.textContent = (99 / target()).toFixed(2) + "%"; }
  targetInput.addEventListener("input", syncChance);
  syncChance();

  let rolling = false;
  const bar = betBar({
    action: "ROLL",
    onAction() {
      if (rolling) return;
      const bet = bar.getBet();
      if (!placeBet(bet, "limbo")) { toast("Not enough Value", "info"); return; }
      rolling = true;
      bar.setDisabled(true);
      result.set("", "");
      display.className = "limbo-display limbo-rolling";

      // Result distribution: r = 0.99 / U, capped
      const roll = Math.min(10000, Math.floor((0.99 / Math.random()) * 100) / 100);
      const t = target();

      // Quick number scramble animation
      let ticks = 0;
      const scramble = setInterval(() => {
        display.textContent = (1 + Math.random() * Math.min(roll * 1.5, 30)).toFixed(2) + "×";
        if (++ticks >= 10) {
          clearInterval(scramble);
          const won = roll >= t;
          const payout = won ? Math.floor(bet * t) : 0;
          settle("Limbo", bet, payout);
          display.textContent = roll.toFixed(2) + "×";
          display.className = "limbo-display " + (won ? "limbo-win" : "limbo-lose");

          const tag = document.createElement("span");
          tag.className = "crash-tag " + (won ? "good" : "bad");
          tag.textContent = roll.toFixed(2) + "×";
          history.prepend(tag);
          while (history.children.length > 12) history.lastChild.remove();

          if (won) {
            result.set(`Rolled ${roll.toFixed(2)}× — WIN ◆ ${fmt(payout)}`, "win");
            toast(`Limbo paid <b>◆ ${fmt(payout)}</b>`, "win");
          } else {
            result.set(`Rolled ${roll.toFixed(2)}× — under ${t.toFixed(2)}×`, "lose");
          }
          rolling = false;
          bar.setDisabled(false);
        }
      }, 70);
    },
  });

  container.appendChild(bar.root);
  container.appendChild(result);
}
