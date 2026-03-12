// DOM references
const timerInput = document.getElementById('timer-input');
const startBtn = document.getElementById('start-btn');
const countdown = document.getElementById('countdown');
const instructions = document.getElementById('instructions');
const questionBox = document.getElementById('question-box');
const questionText = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const grid = document.getElementById('grid');
const scoreRight = document.getElementById('score-right');
const scoreWrong = document.getElementById('score-wrong');
const endMessage = document.getElementById('end-message');

// Lookup caches built by buildGrid()
const cellMap = {};          // cellMap["a,b"] → <td>
const labelMap = { row: {}, col: {} };  // labelMap.row[n] → [<th left>, <th right>]

// ─── Options (persisted) ─────────────────────────────────────────────────────

const OPTIONS_KEY = 'multiplicationOptions';
const options = { mode: 'countdown', hideTimer: false };

function loadOptions() {
  try {
    const saved = localStorage.getItem(OPTIONS_KEY);
    if (saved) Object.assign(options, JSON.parse(saved));
  } catch (e) {}
}

function saveOptions() {
  localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
}

function applyOptions() {
  document.querySelector(`input[name="opt-mode"][value="${options.mode}"]`).checked = true;
  document.getElementById('opt-hide-timer').checked = options.hideTimer;
  const isStopwatch = options.mode === 'stopwatch';
  document.getElementById('timer-setting').style.display = isStopwatch ? 'none' : '';
  document.getElementById('mode-label').style.display = isStopwatch ? '' : 'none';
}

// Game state
const state = {
  phase: 'idle',   // 'idle' | 'running' | 'pausing' | 'ended'
  totalSeconds: 240,
  secondsLeft: 240,
  stopwatchSeconds: 0,
  timerInterval: null,
  currentA: null,
  currentB: null,
  score: { right: 0, wrong: 0 },
  revealedPairs: new Map(),  // "a,b" → true (correct) | false (wrong)
};

// ─── Build Grid ──────────────────────────────────────────────────────────────

function buildGrid() {
  grid.innerHTML = '';

  // thead
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.appendChild(document.createElement('th')); // top-left corner
  for (let c = 1; c <= 12; c++) {
    const th = document.createElement('th');
    th.textContent = c;
    th.dataset.col = c;
    if (!labelMap.col[c]) labelMap.col[c] = [];
    labelMap.col[c].push(th);
    headRow.appendChild(th);
  }
  headRow.appendChild(document.createElement('th')); // top-right corner
  thead.appendChild(headRow);
  grid.appendChild(thead);

  // tbody
  const tbody = document.createElement('tbody');
  for (let r = 1; r <= 12; r++) {
    const tr = document.createElement('tr');

    // left label
    const thLeft = document.createElement('th');
    thLeft.textContent = r;
    thLeft.dataset.row = r;
    if (!labelMap.row[r]) labelMap.row[r] = [];
    labelMap.row[r].push(thLeft);
    tr.appendChild(thLeft);

    // data cells
    for (let c = 1; c <= 12; c++) {
      const td = document.createElement('td');
      td.dataset.row = r;
      td.dataset.col = c;
      cellMap[`${r},${c}`] = td;
      tr.appendChild(td);
    }

    // right label
    const thRight = document.createElement('th');
    thRight.textContent = r;
    thRight.dataset.row = r;
    labelMap.row[r].push(thRight);
    tr.appendChild(thRight);

    tbody.appendChild(tr);
  }
  grid.appendChild(tbody);

  // tfoot
  const tfoot = document.createElement('tfoot');
  const footRow = document.createElement('tr');
  footRow.appendChild(document.createElement('th')); // bottom-left corner
  for (let c = 1; c <= 12; c++) {
    const th = document.createElement('th');
    th.textContent = c;
    th.dataset.col = c;
    labelMap.col[c].push(th);
    footRow.appendChild(th);
  }
  footRow.appendChild(document.createElement('th')); // bottom-right corner
  tfoot.appendChild(footRow);
  grid.appendChild(tfoot);
}

// ─── Grid Helpers ────────────────────────────────────────────────────────────

function clearGrid() {
  for (let r = 1; r <= 12; r++) {
    for (let c = 1; c <= 12; c++) {
      const td = cellMap[`${r},${c}`];
      td.textContent = '';
      td.className = '';
    }
    for (const th of labelMap.row[r]) {
      th.classList.remove('active-label');
    }
  }
  for (let c = 1; c <= 12; c++) {
    for (const th of labelMap.col[c]) {
      th.classList.remove('active-label');
    }
  }
}

