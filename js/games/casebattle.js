// Case Battles — you vs an opponent, 3 cases each, highest total takes everything.

import { placeBet, settle, state, fmt } from "../state.js";
import { resultLine, toast, esc, initialsAvatar } from "../ui.js";
import { icon } from "../icons.js";
import { CASES, pickItem, itemHTML } from "./cases.js";
import { FAKE_PLAYERS, rand } from "../data.js";

const ROUNDS = 3;

export function renderCaseBattle(container) {
  container.innerHTML = `
    <div class="case-picker">
      ${CASES.map((c, i) => `
        <button class="case-option${i === 0 ? " selected" : ""}" data-case="${c.id}" style="--case-accent:${c.accent}">
          ${icon("case", "case-option-ico")}
          <span class="case-option-name">${esc(c.name)}</span>
          <span class="case-option-price">◆ ${fmt(c.price)} × ${ROUNDS}</span>
        </button>`).join("")}
    </div>
    <div class="battle-arena">
      <div class="battle-side" id="battleYou">
        <div class="battle-player">${initialsAvatar(state.username)}<span>${esc(state.username)}</span></div>
        <div class="battle-total" id="youTotal">◆ 0</div>
        <div class="battle-drops" id="youDrops"></div>
      </div>
      <div class="battle-vs">${icon("swords", "battle-vs-ico")}<span>VS</span></div>
      <div class="battle-side" id="battleFoe">
        <div class="battle-player" id="foeName">${initialsAvatar("?")}<span>Waiting…</span></div>
        <div class="battle-total" id="foeTotal">◆ 0</div>
        <div class="battle-drops" id="foeDrops"></div>
      </div>
    </div>
    <div style="display:flex;justify-content:center;margin-top:16px">
      <button class="spin-btn" id="battleBtn">START BATTLE</button>
    </div>
  `;
  const btn = container.querySelector("#battleBtn");
  const youDrops = container.querySelector("#youDrops");
  const foeDrops = container.querySelector("#foeDrops");
  const youTotalEl = container.querySelector("#youTotal");
  const foeTotalEl = container.querySelector("#foeTotal");
  const foeNameEl = container.querySelector("#foeName");
  const result = resultLine();
  container.appendChild(result);

  let selected = CASES[0];
  let battling = false;

  function cost() { return selected.price * ROUNDS; }
  function updateBtn() { btn.textContent = `START BATTLE — ◆ ${fmt(cost())}`; }
  updateBtn();

  container.querySelectorAll(".case-option").forEach((b) => {
    b.addEventListener("click", () => {
      if (battling) return;
      selected = CASES.find((c) => c.id === b.dataset.case);
      container.querySelectorAll(".case-option").forEach((x) => x.classList.toggle("selected", x === b));
      updateBtn();
    });
  });

  btn.addEventListener("click", () => {
    if (battling) return;
    if (!placeBet(cost(), "casebattle")) { toast("Not enough Value", "info"); return; }
    battling = true;
    btn.disabled = true;
    result.set("", "");
    youDrops.innerHTML = foeDrops.innerHTML = "";
    let youTotal = 0, foeTotal = 0;
    youTotalEl.textContent = foeTotalEl.textContent = "◆ 0";

    const foe = rand(FAKE_PLAYERS);
    foeNameEl.innerHTML = `${initialsAvatar(foe)}<span>${esc(foe)}</span>`;

    for (let round = 0; round < ROUNDS; round++) {
      setTimeout(() => {
        const yourItem = pickItem(selected);
        const foeItem = pickItem(selected);
        youTotal += yourItem.v;
        foeTotal += foeItem.v;
        youDrops.innerHTML += itemHTML(yourItem, "battle-drop");
        foeDrops.innerHTML += itemHTML(foeItem, "battle-drop");
        youTotalEl.textContent = `◆ ${fmt(youTotal)}`;
        foeTotalEl.textContent = `◆ ${fmt(foeTotal)}`;

        if (round === ROUNDS - 1) {
          setTimeout(() => {
            // Tie goes to a coin flip, like most battle sites
            const youWin = youTotal > foeTotal || (youTotal === foeTotal && Math.random() < 0.5);
            const pot = youTotal + foeTotal;
            settle("Case Battle", cost(), youWin ? pot : 0);
            if (youWin) {
              result.set(`You won the battle — ◆ ${fmt(pot)}`, "win");
              toast(`Battle won! <b>+◆ ${fmt(pot)}</b>`, "win", 4500);
              container.querySelector("#battleYou").classList.add("battle-winner");
            } else {
              result.set(`${foe} won the battle (◆ ${fmt(foeTotal)} vs ◆ ${fmt(youTotal)})`, "lose");
              container.querySelector("#battleFoe").classList.add("battle-winner");
            }
            battling = false;
            btn.disabled = false;
            setTimeout(() => container.querySelectorAll(".battle-side").forEach((s) => s.classList.remove("battle-winner")), 2500);
          }, 700);
        }
      }, 1100 * (round + 1));
    }
  });
}
