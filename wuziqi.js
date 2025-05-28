// 游戏常量
const BOARD_SIZE = 15;
const CELL_SIZE = 40;
const BLACK = 1;
const WHITE = 2;
const HUMAN = 1;
const COMPUTER = 2;

// 游戏状态
let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
let currentPlayer = BLACK;
let gameOver = false;
let gameMode = HUMAN; // 1: 人机对战, 2: 双人对战

// 获取画布和上下文
const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const statusDisplay = document.getElementById('currentPlayer');
const restartBtn = document.getElementById('restartBtn');

// 初始化游戏
function initGame() {
    drawBoard();
    canvas.addEventListener('click', handleClick);
    restartBtn.addEventListener('click', restartGame);
    
    // 添加游戏模式选择按钮
    const modeContainer = document.createElement('div');
    modeContainer.className = 'mode-selector';
    
    const humanBtn = document.createElement('button');
    humanBtn.textContent = '人机对战';
    humanBtn.addEventListener('click', () => {
        gameMode = HUMAN;
        restartGame();
    });
    
    const pvpBtn = document.createElement('button');
    pvpBtn.textContent = '双人对战';
    pvpBtn.addEventListener('click', () => {
        gameMode = COMPUTER;
        restartGame();
    });
    
    modeContainer.appendChild(humanBtn);
    modeContainer.appendChild(pvpBtn);
    document.querySelector('.game-container').insertBefore(modeContainer, canvas);
}

// 绘制棋盘
function drawBoard() {
    ctx.fillStyle = '#dcb35c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    // 绘制网格线
    for (let i = 0; i < BOARD_SIZE; i++) {
        // 横线
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2);
        ctx.lineTo(canvas.width - CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2);
        ctx.stroke();
        
        // 竖线
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2);
        ctx.lineTo(i * CELL_SIZE + CELL_SIZE / 2, canvas.height - CELL_SIZE / 2);
        ctx.stroke();
    }
    
    // 绘制天元和星位
    const starPoints = [3, 7, 11];
    starPoints.forEach(x => {
        starPoints.forEach(y => {
            drawStar(x, y);
        });
    });
}

// 绘制星位
function drawStar(x, y) {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
        x * CELL_SIZE + CELL_SIZE / 2,
        y * CELL_SIZE + CELL_SIZE / 2,
        4, 0, Math.PI * 2
    );
    ctx.fill();
}

// 绘制棋子
function drawPiece(x, y, player) {
    ctx.fillStyle = player === BLACK ? '#000' : '#fff';
    ctx.beginPath();
    ctx.arc(
        x * CELL_SIZE + CELL_SIZE / 2,
        y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2, 0, Math.PI * 2
    );
    ctx.fill();
    
    if (player === WHITE) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// 处理点击事件
function handleClick(e) {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[y][x] === 0) {
        board[y][x] = currentPlayer;
        drawPiece(x, y, currentPlayer);
        
        if (checkWin(x, y)) {
            gameOver = true;
            statusDisplay.textContent = `游戏结束! ${currentPlayer === BLACK ? '黑棋' : '白棋'}获胜!`;
            return;
        }
        
        currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
        statusDisplay.textContent = currentPlayer === BLACK ? '黑棋' : '白棋';
        
        // 如果是人机对战且轮到电脑下棋
        if (gameMode === HUMAN && currentPlayer === WHITE) {
            setTimeout(computerMove, 500);
        }
    }
}

// 检查胜利条件
function checkWin(x, y) {
    const directions = [
        [1, 0],   // 水平
        [0, 1],   // 垂直
        [1, 1],   // 对角线
        [1, -1]   // 反对角线
    ];
    
    for (const [dx, dy] of directions) {
        let count = 1;
        
        // 正向检查
        for (let i = 1; i < 5; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE || board[ny][nx] !== currentPlayer) {
                break;
            }
            count++;
        }
        
        // 反向检查
        for (let i = 1; i < 5; i++) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE || board[ny][nx] !== currentPlayer) {
                break;
            }
            count++;
        }
        
        if (count >= 5) {
            return true;
        }
    }
    
    return false;
}

// 重新开始游戏
function restartGame() {
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    currentPlayer = BLACK;
    gameOver = false;
    statusDisplay.textContent = '黑棋';
    drawBoard();
    
    // 如果是人机对战且电脑先手
    if (gameMode === HUMAN && currentPlayer === WHITE) {
        setTimeout(computerMove, 500);
    }
}

// 电脑走棋
function computerMove() {
    if (gameOver) return;
    
    // 简单的评分系统
    let bestScore = -Infinity;
    let bestMove = {x: 0, y: 0};
    
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] === 0) {
                // 评分逻辑
                let score = evaluateMove(x, y);
                
                // 优先选择中心位置
                const centerDist = Math.abs(x - 7) + Math.abs(y - 7);
                score += (14 - centerDist) * 0.5;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = {x, y};
                }
            }
        }
    }
    
    // 执行最佳移动
    board[bestMove.y][bestMove.x] = currentPlayer;
    drawPiece(bestMove.x, bestMove.y, currentPlayer);
    
    if (checkWin(bestMove.x, bestMove.y)) {
        gameOver = true;
        statusDisplay.textContent = `游戏结束! ${currentPlayer === BLACK ? '黑棋' : '白棋'}获胜!`;
        return;
    }
    
    currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    statusDisplay.textContent = currentPlayer === BLACK ? '黑棋' : '白棋';
}

// 评估移动分数
function evaluateMove(x, y) {
    let score = 0;
    
    // 检查四个方向
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    
    for (const [dx, dy] of directions) {
        // 检查电脑棋子
        let computerCount = countConsecutive(x, y, dx, dy, WHITE);
        
        // 检查玩家棋子
        let humanCount = countConsecutive(x, y, dx, dy, BLACK);
        
        // 根据连子数评分
        if (computerCount >= 4) score += 1000;
        else if (computerCount === 3) score += 100;
        else if (computerCount === 2) score += 10;
        else if (computerCount === 1) score += 1;
        
        // 防守玩家连子
        if (humanCount >= 4) score += 800;
        else if (humanCount === 3) score += 80;
        else if (humanCount === 2) score += 8;
    }
    
    return score;
}

// 计算连续棋子数
function countConsecutive(x, y, dx, dy, player) {
    let count = 1;
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE || board[ny][nx] !== player) {
            break;
        }
        count++;
    }
    
    // 反向检查
    for (let i = 1; i < 5; i++) {
        const nx = x - dx * i;
        const ny = y - dy * i;
        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE || board[ny][nx] !== player) {
            break;
        }
        count++;
    }
    
    return count;
}

// 开始游戏
initGame();