// Jackpot — deposit into a shared pot, players join, one winner takes it all
// (chance proportional to deposit). Other players are simulated.

import { placeBet, settle, state, fmt } from "../state.js";
import { betBar, resultLine, toast, esc, initialsAvatar } from "../ui.js";
import { FAKE_PLAYERS, rand, randInt } from "../data.js";

const COLORS = ["#ff4e00", "#3498ff", "#8e44ff", "#2ecc71", "#ffc233", "#e91e63"];

export function renderJackpot(container) {
  container.innerHTML = `
    <div class="jp-wrap">
      <div class="jp-pot">
        <div class="jp-pot-label">CURRENT POT</div>
        <div class="jp-pot-amount" id="jpPot">◆ 0</div>
        <div class="jp-status" id="jpStatus">Place a deposit to start a round</div>
        <div class="jp-bar"><div class="jp-bar-fill" id="jpBarFill"></div></div>
      </div>
      <div class="jp-players" id="jpPlayers"></div>
    </div>
  `;
  const potEl = container.querySelector("#jpPot");
  const statusEl = container.querySelector("#jpStatus");
  const playersEl = container.querySelector("#jpPlayers");
  const barFill = container.querySelector("#jpBarFill");
  const result = resultLine();

  let players = [], pot = 0, phase = "idle";

  function drawPlayers() {
    playersEl.innerHTML = players.map((p) => `
      <div class="jp-player${p.self ? " self" : ""}">
        ${initialsAvatar(p.name)}
        <span class="jp-player-name">${esc(p.name)}</span>
        <span class="jp-player-amount">◆ ${fmt(p.amount)}</span>
        <span class="jp-player-share" style="color:${p.color}">${pot ? ((p.amount / pot) * 100).toFixed(1) : 0}%</span>
      </div>`).join("");
    potEl.textContent = `◆ ${fmt(pot)}`;
  }

  const bar = betBar({
    action: "DEPOSIT",
    defaultBet: 500,
    onAction() {
      if (phase !== "idle") return;
      const bet = bar.getBet();
      if (!placeBet(bet, "jackpot")) { toast("Not enough Value", "info"); return; }
      startRound(bet);
    },
  });

  function startRound(bet) {
    phase = "joining";
    bar.setDisabled(true);
    result.set("", "");
    pot = bet;
    players = [{ name: state.username, amount: bet, self: true, color: COLORS[0] }];
    drawPlayers();
    statusEl.textContent = "Waiting for players…";

    // Bots join over ~5 seconds
    const botCount = randInt(2, 4);
    const joinTimes = Array.from({ length: botCount }, () => randInt(700, 4200)).sort((a, b) => a - b);
    joinTimes.forEach((t, i) => {
      setTimeout(() => {
        let name;
        do { name = rand(FAKE_PLAYERS); } while (players.some((p) => p.name === name));
        const amount = randInt(Math.max(50, Math.floor(bet * 0.3)), Math.floor(bet * 2.2));
        players.push({ name, amount, self: false, color: COLORS[(i + 1) % COLORS.length] });
        pot += amount;
        drawPlayers();
        statusEl.textContent = `${players.length} players in the pot`;
      }, t);
    });

    // Countdown bar then draw winner
    barFill.style.transition = "none";
    barFill.style.width = "100%";
    void barFill.offsetWidth;
    barFill.style.transition = "width 5.5s linear";
    barFill.style.width = "0%";

    setTimeout(() => {
      phase = "drawing";
      statusEl.textContent = "Drawing winner…";
      // Weighted pick by deposit
      let roll = Math.random() * pot;
      let winner = players[players.length - 1];
      for (const p of players) { roll -= p.amount; if (roll <= 0) { winner = p; break; } }

      // Highlight roll animation across players
      let hops = 0;
      const totalHops = players.length * 3 + players.indexOf(winner);
      const interval = setInterval(() => {
        const idx = hops % players.length;
        playersEl.querySelectorAll(".jp-player").forEach((el, i) => el.classList.toggle("jp-rolling", i === idx));
        hops++;
        if (hops > totalHops) {
          clearInterval(interval);
          playersEl.querySelectorAll(".jp-player").forEach((el, i) => {
            el.classList.remove("jp-rolling");
            el.classList.toggle("jp-winner", players[i] === winner);
          });
          const chance = ((winner === players[0] ? players[0].amount : winner.amount) / pot * 100).toFixed(1);
          if (winner.self) {
            settle("Jackpot", bet, pot);
            result.set(`You won the pot — ◆ ${fmt(pot)} (${chance}% chance)`, "win");
            toast(`Jackpot! You won <b>◆ ${fmt(pot)}</b>`, "win", 4500);
          } else {
            settle("Jackpot", bet, 0);
            result.set(`${winner.name} took the pot of ◆ ${fmt(pot)}`, "lose");
          }
          statusEl.textContent = "Round over — deposit to start a new one";
          phase = "idle";
          bar.setDisabled(false);
        }
      }, 140);
    }, 5600);
  }

  container.appendChild(bar.root);
  container.appendChild(result);
}
