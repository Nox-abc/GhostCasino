// Speed Roulette — European wheel, outside bets + green.

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

const BETS = [
  { id: "red",   label: "RED",   sub: "2×", cls: "rbet-red",   pays: 2, match: (n) => n !== 0 && RED.has(n) },
  { id: "black", label: "BLACK", sub: "2×", cls: "rbet-black", pays: 2, match: (n) => n !== 0 && !RED.has(n) },
  { id: "green", label: "0",     sub: "36×", cls: "rbet-green", pays: 36, match: (n) => n === 0 },
  { id: "odd",   label: "ODD",   sub: "2×", cls: "rbet-muted", pays: 2, match: (n) => n !== 0 && n % 2 === 1 },
  { id: "even",  label: "EVEN",  sub: "2×", cls: "rbet-muted", pays: 2, match: (n) => n !== 0 && n % 2 === 0 },
  { id: "low",   label: "1–18",  sub: "2×", cls: "rbet-muted", pays: 2, match: (n) => n >= 1 && n <= 18 },
  { id: "high",  label: "19–36", sub: "2×", cls: "rbet-muted", pays: 2, match: (n) => n >= 19 },
];

function colorOf(n) { return n === 0 ? "green" : RED.has(n) ? "red" : "black"; }

function wheelGradient() {
  const seg = 360 / WHEEL_ORDER.length;
  const stops = WHEEL_ORDER.map((n, i) => {
    const c = n === 0 ? "#2ecc71" : RED.has(n) ? "#c0392b" : "#1c1c26";
    return `${c} ${i * seg}deg ${(i + 1) * seg}deg`;
  });
  return `conic-gradient(${stops.join(",")})`;
}

export function renderRoulette(container) {
  container.innerHTML = `
    <div class="roulette-wrap">
      <div style="position:relative">
        <div class="roulette-pointer"></div>
        <div class="roulette-wheel" style="background:${wheelGradient()}">
          <div class="roulette-center"><span class="rc-num">–</span><span class="rc-label">RESULT</span></div>
        </div>
      </div>
      <div class="roulette-bets">
        <div class="rbet-row" data-row="1"></div>
        <div class="rbet-row" data-row="2"></div>
        <div class="rbet-row" data-row="3"></div>
      </div>
    </div>
    <div class="roulette-history"></div>
  `;

  const wheel = container.querySelector(".roulette-wheel");
  const rcNum = container.querySelector(".rc-num");
  const history = container.querySelector(".roulette-history");
  const rows = { 1: [0, 3], 2: [3, 5], 3: [5, 7] };

  let selected = "red";
  Object.entries(rows).forEach(([row, [a, b]]) => {
    const rowEl = container.querySelector(`[data-row="${row}"]`);
    BETS.slice(a, b).forEach((bet) => {
      const btn = document.createElement("button");
      btn.className = `rbet ${bet.cls}` + (bet.id === selected ? " selected" : "");
      btn.innerHTML = `${bet.label}<small>pays ${bet.sub}</small>`;
      btn.addEventListener("click", () => {
        selected = bet.id;
        container.querySelectorAll(".rbet").forEach((el) => el.classList.remove("selected"));
        btn.classList.add("selected");
      });
      rowEl.appendChild(btn);
    });
  });

  const result = resultLine();
  let spinning = false;
  let rotation = 0;

  const bar = betBar({
    action: "SPIN",
    onAction() {
      if (spinning) return;
      const bet = bar.getBet();
      if (!placeBet(bet, "roulette")) { toast("Not enough Value", "info"); return; }
      spinning = true;
      bar.setDisabled(true);
      result.set("Spinning…", "");
      rcNum.textContent = "…";

      const n = WHEEL_ORDER[Math.floor(Math.random() * WHEEL_ORDER.length)];
      const idx = WHEEL_ORDER.indexOf(n);
      const seg = 360 / WHEEL_ORDER.length;
      // Land pointer (top) on the middle of segment idx, plus extra full spins
      const target = 360 * 6 - (idx * seg + seg / 2);
      rotation += 360 * 6 + ((target - (rotation % 360)) % 360);
      wheel.style.transform = `rotate(${rotation}deg)`;

      setTimeout(() => {
        const betDef = BETS.find((b) => b.id === selected);
        const won = betDef.match(n);
        const payout = won ? bet * betDef.pays : 0;
        settle("Roulette", bet, payout);

        rcNum.textContent = n;
        rcNum.style.color = { red: "#e74c3c", black: "#f2f2f5", green: "#2ecc71" }[colorOf(n)];

        const chip = document.createElement("div");
        chip.className = `rh-chip rh-${colorOf(n)}`;
        chip.textContent = n;
        history.prepend(chip);
        while (history.children.length > 12) history.lastChild.remove();

        if (won) {
          result.set(`${n} ${colorOf(n).toUpperCase()} — WIN ◆ ${fmt(payout)}`, "win");
          toast(`Roulette paid <b>◆ ${fmt(payout)}</b>!`, "win");
        } else {
          result.set(`${n} ${colorOf(n).toUpperCase()} — no win`, "lose");
        }
        spinning = false;
        bar.setDisabled(false);
      }, 4400);
    },
  });

  container.appendChild(bar.root);
  container.appendChild(result);
}
