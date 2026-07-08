// Blackjack — hit / stand / double, dealer stands on 17, blackjack pays 3:2.

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function newDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ r, s });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function handValue(hand) {
  let total = 0, aces = 0;
  for (const c of hand) {
    if (c.r === "A") { total += 11; aces++; }
    else if (["J", "Q", "K"].includes(c.r)) total += 10;
    else total += +c.r;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function cardHTML(c, hidden = false) {
  if (hidden) return `<span class="pcard pcard-back">◆</span>`;
  return `<span class="pcard"><b>${c.r}</b><i>${c.s}</i></span>`;
}

export function renderBlackjack(container) {
  container.innerHTML = `
    <div class="bj-table">
      <div class="bj-row">
        <div class="bj-label">DEALER <span class="bj-total" id="bjDealerTotal"></span></div>
        <div class="bj-cards" id="bjDealer"></div>
      </div>
      <div class="bj-row">
        <div class="bj-label">YOU <span class="bj-total" id="bjPlayerTotal"></span></div>
        <div class="bj-cards" id="bjPlayer"></div>
      </div>
      <div class="bj-actions" id="bjActions">
        <button class="bj-btn" data-act="hit">HIT</button>
        <button class="bj-btn" data-act="stand">STAND</button>
        <button class="bj-btn" data-act="double">DOUBLE</button>
      </div>
    </div>
  `;
  const dealerEl = container.querySelector("#bjDealer");
  const playerEl = container.querySelector("#bjPlayer");
  const dealerTotal = container.querySelector("#bjDealerTotal");
  const playerTotal = container.querySelector("#bjPlayerTotal");
  const actions = container.querySelector("#bjActions");
  const result = resultLine();

  let deck, player, dealer, bet = 0, playing = false, hideHole = true;

  function draw() {
    dealerEl.innerHTML = dealer.map((c, i) => cardHTML(c, hideHole && i === 1)).join("");
    playerEl.innerHTML = player.map((c) => cardHTML(c)).join("");
    playerTotal.textContent = handValue(player);
    dealerTotal.textContent = hideHole ? handValue([dealer[0]]) + " + ?" : handValue(dealer);
    actions.classList.toggle("show", playing);
    actions.querySelector('[data-act="double"]').disabled = player.length !== 2;
  }

  const bar = betBar({
    action: "DEAL",
    onAction() {
      if (playing) return;
      const b = bar.getBet();
      if (!placeBet(b, "blackjack")) { toast("Not enough Value", "info"); return; }
      bet = b;
      deck = newDeck();
      player = [deck.pop(), deck.pop()];
      dealer = [deck.pop(), deck.pop()];
      playing = true;
      hideHole = true;
      result.set("", "");
      bar.setDisabled(true);
      draw();

      if (handValue(player) === 21) {
        // Natural blackjack
        hideHole = false;
        if (handValue(dealer) === 21) finish("push");
        else finish("blackjack");
      }
    },
  });

  actions.addEventListener("click", (e) => {
    const act = e.target.dataset?.act;
    if (!act || !playing) return;
    if (act === "hit") {
      player.push(deck.pop());
      draw();
      if (handValue(player) > 21) finish("bust");
    } else if (act === "stand") {
      dealerPlay();
    } else if (act === "double") {
      if (!placeBet(bet, null)) { toast("Not enough Value to double", "info"); return; }
      bet *= 2;
      player.push(deck.pop());
      draw();
      if (handValue(player) > 21) finish("bust");
      else dealerPlay();
    }
  });

  function dealerPlay() {
    hideHole = false;
    while (handValue(dealer) < 17) dealer.push(deck.pop());
    const p = handValue(player), d = handValue(dealer);
    if (d > 21 || p > d) finish("win");
    else if (p === d) finish("push");
    else finish("lose");
  }

  function finish(outcome) {
    playing = false;
    hideHole = false;
    draw();
    actions.classList.remove("show");
    let payout = 0, msg = "", cls = "lose";
    if (outcome === "blackjack") { payout = Math.floor(bet * 2.5); msg = `BLACKJACK! Win ◆ ${fmt(payout)}`; cls = "win"; }
    else if (outcome === "win") { payout = bet * 2; msg = `You win ◆ ${fmt(payout)}`; cls = "win"; }
    else if (outcome === "push") { payout = bet; msg = "Push — bet returned"; cls = ""; }
    else if (outcome === "bust") { msg = "Bust! Over 21."; }
    else { msg = "Dealer wins."; }
    settle("Blackjack", bet, payout);
    result.set(msg, cls);
    if (cls === "win") toast(`Blackjack paid <b>◆ ${fmt(payout)}</b>`, "win");
    bar.setDisabled(false);
  }

  container.appendChild(bar.root);
  container.appendChild(result);
}
