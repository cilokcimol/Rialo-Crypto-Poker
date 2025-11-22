const playerState = {
  name: "@you",
  baseAsset: "BTC",
  btcChips: 100,
  ethChips: 100,
};

const botState = {
  name: "Bot",
  btcChips: 100,
  ethChips: 100,
};

const gameState = {
  deck: [],
  playerHand: [],
  botHand: [],
  handsPlayed: 0,
  inSession: false,
};

const priceState = {
  btcUsd: 0,
  ethUsd: 0,
};

const botNames = [
  "Nova Quinn",
  "Lex Carter",
  "Asha Rami",
  "Ada Solace",
  "Rian Vale",
  "Eli Navarro",
  "Mira Kade",
  "Jonas Hale",
  "Seren Lyra",
  "Kai Mercer",
  "Aidan Frost",
  "Naya Reeves",
  "Lena Kova",
  "Rafi Calder",
];

const playerNameInput = document.getElementById("playerName");
const baseAssetSelect = document.getElementById("baseAsset");
const startGameBtn = document.getElementById("startGameBtn");
const dealHandBtn = document.getElementById("dealHandBtn");
const foldHandBtn = document.getElementById("foldHandBtn");

const playerNameDisplay = document.getElementById("playerNameDisplay");
const botNameDisplay = document.getElementById("botName");

const playerBTCChipsEl = document.getElementById("playerBTCChips");
const playerETHChipsEl = document.getElementById("playerETHChips");
const botBTCChipsEl = document.getElementById("botBTCChips");
const botETHChipsEl = document.getElementById("botETHChips");

const gamePhaseEl = document.getElementById("gamePhase");
const lastResultEl = document.getElementById("lastResult");
const handSummaryEl = document.getElementById("handSummary");
const handsPlayedEl = document.getElementById("handsPlayed");

const botHandContainer = document.getElementById("botHand");
const playerHandContainer = document.getElementById("playerHand");

const btcPriceEl = document.getElementById("btcPrice");
const ethPriceEl = document.getElementById("ethPrice");
const portfolioValueEl = document.getElementById("portfolioValue");
const priceStatusEl = document.getElementById("priceStatus");

const logOutput = document.getElementById("logOutput");

function init() {
  attachListeners();
  resetStacks();
  updateStackUI();
  fetchPrices();
  logInfo("Engine", "Rialo Crypto Poker initialized. Configure your player to begin.");
}

function attachListeners() {
  startGameBtn.addEventListener("click", startSession);
  dealHandBtn.addEventListener("click", dealNewHand);
  foldHandBtn.addEventListener("click", foldHand);
}

function resetStacks() {
  playerState.btcChips = 100;
  playerState.ethChips = 100;
  botState.btcChips = 100;
  botState.ethChips = 100;
}

function startSession() {
  const nameRaw = (playerNameInput.value || "").trim();
  playerState.name = nameRaw.length > 0 ? nameRaw : "@you";
  playerState.baseAsset = baseAssetSelect.value || "BTC";

  botState.name = botNames[Math.floor(Math.random() * botNames.length)];

  playerNameDisplay.textContent = playerState.name;
  botNameDisplay.textContent = botState.name;

  gameState.inSession = true;
  gamePhaseEl.textContent = "Session live. Click Deal New Hand to play.";
  lastResultEl.textContent = "";
  handSummaryEl.textContent = "";
  gameState.handsPlayed = 0;
  handsPlayedEl.textContent = "Hands played: 0";

  clearHands();
  resetStacks();
  updateStackUI();
  updatePortfolioValue();

  dealHandBtn.disabled = false;
  foldHandBtn.disabled = false;

  logInfo("Session", `New session started. Player=${playerState.name}, Bot=${botState.name}, base=${playerState.baseAsset}.`);
}

function clearHands() {
  gameState.playerHand = [];
  gameState.botHand = [];
  renderHands(true);
}

function buildDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const deck = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({ rank, suit });
    });
  });
  gameState.deck = deck;
}

function shuffleDeck() {
  const deck = gameState.deck;
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
}

function dealCards(count) {
  const cards = [];
  for (let i = 0; i < count; i += 1) {
    cards.push(gameState.deck.pop());
  }
  return cards;
}

function dealNewHand() {
  if (!gameState.inSession) return;

  buildDeck();
  shuffleDeck();

  gameState.playerHand = dealCards(5);
  gameState.botHand = dealCards(5);

  gameState.handsPlayed += 1;
  handsPlayedEl.textContent = `Hands played: ${gameState.handsPlayed}`;

  evaluateHandOutcome();
}