function revealRowCol(a, b, correct) {
  // Fill all cells in row a
  for (let c = 1; c <= 12; c++) {
    const td = cellMap[`${a},${c}`];
    td.textContent = a * c;
    if (c !== b) td.classList.add('highlight-row');
  }
  // Fill all cells in col b (skip intersection)
  for (let r = 1; r <= 12; r++) {
    if (r === a) continue;
    const td = cellMap[`${r},${b}`];
    td.textContent = r * b;
    td.classList.add('highlight-col');
  }
  // Intersection cell
  const intersection = cellMap[`${a},${b}`];
  intersection.textContent = a * b;
  intersection.classList.remove('highlight-row', 'highlight-col', 'highlight-both');
  if (correct) {
    intersection.classList.add('answer-cell');
  } else {
    intersection.classList.add('wrong-flash');
  }
}

function revealAll() {
  for (let r = 1; r <= 12; r++) {
    for (let c = 1; c <= 12; c++) {
      cellMap[`${r},${c}`].textContent = r * c;
    }
  }
}

// ─── Game Flow ───────────────────────────────────────────────────────────────

function handleStartStop() {
  if (state.phase === 'running' || state.phase === 'pausing') {
    endGame();
  } else {
    startGame();
  }
}

function startGame() {
  if (options.mode === 'countdown') {
    const minutes = parseInt(timerInput.value, 10) || 4;
    state.totalSeconds = minutes * 60;
    state.secondsLeft = state.totalSeconds;
  } else {
    state.stopwatchSeconds = 0;
  }
  state.score.right = 0;
  state.score.wrong = 0;
  state.revealedPairs = new Map();
  state.phase = 'running';

  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(tickTimer, 1000);

  startBtn.textContent = 'Stop';
  scoreRight.textContent = 'Right: 0';
  scoreWrong.textContent = 'Wrong: 0';
  countdown.classList.remove('warning');
  updateCountdown();

  instructions.classList.remove('visible');
  endMessage.classList.remove('visible');
  questionBox.classList.remove('visible', 'answer-mode');
  clearGrid();
  nextQuestion();
}

function nextQuestion() {
  if (state.phase === 'ended') return;

  // Check if all 144 pairs done
  if (state.revealedPairs.size >= 144) {
    endGame();
    return;
  }

  // Pick a pair not yet answered
  let a, b;
  let attempts = 0;
  do {
    a = Math.floor(Math.random() * 12) + 1;
    b = Math.floor(Math.random() * 12) + 1;
    attempts++;
  } while (state.revealedPairs.has(`${a},${b}`) && attempts < 200);

  state.currentA = a;
  state.currentB = b;
  state.phase = 'running';

  // Apply highlights
  for (let c = 1; c <= 12; c++) {
    cellMap[`${a},${c}`].classList.add(c === b ? 'highlight-both' : 'highlight-row');
  }
  for (let r = 1; r <= 12; r++) {
    if (r !== a) cellMap[`${r},${b}`].classList.add('highlight-col');
  }

  // Active labels
  for (const th of labelMap.row[a]) th.classList.add('active-label');
  for (const th of labelMap.col[b]) th.classList.add('active-label');

  // Show question box in question mode
  questionText.textContent = `${a} × ${b} = `;
  answerInput.value = '';
  questionBox.classList.remove('answer-mode');
  questionBox.classList.add('visible');
  answerInput.focus();
}

function submitAnswer() {
  if (state.phase !== 'running') return;

  const val = parseInt(answerInput.value, 10);
  if (isNaN(val)) return;

  const a = state.currentA;
  const b = state.currentB;
  const correct = val === a * b;

  if (correct) {
    state.score.right++;
    scoreRight.textContent = `Right: ${state.score.right}`;
  } else {
    state.score.wrong++;
    scoreWrong.textContent = `Wrong: ${state.score.wrong}`;
  }

  state.revealedPairs.set(`${a},${b}`, correct);
  state.phase = 'pausing';

  // Clear highlights before revealing
  for (let c = 1; c <= 12; c++) {
    cellMap[`${a},${c}`].classList.remove('highlight-row', 'highlight-both', 'highlight-col');
  }
  for (let r = 1; r <= 12; r++) {
    cellMap[`${r},${b}`].classList.remove('highlight-col', 'highlight-row', 'highlight-both');
  }

  revealRowCol(a, b, correct);

  // Switch question-box to answer mode
  questionText.textContent = `${a} × ${b} = ${a * b}`;
  questionBox.classList.add('answer-mode');
}

