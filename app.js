const state = {
  oddsFormat: "american",
  balance: 1000,
  selections: [],
  gate: null,
  stake: 20,
  cooldown: false,
};

const games = [
  {
    id: 1,
    status: "UPCOMING",
    time: "Today • 7:30 PM",
    home: "Midtown Meteors",
    away: "Bay City Waves",
    markets: [
      { label: "Moneyline", selections: [
        { id: "1a", label: "Meteors", american: -135, decimal: 1.74 },
        { id: "1b", label: "Waves", american: 115, decimal: 2.15 },
      ]},
      { label: "Spread", selections: [
        { id: "1c", label: "Meteors -2.5", american: -110, decimal: 1.91 },
        { id: "1d", label: "Waves +2.5", american: -110, decimal: 1.91 },
      ]},
      { label: "Total", selections: [
        { id: "1e", label: "Over 221.5", american: -105, decimal: 1.95 },
        { id: "1f", label: "Under 221.5", american: -115, decimal: 1.87 },
      ]},
      { label: "Team Total", selections: [
        { id: "1g", label: "Meteors O 112.5", american: -110, decimal: 1.91 },
        { id: "1h", label: "Waves U 109.5", american: -110, decimal: 1.91 },
      ]},
    ],
  },
  {
    id: 2,
    status: "UPCOMING",
    time: "Today • 9:00 PM",
    home: "Capital Comets",
    away: "Westside Wolves",
    markets: [
      { label: "Moneyline", selections: [
        { id: "2a", label: "Comets", american: -120, decimal: 1.83 },
        { id: "2b", label: "Wolves", american: 102, decimal: 2.02 },
      ]},
      { label: "Spread", selections: [
        { id: "2c", label: "Comets -1.5", american: -108, decimal: 1.93 },
        { id: "2d", label: "Wolves +1.5", american: -112, decimal: 1.89 },
      ]},
      { label: "Total", selections: [
        { id: "2e", label: "Over 218.0", american: -110, decimal: 1.91 },
        { id: "2f", label: "Under 218.0", american: -110, decimal: 1.91 },
      ]},
      { label: "Team Total", selections: [
        { id: "2g", label: "Comets O 110.0", american: -105, decimal: 1.95 },
        { id: "2h", label: "Wolves U 107.5", american: -115, decimal: 1.87 },
      ]},
    ],
  },
  {
    id: 3,
    status: "UPCOMING",
    time: "Tomorrow • 6:00 PM",
    home: "Harbor Hawks",
    away: "Northside Knights",
    markets: [
      { label: "Moneyline", selections: [
        { id: "3a", label: "Hawks", american: 140, decimal: 2.4 },
        { id: "3b", label: "Knights", american: -160, decimal: 1.63 },
      ]},
      { label: "Spread", selections: [
        { id: "3c", label: "Hawks +3.5", american: -105, decimal: 1.95 },
        { id: "3d", label: "Knights -3.5", american: -115, decimal: 1.87 },
      ]},
      { label: "Total", selections: [
        { id: "3e", label: "Over 214.5", american: -110, decimal: 1.91 },
        { id: "3f", label: "Under 214.5", american: -110, decimal: 1.91 },
      ]},
    ],
  },
];

const bets = [
  {
    id: "BW-44920",
    status: "OPEN",
    stake: 50,
    odds: 2.15,
    legs: [
      "Midtown Meteors ML (-135)",
      "Over 221.5 (-105)",
    ],
  },
  {
    id: "BW-44902",
    status: "WON",
    stake: 40,
    odds: 1.91,
    legs: ["Capital Comets -1.5 (-108)"],
  },
];

const leaderboard = [
  { name: "Avery Simmons", wc: 5420, roi: "18%", streak: "W4" },
  { name: "Jordan Blake", wc: 4980, roi: "12%", streak: "W2" },
  { name: "Maya Ortiz", wc: 4710, roi: "9%", streak: "L1" },
];

const ledger = [
  { type: "CREDIT_GRANT", amount: "+1000 WC", detail: "New user bonus", time: "Today 09:00" },
  { type: "BET_PLACED", amount: "-50 WC", detail: "BW-44920", time: "Today 10:12" },
  { type: "BET_SETTLED", amount: "+76 WC", detail: "BW-44902", time: "Yesterday 20:22" },
];

