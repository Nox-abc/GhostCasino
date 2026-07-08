// Spirit Dice — roll over a chosen threshold (0–100).

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";

export function renderDice(container) {
  container.innerHTML = `
    <div class="dice-stage">
      <div class="dice-slider-wrap">
        <div class="dice-roll-marker" style="left:50%; opacity:0">–</div>
        <div class="dice-track"></div>
        <input type="range" class="dice-slider" min="2" max="96" value="50" />
        <div class="dice-handle" style="left:50%">50</div>
      </div>
      <div class="dice-stats-row">
        <div class="mstat"><b id="dTarget">Over 50.00</b><span>ROLL TARGET</span></div>
        <div class="mstat"><b id="dChance">50.00%</b><span>WIN CHANCE</span></div>
        <div class="mstat"><b id="dMult">1.98×</b><span>MULTIPLIER</span></div>
      </div>
    </div>
  `;

  const slider = container.querySelector(".dice-slider");
  const handle = container.querySelector(".dice-handle");
  const track = container.querySelector(".dice-track");
  const marker = container.querySelector(".dice-roll-marker");
  const dTarget = container.querySelector("#dTarget");
  const dChance = container.querySelector("#dChance");
  const dMult = container.querySelector("#dMult");
  const result = resultLine();

  function threshold() { return +slider.value; }
  function multiplier() { return Math.floor((99 / (100 - threshold())) * 100) / 100; } // 1% house edge

  function sync() {
    const t = threshold();
    handle.style.left = t + "%";
    handle.textContent = t;
    track.style.setProperty("--split", t + "%");
    dTarget.textContent = `Over ${t.toFixed(2)}`;
    dChance.textContent = (100 - t).toFixed(2) + "%";
    dMult.textContent = multiplier().toFixed(2) + "×";
  }
  slider.addEventListener("input", sync);
  sync();

  let rolling = false;
  const bar = betBar({
    action: "ROLL",
    onAction() {
      if (rolling) return;
      const bet = bar.getBet();
      if (!placeBet(bet, "dice")) { toast("Not enough Value", "info"); return; }
      rolling = true;
      bar.setDisabled(true);
      slider.disabled = true;
      result.set("Rolling…", "");

      const roll = Math.floor(Math.random() * 10000) / 100;
      marker.style.opacity = "1";
      marker.style.left = roll + "%";
      marker.textContent = roll.toFixed(2);

      setTimeout(() => {
        const won = roll > threshold();
        const payout = won ? Math.floor(bet * multiplier()) : 0;
        settle("Dice", bet, payout);
        marker.style.background = won ? "rgba(46,204,113,0.25)" : "rgba(255,71,87,0.25)";
        if (won) {
          result.set(`Rolled ${roll.toFixed(2)} — WIN ◆ ${fmt(payout)}`, "win");
          toast(`Dice paid <b>◆ ${fmt(payout)}</b>!`, "win");
        } else {
          result.set(`Rolled ${roll.toFixed(2)} — under ${threshold()}`, "lose");
        }
        rolling = false;
        bar.setDisabled(false);
        slider.disabled = false;
      }, 700);
    },
  });

  container.appendChild(bar.root);
  container.appendChild(result);
}
