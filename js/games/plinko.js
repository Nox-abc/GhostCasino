// Plinko — ball drops through 12 rows of pegs into a multiplier bucket.

import { placeBet, settle, fmt } from "../state.js";
import { betBar, resultLine, toast } from "../ui.js";

const ROWS = 12;
const MULTS = [16, 6, 3, 1.6, 1.1, 0.7, 0.5, 0.7, 1.1, 1.6, 3, 6, 16];

export function renderPlinko(container) {
  container.innerHTML = `
    <div class="plinko-stage">
      <div class="plinko-board" id="plinkoBoard"></div>
      <div class="plinko-buckets" id="plinkoBuckets">
        ${MULTS.map((m) => `<div class="plinko-bucket ${m >= 3 ? "pb-hot" : m >= 1 ? "pb-mid" : "pb-low"}">${m}×</div>`).join("")}
      </div>
    </div>
  `;
  const boardEl = container.querySelector("#plinkoBoard");
  const buckets = [...container.querySelectorAll(".plinko-bucket")];
  const result = resultLine();

  // Pegs: row r has r+3 pegs (start at 3), centered
  for (let r = 0; r < ROWS; r++) {
    const row = document.createElement("div");
    row.className = "plinko-row";
    for (let p = 0; p < r + 3; p++) {
      const peg = document.createElement("span");
      peg.className = "plinko-peg";
      row.appendChild(peg);
    }
    boardEl.appendChild(row);
  }

  let balls = 0;
  const bar = betBar({
    action: "DROP",
    onAction() {
      if (balls >= 3) { toast("Max 3 balls at once", "info"); return; }
      const bet = bar.getBet();
      if (!placeBet(bet, "plinko")) { toast("Not enough Value", "info"); return; }
      dropBall(bet);
    },
  });

  function dropBall(bet) {
    balls++;
    const ball = document.createElement("span");
    ball.className = "plinko-ball";
    boardEl.appendChild(ball);

    // Path: at each row go left (0) or right (1). Bucket index = number of rights.
    let rights = 0;
    let pos = 0.5; // horizontal fraction of board width
    const stepY = 100 / (ROWS + 1);
    ball.style.left = "50%";
    ball.style.top = "0%";

    for (let r = 0; r <= ROWS; r++) {
      setTimeout(() => {
        if (r < ROWS) {
          const right = Math.random() < 0.5 ? 0 : 1;
          rights += right;
          // Horizontal spread grows with depth
          pos += (right ? 1 : -1) * (0.5 / (ROWS + 2));
          ball.style.left = pos * 100 + "%";
          ball.style.top = (r + 1) * stepY + "%";
        } else {
          // Land in bucket
          const idx = rights;
          const bucket = buckets[idx];
          ball.style.left = ((idx + 0.5) / MULTS.length) * 100 + "%";
          ball.style.top = "101%";
          setTimeout(() => {
            ball.remove();
            balls--;
            bucket.classList.add("pb-flash");
            setTimeout(() => bucket.classList.remove("pb-flash"), 500);
            const mult = MULTS[idx];
            const payout = Math.floor(bet * mult);
            settle("Plinko", bet, payout);
            if (mult >= 1) {
              result.set(`${mult}× — WIN ◆ ${fmt(payout)}`, "win");
              if (mult >= 3) toast(`Plinko hit <b>${mult}×</b> — ◆ ${fmt(payout)}!`, "win");
            } else {
              result.set(`${mult}× — ◆ ${fmt(payout)} back`, "lose");
            }
          }, 160);
        }
      }, 170 * (r + 1));
    }
  }

  container.appendChild(bar.root);
  container.appendChild(result);
}
