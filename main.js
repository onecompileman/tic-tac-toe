let playerWins = 0;
let ties = 0;
let cpuWins = 0;

let currentTurn = 'X';

let currentBoard = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

const turnText = document.getElementById('turn');
const playerWinText = document.getElementById('playerWinText');
const cpuWinText = document.getElementById('cpuWinText');
const tiesText = document.getElementById('tiesText');

const apiKey = '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'; // Replace with your actual API key
const apiUrl = '	https://api.openai.com/v1/chat/completions';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
};

function chatGPTMove() {
  const requestData = {
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: `
        I'm playing a tic tac toe game,  please select the winning move for "O" but don't let "X" wins as well put "O" on null,  please return 2d array row and column indexes for your move, return in this format "row,col" example 2,2, don't explain.
        The board is below in 2d array:
        ${JSON.stringify(currentBoard)}
        `,
      },
    ],
  };

  fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the API
      const [row, col] = data.choices[0].message.content.split(',');
      currentBoard[+row][+col] = 'O';

      const tileEl = document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
      );
      tileEl.innerHTML = 'O';
      tileEl.classList.add('O');

      setTimeout(() => {
        const gameEnded = checkState();

        if (!gameEnded) {
          currentTurn = currentTurn === 'X' ? 'O' : 'X';
          turnText.innerHTML = currentTurn;
        }
      }, 300);
    });
}

function makeMove(gameTileEl) {
  if (!gameTileEl.innerHTML && currentTurn === 'X') {
    const row = +gameTileEl.getAttribute('data-row');
    const col = +gameTileEl.getAttribute('data-col');

    currentBoard[row][col] = currentTurn;
    gameTileEl.classList.add(currentTurn);
    gameTileEl.innerHTML = currentTurn;

    setTimeout(() => {
      const gameEnded = checkState();

      if (!gameEnded) {
        currentTurn = currentTurn === 'X' ? 'O' : 'X';
        turnText.innerHTML = currentTurn;

        setTimeout(() => {
          chatGPTMove();
        }, 1000);
      }
    }, 300);
  }
}

function checkState() {
  const playerWin = checkWin(currentBoard, 'X');
  const cpuWin = checkWin(currentBoard, 'O');
  const tie = checkTie(currentBoard);

  if (playerWin) {
    playerWins++;
    playerWinText.innerHTML = playerWins;
    alert('Player wins');
    reset();
    return true;
  } else if (cpuWin) {
    cpuWins++;
    cpuWinText.innerHTML = cpuWins;
    alert('CPU wins');

    reset();
    return true;
  } else if (tie) {
    ties++;
    tiesText.innerHTML = ties;
    alert("It's a tie");

    reset();
    return true;
  }

  return false;
}

function reset() {
  currentBoard = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  document.querySelectorAll('.game-tile').forEach((tile) => {
    tile.innerHTML = '';
    tile.className = 'game-tile';
  });
  currentTurn = 'X';
}

function checkTie(board) {
  return board.every((row) => row.every((col) => col != null));
}

function checkWin(board, player) {
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] === player &&
      board[i][1] === player &&
      board[i][2] === player
    ) {
      return true;
    }
  }

  for (let j = 0; j < 3; j++) {
    if (
      board[0][j] === player &&
      board[1][j] === player &&
      board[2][j] === player
    ) {
      return true;
    }
  }

  if (
    (board[0][0] === player &&
      board[1][1] === player &&
      board[2][2] === player) ||
    (board[0][2] === player && board[1][1] === player && board[2][0] === player)
  ) {
    return true;
  }

  return false;
}