function continueAfterAnswer() {
  if (state.phase !== 'pausing') return;
  questionBox.classList.remove('visible', 'answer-mode');
  clearGrid();
  nextQuestion();
}

// ─── Timer ───────────────────────────────────────────────────────────────────

function updateCountdown() {
  if (options.hideTimer) {
    countdown.textContent = '(timer running)';
    return;
  }
  if (options.mode === 'countdown') {
    const m = Math.floor(state.secondsLeft / 60);
    const s = state.secondsLeft % 60;
    countdown.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  } else {
    const m = Math.floor(state.stopwatchSeconds / 60);
    const s = state.stopwatchSeconds % 60;
    countdown.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  }
}

function tickTimer() {
  if (options.mode === 'countdown') {
    state.secondsLeft--;
    if (state.secondsLeft <= 30) countdown.classList.add('warning');
    if (state.secondsLeft <= 0) { endGame(); return; }
  } else {
    state.stopwatchSeconds++;
  }
  updateCountdown();
}

function formatElapsed() {
  const elapsed = options.mode === 'countdown'
    ? state.totalSeconds - state.secondsLeft
    : state.stopwatchSeconds;
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return s === 0 ? `${m} minute${m !== 1 ? 's' : ''}` : `${m}:${s.toString().padStart(2, '0')}`;
}

function showResultGrid() {
  // Show only answered cells, colored by correctness
  clearGrid();
  for (const [key, correct] of state.revealedPairs) {
    const [r, c] = key.split(',').map(Number);
    const td = cellMap[key];
    td.textContent = r * c;
    td.classList.add(correct ? 'answer-cell' : 'wrong-cell');
  }
}

function showAllFacts() {
  clearGrid();
  revealAll();
  endMessage.classList.remove('visible');
  countdown.textContent = '';
  scoreRight.textContent = 'Right: 0';
  scoreWrong.textContent = 'Wrong: 0';
}

function endGame() {
  state.phase = 'ended';
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  questionBox.classList.remove('visible', 'answer-mode');
  startBtn.textContent = 'Start';
  countdown.textContent = 'Done!';
  countdown.classList.remove('warning');

  showResultGrid();

  const total = state.revealedPairs.size;
  const right = state.score.right;
  const pct = total > 0 ? Math.round(right / total * 100) : 0;
  const timeStr = formatElapsed();

  endMessage.innerHTML = '';
  const msg = document.createElement('span');
  const prefix = options.mode === 'countdown' ? "Time's up!" : 'Stopped!';
  msg.textContent = `${prefix} You completed ${total} fact${total !== 1 ? 's' : ''} in ${timeStr} and got ${right} (${pct}%) correct.`;
  const btn = document.createElement('button');
  btn.id = 'show-all-btn';
  btn.textContent = 'Show All Facts';
  btn.addEventListener('click', showAllFacts);
  endMessage.appendChild(msg);
  endMessage.appendChild(btn);
  endMessage.classList.add('visible');
}

// ─── Event Listeners ─────────────────────────────────────────────────────────

startBtn.addEventListener('click', handleStartStop);
instructions.addEventListener('click', () => instructions.classList.remove('visible'));

submitBtn.addEventListener('click', submitAnswer);
document.getElementById('continue-btn').addEventListener('click', continueAfterAnswer);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (state.phase === 'running') {
      submitAnswer();
    } else if (state.phase === 'pausing') {
      continueAfterAnswer();
    }
  }
});

// Options popup toggle
const optionsBtn = document.getElementById('options-btn');
const optionsPopup = document.getElementById('options-popup');

optionsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  optionsPopup.classList.toggle('visible');
});

document.addEventListener('click', () => optionsPopup.classList.remove('visible'));
optionsPopup.addEventListener('click', (e) => e.stopPropagation());

document.querySelectorAll('input[name="opt-mode"]').forEach(radio => {
  radio.addEventListener('change', () => {
    options.mode = radio.value;
    saveOptions();
    const isStopwatch = options.mode === 'stopwatch';
    document.getElementById('timer-setting').style.display = isStopwatch ? 'none' : '';
    document.getElementById('mode-label').style.display = isStopwatch ? '' : 'none';
  });
});

document.getElementById('opt-hide-timer').addEventListener('change', (e) => {
  options.hideTimer = e.target.checked;
  saveOptions();
});


// ─── Init ────────────────────────────────────────────────────────────────────

loadOptions();
buildGrid();
revealAll();                       // req 11: show all values on load
instructions.classList.add('visible');  // req 10: show instructions on first load
applyOptions();