function foldHand() {
  if (!gameState.inSession || gameState.playerHand.length === 0) {
    return;
  }
  const foldLoss = 5;
  applyChipChange(playerState, botState, foldLoss);
  lastResultEl.textContent = "You folded. Bot scoops a small pot.";
  lastResultEl.style.color = "#ff6179";
  handSummaryEl.textContent = "You can always fight the next block.";
  updateStackUI();
  updatePortfolioValue();
  logLoss("Fold", `Player ${playerState.name} folded. Lost ${foldLoss} ${playerState.baseAsset} chips.`);
  clearHands();
  gamePhaseEl.textContent = "Fold registered. Click Deal New Hand to continue.";
}

function rankHand(cards) {
  const rankOrder = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };

  const ranks = cards.map((c) => rankOrder[c.rank]).sort((a, b) => a - b);
  const suits = cards.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  const uniqueRanks = [...new Set(ranks)];

  let isStraight = false;
  let highCard = ranks[4];
  if (
    ranks[0] + 1 === ranks[1] &&
    ranks[1] + 1 === ranks[2] &&
    ranks[2] + 1 === ranks[3] &&
    ranks[3] + 1 === ranks[4]
  ) {
    isStraight = true;
  }
  if (JSON.stringify(ranks) === JSON.stringify([2, 3, 4, 5, 14])) {
    isStraight = true;
    highCard = 5;
  }

  const counts = {};
  ranks.forEach((r) => {
    counts[r] = (counts[r] || 0) + 1;
  });

  const countValues = Object.values(counts).sort((a, b) => b - a);
  const rankGroups = Object.entries(counts)
    .map(([rank, count]) => ({ rank: Number(rank), count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.rank - a.rank;
    });

  const primaryGroup = rankGroups[0];
  const secondaryGroup = rankGroups[1];

  if (isStraight && isFlush) {
    return [8, highCard];
  }

  if (countValues[0] === 4) {
    const kicker = ranks.find((r) => r !== primaryGroup.rank);
    return [7, primaryGroup.rank, kicker];
  }

  if (countValues[0] === 3 && countValues[1] === 2) {
    return [6, primaryGroup.rank, secondaryGroup.rank];
  }

  if (isFlush) {
    return [5, ...ranks.slice().reverse()];
  }

  if (isStraight) {
    return [4, highCard];
  }

  if (countValues[0] === 3) {
    const kickers = ranks
      .filter((r) => r !== primaryGroup.rank)
      .sort((a, b) => b - a);
    return [3, primaryGroup.rank, ...kickers];
  }

  if (countValues[0] === 2 && countValues[1] === 2) {
    const pair1 = Math.max(primaryGroup.rank, secondaryGroup.rank);
    const pair2 = Math.min(primaryGroup.rank, secondaryGroup.rank);
    const kicker = ranks.find((r) => r !== pair1 && r !== pair2);
    return [2, pair1, pair2, kicker];
  }

  if (countValues[0] === 2) {
    const pairRank = primaryGroup.rank;
    const kickers = ranks
      .filter((r) => r !== pairRank)
      .sort((a, b) => b - a);
    return [1, pairRank, ...kickers];
  }

  return [0, ...ranks.slice().reverse()];
}

function describeHandRank(rankTuple) {
  const category = rankTuple[0];
  switch (category) {
    case 8:
      return "Straight Flush";
    case 7:
      return "Four of a Kind";
    case 6:
      return "Full House";
    case 5:
      return "Flush";
    case 4:
      return "Straight";
    case 3:
      return "Three of a Kind";
    case 2:
      return "Two Pair";
    case 1:
      return "One Pair";
    case 0:
    default:
      return "High Card";
  }
}