const marketTitle = document.getElementById("market-title");
const marketStatus = document.getElementById("market-status");
const gamesContainer = document.getElementById("games");
const marketTable = document.getElementById("market-table");
const betslipList = document.getElementById("betslip-list");
const betslipCount = document.getElementById("betslip-count");
const stakeInput = document.getElementById("stake");
const returnEl = document.getElementById("return");
const impliedEl = document.getElementById("implied");
const balanceEl = document.getElementById("balance");
const toastEl = document.getElementById("toast");
const oddsToggle = document.getElementById("odds-toggle");
const oddsFormat = document.getElementById("odds-format");
const gateModal = document.getElementById("gate-modal");
const gateStatus = document.getElementById("gate-status");

const showToast = (message) => {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1800);
};

const formatOdds = (selection) => {
  if (state.oddsFormat === "decimal") {
    return selection.decimal.toFixed(2);
  }
  return selection.american > 0 ? `+${selection.american}` : `${selection.american}`;
};

const impliedProbability = (americanOdds) => {
  if (americanOdds > 0) {
    return 100 / (americanOdds + 100);
  }
  const abs = Math.abs(americanOdds);
  return abs / (abs + 100);
};

const renderGames = () => {
  gamesContainer.innerHTML = "";
  games.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `
      <div class="game-header">
        <div>
          <strong>${game.away}</strong> @ <strong>${game.home}</strong>
          <p class="muted">${game.time}</p>
        </div>
        <span class="status-pill">${game.status}</span>
      </div>
      <div class="market-row"></div>
    `;

    const row = card.querySelector(".market-row");
    game.markets.slice(0, 3).forEach((market) => {
      const selection = market.selections[0];
      const button = document.createElement("button");
      button.className = "selection-button";
      button.innerHTML = `<span>${market.label}</span><strong>${formatOdds(selection)}</strong>`;
      button.addEventListener("click", () => selectMarket(game));
      row.appendChild(button);
    });

    card.addEventListener("click", () => selectMarket(game));
    gamesContainer.appendChild(card);
  });
};

const selectMarket = (game) => {
  marketTitle.textContent = `${game.away} @ ${game.home}`;
  marketStatus.textContent = game.status;
  marketTable.innerHTML = "";
  game.markets.forEach((market) => {
    const group = document.createElement("div");
    group.className = "market-group";
    group.innerHTML = `<h3>${market.label}</h3>`;
    const grid = document.createElement("div");
    grid.className = "market-row";
    market.selections.forEach((selection) => {
      const button = document.createElement("button");
      button.className = "selection-button";
      if (state.selections.find((item) => item.id === selection.id)) {
        button.classList.add("selected");
      }
      button.innerHTML = `<span>${selection.label}</span><strong>${formatOdds(selection)}</strong>`;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleSelection(selection, game);
      });
      grid.appendChild(button);
    });
    group.appendChild(grid);
    marketTable.appendChild(group);
  });
};

const toggleSelection = (selection, game) => {
  const existingIndex = state.selections.findIndex((item) => item.id === selection.id);
  if (existingIndex >= 0) {
    state.selections.splice(existingIndex, 1);
  } else {
    state.selections.push({
      ...selection,
      game: `${game.away} @ ${game.home}`,
    });
  }
  renderBetslip();
  selectMarket(game);
};

const renderBetslip = () => {
  betslipList.innerHTML = "";
  betslipCount.textContent = `${state.selections.length} selections`;
  state.selections.forEach((selection) => {
    const item = document.createElement("div");
    item.className = "betslip-item";
    item.innerHTML = `
      <strong>${selection.label}</strong>
      <span class="muted">${selection.game}</span>
      <span>Odds: ${formatOdds(selection)}</span>
    `;
    const removeButton = document.createElement("button");
    removeButton.className = "ghost-button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      state.selections = state.selections.filter((item) => item.id !== selection.id);
      renderBetslip();
      selectMarket(games[0]);
    });
    item.appendChild(removeButton);
    betslipList.appendChild(item);
  });
  updateSummary();
};

const updateSummary = () => {
  const stake = Number(stakeInput.value || 0);
  state.stake = stake;
  const combinedOdds = state.selections.reduce((acc, selection) => acc * selection.decimal, 1);
  const implied = state.selections.length
    ? impliedProbability(state.selections[0].american)
    : 0;
  impliedEl.textContent = `${(implied * 100).toFixed(1)}%`;
  const potentialReturn = stake * (state.selections.length ? combinedOdds : 0);
  returnEl.textContent = `${potentialReturn.toFixed(2)} WC`;
};

