// Crash — bet, watch the multiplier climb, cash out before it busts.

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";
import { icon } from "../icons.js";

// House-edged crash point: 4% instant bust, otherwise heavy-tailed distribution.
function crashPoint() {
  if (Math.random() < 0.04) return 1.0;
  const r = Math.random();
  return Math.max(1.0, Math.floor((0.96 / (1 - r)) * 100) / 100);
}

export function renderCrash(container) {
  container.innerHTML = `
    <div class="crash-stage">
      ${[20, 40, 60, 80].map((p) => `<div class="crash-grid-line" style="top:${p}%"></div>`).join("")}
      <span class="crash-rocket" style="left:4%;bottom:6%">${icon("rocket", "crash-rocket-ico")}</span>
      <div class="crash-multiplier">1.00×</div>
    </div>
    <div class="crash-history"></div>
  `;
  const multEl = container.querySelector(".crash-multiplier");
  const rocket = container.querySelector(".crash-rocket");
  const history = container.querySelector(".crash-history");
  const result = resultLine();

  let phase = "idle"; // idle | flying
  let raf = null;
  let curBet = 0;

  const bar = betBar({
    action: "LAUNCH",
    onAction() {
      if (phase === "idle") start();
      else cashOut();
    },
  });

  function setRocket(progress) {
    rocket.style.left = 4 + Math.min(progress, 1) * 78 + "%";
    rocket.style.bottom = 6 + Math.min(progress, 1) * 70 + "%";
    rocket.style.transform = `rotate(${45 - 45 * Math.min(progress, 1)}deg)`;
  }

  function start() {
    const bet = bar.getBet();
    if (!placeBet(bet, "crash")) { toast("Not enough Value", "info"); return; }
    curBet = bet;
    phase = "flying";
    result.set("", "");
    bar.actionBtn.textContent = "CASH OUT";
    bar.actionBtn.classList.add("cashout");
    bar.root.querySelector(".bet-input").disabled = true;
    bar.root.querySelectorAll(".bet-chip").forEach((c) => (c.disabled = true));

    const bust = crashPoint();
    const t0 = performance.now();
    multEl.className = "crash-multiplier flying";

    function tick(now) {
      const t = (now - t0) / 1000;
      const mult = Math.pow(1.09, t * 3.4); // accelerating curve
      if (mult >= bust) { explode(bust); return; }
      multEl.textContent = mult.toFixed(2) + "×";
      bar.actionBtn.textContent = `CASH OUT ◆ ${fmt(curBet * mult)}`;
      setRocket(Math.log(mult) / Math.log(30));
      multEl.dataset.mult = mult;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }

  function cashOut() {
    if (phase !== "flying") return;
    cancelAnimationFrame(raf);
    const mult = Math.max(1, +multEl.dataset.mult || 1);
    const payout = Math.floor(curBet * mult);
    settle("Crash", curBet, payout);
    multEl.className = "crash-multiplier cashed";
    multEl.textContent = mult.toFixed(2) + "× ✓";
    result.set(`Cashed out at ${mult.toFixed(2)}× — WIN ◆ ${fmt(payout)}`, "win");
    toast(`Cashed out <b>◆ ${fmt(payout)}</b> at ${mult.toFixed(2)}×!`, "win");
    addTag(mult, true);
    reset();
  }

  function explode(bust) {
    settle("Crash", curBet, 0);
    multEl.className = "crash-multiplier crashed";
    multEl.textContent = bust.toFixed(2) + "×";
    rocket.innerHTML = icon("burst", "crash-rocket-ico crash-burst");
    result.set(`Crashed at ${bust.toFixed(2)}×`, "lose");
    addTag(bust, false);
    reset();
  }

  function addTag(mult, good) {
    const tag = document.createElement("span");
    tag.className = "crash-tag " + (good ? "good" : mult >= 2 ? "good" : "bad");
    tag.textContent = mult.toFixed(2) + "×";
    history.prepend(tag);
    while (history.children.length > 14) history.lastChild.remove();
  }

  function reset() {
    phase = "idle";
    bar.actionBtn.textContent = "LAUNCH";
    bar.actionBtn.classList.remove("cashout");
    bar.root.querySelector(".bet-input").disabled = false;
    bar.root.querySelectorAll(".bet-chip").forEach((c) => (c.disabled = false));
    setTimeout(() => {
      if (phase === "idle") { rocket.innerHTML = icon("rocket", "crash-rocket-ico"); setRocket(0); }
    }, 1600);
  }

  container.appendChild(bar.root);
  container.appendChild(result);
}