function compareRankTuples(a, b) {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function evaluateHandOutcome() {
  const playerRank = rankHand(gameState.playerHand);
  const botRank = rankHand(gameState.botHand);

  const cmp = compareRankTuples(playerRank, botRank);
  const playerDesc = describeHandRank(playerRank);
  const botDesc = describeHandRank(botRank);

  renderHands(false);

  const base = playerState.baseAsset;
  let delta = calculateHandDelta(playerRank, botRank);

  if (cmp > 0) {
    applyChipChange(playerState, botState, delta);
    gamePhaseEl.textContent = "Block confirmed. You win this hand.";
    lastResultEl.textContent = `You win +${delta} ${base} chips.`;
    lastResultEl.style.color = "#37d6a3";
    handSummaryEl.textContent = `${playerDesc} beats ${botDesc}.`;
    logWin("Hand", `Player ${playerState.name} wins. ${playerDesc} > ${botDesc}. +${delta} ${base} chips.`);
  } else if (cmp < 0) {
    applyChipChange(botState, playerState, delta);
    gamePhaseEl.textContent = "Bot found a better route. You lose this hand.";
    lastResultEl.textContent = `You lose -${delta} ${base} chips.`;
    lastResultEl.style.color = "#ff6179";
    handSummaryEl.textContent = `${botDesc} beats ${playerDesc}.`;
    logLoss("Hand", `Bot ${botState.name} wins. ${botDesc} > ${playerDesc}. -${delta} ${base} chips.`);
  } else {
    gamePhaseEl.textContent = "Perfect balance. Pot is pushed.";
    lastResultEl.textContent = "Tie. No chips move this hand.";
    lastResultEl.style.color = "#f5c85b";
    handSummaryEl.textContent = `${playerDesc} equals ${botDesc}.`;
    logInfo("Hand", `Tie between ${playerState.name} and ${botState.name}. ${playerDesc}.`);
  }

  updateStackUI();
  updatePortfolioValue();
}

function calculateHandDelta(playerRank, botRank) {
  const categoryStrength = Math.max(playerRank[0], botRank[0]);
  const baseAmount = 5;
  const multiplier = 1 + categoryStrength;
  return baseAmount * multiplier;
}

function applyChipChange(winner, loser, baseDelta) {
  const asset = playerState.baseAsset;
  const delta = baseDelta;

  if (asset === "BTC") {
    winner.btcChips += delta;
    loser.btcChips = Math.max(0, loser.btcChips - delta);
  } else if (asset === "ETH") {
    winner.ethChips += delta;
    loser.ethChips = Math.max(0, loser.ethChips - delta);
  }
}

function renderHands(hideBot) {
  botHandContainer.innerHTML = "";
  playerHandContainer.innerHTML = "";

  if (gameState.playerHand.length === 0 && gameState.botHand.length === 0) {
    for (let i = 0; i < 5; i += 1) {
      const back = document.createElement("div");
      back.className = "card-back";
      botHandContainer.appendChild(back);

      const back2 = document.createElement("div");
      back2.className = "card-back";
      playerHandContainer.appendChild(back2);
    }
    return;
  }

  gameState.botHand.forEach((card) => {
    if (hideBot) {
      const back = document.createElement("div");
      back.className = "card-back";
      botHandContainer.appendChild(back);
    } else {
      botHandContainer.appendChild(createCardElement(card));
    }
  });

  gameState.playerHand.forEach((card) => {
    playerHandContainer.appendChild(createCardElement(card));
  });
}

function createCardElement(card) {
  const el = document.createElement("div");
  const isRed = card.suit === "♥" || card.suit === "♦";
  el.className = "card" + (isRed ? " red" : "");

  const rankTop = document.createElement("div");
  rankTop.className = "card-rank";
  rankTop.textContent = card.rank;

  const suitTop = document.createElement("div");
  suitTop.className = "card-suit";
  suitTop.textContent = card.suit;

  const suitBottom = document.createElement("div");
  suitBottom.className = "card-suit bottom";
  suitBottom.textContent = card.suit;

  el.appendChild(rankTop);
  el.appendChild(suitTop);
  el.appendChild(suitBottom);

  return el;
}

function updateStackUI() {
  playerBTCChipsEl.textContent = playerState.btcChips;
  playerETHChipsEl.textContent = playerState.ethChips;
  botBTCChipsEl.textContent = botState.btcChips;
  botETHChipsEl.textContent = botState.ethChips;
}

async function fetchPrices() {
  btcPriceEl.textContent = "Loading...";
  ethPriceEl.textContent = "Loading...";
  priceStatusEl.textContent = "Fetching BTC and ETH spot from public markets...";

  try {
    const url =
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    priceState.btcUsd = data.bitcoin.usd || 0;
    priceState.ethUsd = data.ethereum.usd || 0;

    btcPriceEl.textContent = `$${priceState.btcUsd.toLocaleString()}`;
    ethPriceEl.textContent = `$${priceState.ethUsd.toLocaleString()}`;
    priceStatusEl.textContent = "Prices synced. Values are estimates, not trading quotes.";

    updatePortfolioValue();
    logInfo("Price", "Fetched BTC and ETH USD spot using CoinGecko.");
  } catch (err) {
    btcPriceEl.textContent = "N/A";
    ethPriceEl.textContent = "N/A";
    priceStatusEl.textContent = "Price fetch failed. Game still works, values will not be estimated.";
    logInfo("Price", `Failed to fetch prices: ${err.message}`);
  }
}

function updatePortfolioValue() {
  const btcValue = (playerState.btcChips / 1000) * priceState.btcUsd;
  const ethValue = (playerState.ethChips / 1000) * priceState.ethUsd;
  const total = btcValue + ethValue;
  portfolioValueEl.textContent = total.toFixed(2);
}

function logLine(tagType, scope, message) {
  const line = document.createElement("div");
  line.classList.add("log-line");
  line.classList.add(tagType);

  const tag = document.createElement("span");
  tag.classList.add("tag");
  tag.textContent = scope;

  const text = document.createElement("span");
  text.textContent = message;

  line.appendChild(tag);
  line.appendChild(text);

  logOutput.appendChild(line);
  logOutput.scrollTop = logOutput.scrollHeight;
}

function logWin(scope, message) {
  logLine("tag-win", scope, message);
}

function logLoss(scope, message) {
  logLine("tag-loss", scope, message);
}

function logInfo(scope, message) {
  logLine("tag-info", scope, message);
}

init();
