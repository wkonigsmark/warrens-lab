const appShell = document.querySelector(".app-shell");
const board = document.querySelector("#board");
const statusStrip = document.querySelector("#statusStrip");
const newGameButton = document.querySelector("#newGame");
const mentorToggle = document.querySelector("#mentorToggle");
const mentorPanel = document.querySelector("#mentorPanel");
const lessonText = document.querySelector("#lessonText");

const pitsPerSide = 6;
const startingStones = 4;
const playerOneStore = 6;
const playerTwoStore = 13;
const oppositePit = {
  0: 12,
  1: 11,
  2: 10,
  3: 9,
  4: 8,
  5: 7,
  7: 5,
  8: 4,
  9: 3,
  10: 2,
  11: 1,
  12: 0,
};

let pits = [];
let currentPlayer = 1;
let gameOver = false;

function newGame() {
  pits = Array(14).fill(startingStones);
  pits[playerOneStore] = 0;
  pits[playerTwoStore] = 0;
  currentPlayer = 1;
  gameOver = false;
  setStatus("Player 1 starts. Pick one of your pits.");
  setLesson("Choose any pit on your side. You will pick up all stones in that pit and drop them one by one around the board.");
  renderBoard();
}

function renderBoard() {
  board.innerHTML = "";
  board.appendChild(createStore(2));

  for (let index = 12; index >= 7; index -= 1) {
    board.appendChild(createPit(index, 2));
  }

  for (let index = 0; index <= 5; index += 1) {
    board.appendChild(createPit(index, 1));
  }

  board.appendChild(createStore(1));
}

function createPit(index, owner) {
  const pit = document.createElement("button");
  pit.type = "button";
  pit.className = `pit player-${owner === 1 ? "one" : "two"}`;
  pit.style.gridColumn = `${owner === 1 ? index + 2 : 14 - index}`;
  pit.disabled = gameOver || owner !== currentPlayer || pits[index] === 0;
  pit.classList.toggle("legal", !pit.disabled);
  pit.setAttribute("aria-label", `Player ${owner} pit with ${pits[index]} stones`);
  pit.innerHTML = `
    <span class="pit-label">P${owner}</span>
    ${renderStones(pits[index])}
    <span class="pit-count">${pits[index]}</span>
  `;
  pit.addEventListener("click", () => playMove(index));
  return pit;
}

function createStore(owner) {
  const index = owner === 1 ? playerOneStore : playerTwoStore;
  const store = document.createElement("div");
  store.className = `store player-${owner === 1 ? "one" : "two"}`;
  store.setAttribute("aria-label", `Player ${owner} store with ${pits[index]} stones`);
  store.innerHTML = `
    <span class="store-label">P${owner} Store</span>
    ${renderStones(Math.min(pits[index], 18))}
    <span class="store-count">${pits[index]}</span>
  `;
  return store;
}

function renderStones(count) {
  const stones = Array.from({ length: Math.min(count, 24) }, (_, index) => {
    const x = 10 + ((index * 31) % 72);
    const y = 12 + ((index * 47) % 66);
    return `<span class="stone" style="left:${x}%; top:${y}%;"></span>`;
  }).join("");
  return `<span class="stones">${stones}</span>`;
}

function playMove(startIndex) {
  if (gameOver || !isOwnPit(startIndex) || pits[startIndex] === 0) return;

  let stones = pits[startIndex];
  pits[startIndex] = 0;
  let index = startIndex;

  while (stones > 0) {
    index = (index + 1) % pits.length;
    if (currentPlayer === 1 && index === playerTwoStore) continue;
    if (currentPlayer === 2 && index === playerOneStore) continue;
    pits[index] += 1;
    stones -= 1;
  }

  const message = resolveMove(index);
  if (isGameFinished()) {
    finishGame();
    return;
  }

  renderBoard();
  setStatus(message);
}

function resolveMove(lastIndex) {
  const storeIndex = currentPlayer === 1 ? playerOneStore : playerTwoStore;
  if (lastIndex === storeIndex) {
    setLesson("Your last stone landed in your store, so you get another turn. That is a powerful move to look for.");
    return `Player ${currentPlayer} gets another turn.`;
  }

  const captured = maybeCapture(lastIndex);
  if (!captured) {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    setLesson(`Now Player ${currentPlayer} chooses a pit. Count the stones before moving so you can predict where the last stone will land.`);
    return `Player ${currentPlayer}'s turn.`;
  }

  const capturingPlayer = currentPlayer;
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  setLesson("Capture: your last stone landed in an empty pit on your side, so you captured the opposite stones into your store.");
  return `Player ${capturingPlayer} captured stones. Player ${currentPlayer}'s turn.`;
}

function maybeCapture(lastIndex) {
  if (!isOwnPit(lastIndex) || pits[lastIndex] !== 1) return false;

  const opposite = oppositePit[lastIndex];
  if (pits[opposite] === 0) return false;

  const storeIndex = currentPlayer === 1 ? playerOneStore : playerTwoStore;
  pits[storeIndex] += pits[opposite] + pits[lastIndex];
  pits[opposite] = 0;
  pits[lastIndex] = 0;
  return true;
}

function isOwnPit(index) {
  if (currentPlayer === 1) return index >= 0 && index <= 5;
  return index >= 7 && index <= 12;
}

function isGameFinished() {
  const playerOneEmpty = pits.slice(0, 6).every((count) => count === 0);
  const playerTwoEmpty = pits.slice(7, 13).every((count) => count === 0);
  return playerOneEmpty || playerTwoEmpty;
}

function finishGame() {
  const playerOneRemaining = pits.slice(0, 6).reduce((sum, count) => sum + count, 0);
  const playerTwoRemaining = pits.slice(7, 13).reduce((sum, count) => sum + count, 0);

  pits[playerOneStore] += playerOneRemaining;
  pits[playerTwoStore] += playerTwoRemaining;

  for (let index = 0; index <= 5; index += 1) pits[index] = 0;
  for (let index = 7; index <= 12; index += 1) pits[index] = 0;

  gameOver = true;
  renderBoard();

  const p1 = pits[playerOneStore];
  const p2 = pits[playerTwoStore];
  const winner = p1 === p2 ? "Tie game." : `${p1 > p2 ? "Player 1" : "Player 2"} wins.`;
  setStatus(`Game over. Player 1: ${p1}. Player 2: ${p2}. ${winner}`, "good");
  setLesson("When one side is empty, the game ends. Remaining stones on the other side move into that player's store. Biggest store wins.");
}

function setStatus(message, tone = "") {
  statusStrip.textContent = message;
  statusStrip.classList.toggle("good", tone === "good");
  statusStrip.classList.toggle("warn", tone === "warn");
}

function setLesson(message) {
  lessonText.innerHTML = `<p>${message}</p>`;
}

newGameButton.addEventListener("click", newGame);

mentorToggle.addEventListener("click", () => {
  const hidden = mentorPanel.classList.toggle("mentor-hidden");
  appShell.classList.toggle("mentor-off", hidden);
  mentorToggle.classList.toggle("active", !hidden);
  mentorToggle.setAttribute("aria-pressed", String(!hidden));
});

newGame();
