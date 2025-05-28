// 俄罗斯方块游戏逻辑
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]] // Z
];

const COLORS = [
    '#00FFFF', // I
    '#FFFF00', // O
    '#AA00FF', // T
    '#FFA500', // L
    '#0000FF', // J
    '#00FF00', // S
    '#FF0000' // Z
];

let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let score = 0;
let gameInterval = null;
let isPaused = false;

function initBoard() {
    const boardElement = document.getElementById('tetrisBoard');
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, ${BLOCK_SIZE}px)`;
    boardElement.style.gridTemplateRows = `repeat(${ROWS}, ${BLOCK_SIZE}px)`;
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = document.createElement('div');
            cell.className = 'tetris-cell';
            cell.id = `cell-${y}-${x}`;
            boardElement.appendChild(cell);
        }
    }
}

function newPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    currentPiece = SHAPES[shapeIndex];
    currentX = Math.floor(COLS / 2) - Math.floor(currentPiece[0].length / 2);
    currentY = 0;
    
    if (collision()) {
        gameOver();
        return false;
    }
    
    return true;
}

function draw() {
    // 清除之前的绘制
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = document.getElementById(`cell-${y}-${x}`);
            cell.style.backgroundColor = board[y][x] ? COLORS[board[y][x] - 1] : 'white';
        }
    }
    
    // 绘制当前方块
    if (currentPiece) {
        for (let y = 0; y < currentPiece.length; y++) {
            for (let x = 0; x < currentPiece[y].length; x++) {
                if (currentPiece[y][x]) {
                    const cellY = currentY + y;
                    const cellX = currentX + x;
                    if (cellY >= 0 && cellY < ROWS && cellX >= 0 && cellX < COLS) {
                        const cell = document.getElementById(`cell-${cellY}-${cellX}`);
                        cell.style.backgroundColor = COLORS[SHAPES.indexOf(currentPiece)];
                    }
                }
            }
        }
    }
}

function collision() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x]) {
                const newX = currentX + x;
                const newY = currentY + y;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function lock() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x]) {
                const boardY = currentY + y;
                const boardX = currentX + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = SHAPES.indexOf(currentPiece) + 1;
                }
            }
        }
    }
    
    // 检查并清除完整的行
    clearLines();
    
    // 生成新方块
    newPiece();
    draw();
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            // 移除该行
            board.splice(y, 1);
            // 在顶部添加新行
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // 重新检查当前行
        }
    }
    
    if (linesCleared > 0) {
        score += linesCleared * 100;
        document.getElementById('score').textContent = score;
    }
}

function rotate() {
    if (!currentPiece) return;
    
    const newPiece = [];
    for (let x = 0; x < currentPiece[0].length; x++) {
        newPiece.push([]);
        for (let y = currentPiece.length - 1; y >= 0; y--) {
            newPiece[x].push(currentPiece[y][x]);
        }
    }
    
    const oldPiece = currentPiece;
    currentPiece = newPiece;
    
    if (collision()) {
        currentPiece = oldPiece;
    }
    
    draw();
}

function moveDown() {
    if (!currentPiece || isPaused) return;
    
    currentY++;
    
    if (collision()) {
        currentY--;
        lock();
    }
    
    draw();
}

function moveLeft() {
    if (!currentPiece || isPaused) return;
    
    currentX--;
    
    if (collision()) {
        currentX++;
    }
    
    draw();
}

function moveRight() {
    if (!currentPiece || isPaused) return;
    
    currentX++;
    
    if (collision()) {
        currentX--;
    }
    
    draw();
}

function drop() {
    if (!currentPiece || isPaused) return;
    
    while (!collision()) {
        currentY++;
    }
    
    currentY--;
    lock();
    draw();
}

function startGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    document.getElementById('score').textContent = score;
    isPaused = false;
    
    initBoard();
    newPiece();
    draw();
    
    gameInterval = setInterval(moveDown, 500);
}

function pauseGame() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '继续' : '暂停';
}

function gameOver() {
    clearInterval(gameInterval);
    gameInterval = null;
    alert(`游戏结束! 你的分数是: ${score}`);
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (!currentPiece || isPaused) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowUp':
            rotate();
            break;
        case ' ':
            drop();
            break;
    }
});

// 按钮事件
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);