const renderBets = () => {
  const container = document.getElementById("bet-cards");
  container.innerHTML = "";
  bets.forEach((bet) => {
    const card = document.createElement("div");
    card.className = "betslip-item";
    card.innerHTML = `
      <div class="summary-row">
        <strong>${bet.id}</strong>
        <span class="status-pill">${bet.status}</span>
      </div>
      <p class="muted">Stake: ${bet.stake} WC • Odds: ${bet.odds.toFixed(2)}</p>
      <ul>${bet.legs.map((leg) => `<li>${leg}</li>`).join("")}</ul>
    `;
    container.appendChild(card);
  });
};

const renderLeaderboard = () => {
  const container = document.getElementById("leaderboard-list");
  container.innerHTML = "";
  leaderboard.forEach((row, index) => {
    const item = document.createElement("div");
    item.className = "leaderboard-row";
    item.innerHTML = `
      <span>#${index + 1} ${row.name}</span>
      <span>${row.wc} WC • ROI ${row.roi} • ${row.streak}</span>
    `;
    container.appendChild(item);
  });
};

const renderLedger = () => {
  const body = document.getElementById("ledger");
  body.innerHTML = "";
  ledger.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.type}</td>
      <td>${entry.amount}</td>
      <td>${entry.detail}</td>
      <td>${entry.time}</td>
    `;
    body.appendChild(row);
  });
};

const updateGateStatus = () => {
  if (!state.gate) {
    gateStatus.textContent = "Gate: Unverified";
    return;
  }
  gateStatus.textContent = `Gate: ${state.gate.option}`;
};

const loadGate = () => {
  const saved = localStorage.getItem("betwoodGate");
  if (saved) {
    state.gate = JSON.parse(saved);
    updateGateStatus();
    return;
  }
  gateModal.classList.add("show");
};

const setGate = (option) => {
  const payload = { option, acceptedAt: new Date().toISOString() };
  localStorage.setItem("betwoodGate", JSON.stringify(payload));
  state.gate = payload;
  gateModal.classList.remove("show");
  updateGateStatus();
};

const updateBalance = () => {
  balanceEl.textContent = `${state.balance.toFixed(0)} WC`;
};

const toggleOddsFormat = () => {
  state.oddsFormat = state.oddsFormat === "american" ? "decimal" : "american";
  oddsToggle.textContent = `Odds: ${state.oddsFormat === "american" ? "American" : "Decimal"}`;
  oddsFormat.textContent = state.oddsFormat === "american" ? "American" : "Decimal";
  renderGames();
  selectMarket(games[0]);
  renderBetslip();
};

const placeBet = () => {
  if (state.cooldown) {
    showToast("Cooldown active. Please wait.");
    return;
  }
  if (!state.selections.length) {
    showToast("Add selections to place a bet.");
    return;
  }
  if (state.stake > 200) {
    showToast("Max stake is 200 WC.");
    return;
  }
  if (state.stake > state.balance) {
    showToast("Insufficient balance.");
    return;
  }
  state.balance -= state.stake;
  updateBalance();
  showToast("Bet placed! Ticket BW-44930 created.");
  state.cooldown = true;
  setTimeout(() => {
    state.cooldown = false;
  }, 10000);
};

const navButtons = document.querySelectorAll(".nav-item");
navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const section = button.dataset.section;
    document.querySelectorAll(".panel").forEach((panel) => panel.classList.add("hidden"));
    if (section === "games" || section === "sports" || section === "live") {
      document.getElementById("game-list").classList.remove("hidden");
      document.getElementById("market-detail").classList.remove("hidden");
      return;
    }
    const panel = document.getElementById(section);
    if (panel) {
      panel.classList.remove("hidden");
    }
  });
});

stakeInput.addEventListener("input", updateSummary);

oddsToggle.addEventListener("click", toggleOddsFormat);

betslipList.addEventListener("click", updateSummary);

const stakeButtons = document.querySelectorAll("[data-stake]");
stakeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    stakeInput.value = Math.max(1, Number(stakeInput.value) + Number(button.dataset.stake));
    updateSummary();
  });
});

const gateButtons = document.querySelectorAll("[data-gate]");
gateButtons.forEach((button) => {
  button.addEventListener("click", () => setGate(button.dataset.gate));
});

const placeBetButton = document.getElementById("place-bet");
placeBetButton.addEventListener("click", placeBet);

renderGames();
selectMarket(games[0]);
renderBetslip();
renderBets();
renderLeaderboard();
renderLedger();
loadGate();
updateBalance();
