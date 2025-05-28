// 井字棋游戏主逻辑
const canvas = document.getElementById('ticTacToeCanvas');
const ctx = canvas.getContext('2d');

// 游戏状态
let board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];
let currentPlayer = 'X';
let gameOver = false;
let gameMode = 'human'; // 'human' 人机对战, 'pvp' 双人对战

// 初始化游戏
function initGame() {
    // 绘制棋盘
    drawBoard();
    
    // 添加点击事件
    canvas.addEventListener('click', handleCanvasClick);
    
    // 添加重置按钮事件
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    
    // 添加游戏模式选择按钮
    const modeContainer = document.createElement('div');
    modeContainer.className = 'mode-selector';
    
    const humanBtn = document.createElement('button');
    humanBtn.textContent = '人机对战';
    humanBtn.addEventListener('click', () => {
        gameMode = 'human';
        resetGame();
    });
    
    const pvpBtn = document.createElement('button');
    pvpBtn.textContent = '双人对战';
    pvpBtn.addEventListener('click', () => {
        gameMode = 'pvp';
        resetGame();
    });
    
    modeContainer.appendChild(humanBtn);
    modeContainer.appendChild(pvpBtn);
    document.getElementById('game-container').insertBefore(modeContainer, canvas);
}

// 处理画布点击
function handleCanvasClick(event) {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 计算点击的格子
    const cellSize = canvas.width / 3;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    // 检查格子是否为空
    if (board[row][col] === '') {
        board[row][col] = currentPlayer;
        drawBoard();
        
        // 检查胜负
        if (checkWin(currentPlayer)) {
            document.getElementById('status').textContent = `玩家${currentPlayer}获胜！`;
            gameOver = true;
            return;
        }
        
        // 检查平局
        if (checkDraw()) {
            document.getElementById('status').textContent = '平局！';
            gameOver = true;
            return;
        }
        
        // 切换玩家
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById('status').textContent = `玩家${currentPlayer}的回合`;
        
        // 如果是人机对战且轮到电脑
        if (gameMode === 'human' && currentPlayer === 'O') {
            setTimeout(computerMove, 500);
        }
    }
}

// 绘制棋盘
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制格子
    const cellSize = canvas.width / 3;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    for (let i = 1; i < 3; i++) {
        // 竖线
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        
        // 横线
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
    
    // 绘制棋子
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] !== '') {
                const centerX = col * cellSize + cellSize / 2;
                const centerY = row * cellSize + cellSize / 2;
                const radius = cellSize / 3;
                
                if (board[row][col] === 'X') {
                    // 绘制X
                    ctx.strokeStyle = '#f00';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(centerX - radius, centerY - radius);
                    ctx.lineTo(centerX + radius, centerY + radius);
                    ctx.moveTo(centerX + radius, centerY - radius);
                    ctx.lineTo(centerX - radius, centerY + radius);
                    ctx.stroke();
                } else {
                    // 绘制O
                    ctx.strokeStyle = '#00f';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }
    }
}

// 检查胜利条件
function checkWin(player) {
    // 检查行
    for (let row = 0; row < 3; row++) {
        if (board[row][0] === player && board[row][1] === player && board[row][2] === player) {
            return true;
        }
    }
    
    // 检查列
    for (let col = 0; col < 3; col++) {
        if (board[0][col] === player && board[1][col] === player && board[2][col] === player) {
            return true;
        }
    }
    
    // 检查对角线
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
        return true;
    }
    
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
        return true;
    }
    
    return false;
}

// 检查平局
function checkDraw() {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === '') {
                return false;
            }
        }
    }
    return true;
}

// 重置游戏
function resetGame() {
    board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    currentPlayer = 'X';
    gameOver = false;
    document.getElementById('status').textContent = '玩家X的回合';
    drawBoard();
    
    // 如果是人机对战且电脑先手
    if (gameMode === 'human' && currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
}

// 电脑走棋
function computerMove() {
    if (gameOver) return;
    
    // 改进的AI算法：使用评分系统
    let bestScore = -Infinity;
    let bestMove = {row: 0, col: 0};
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === '') {
                // 模拟走棋
                board[row][col] = 'O';
                
                // 检查是否能直接获胜
                if (checkWin('O')) {
                    board[row][col] = '';
                    bestMove = {row, col};
                    break;
                }
                
                // 检查是否需要阻止玩家获胜
                board[row][col] = 'X';
                if (checkWin('X')) {
                    board[row][col] = '';
                    bestMove = {row, col};
                    break;
                }
                
                board[row][col] = '';
                
                // 评分系统
                let score = 0;
                
                // 中心位置优先
                if ((row === 1 && col === 1)) {
                    score += 3;
                }
                
                // 角落位置次优
                else if ((row === 0 || row === 2) && (col === 0 || col === 2)) {
                    score += 2;
                }
                
                // 边缘位置
                else {
                    score += 1;
                }
                
                // 寻找潜在获胜机会
                board[row][col] = 'O';
                if (countPotentialWins('O') > 0) {
                    score += 5;
                }
                board[row][col] = '';
                
                // 阻止玩家潜在获胜机会
                board[row][col] = 'X';
                if (countPotentialWins('X') > 0) {
                    score += 4;
                }
                board[row][col] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = {row, col};
                }
            }
        }
    }
    
    // 执行最佳走法
    board[bestMove.row][bestMove.col] = 'O';
    drawBoard();
    
    // 检查胜负
    if (checkWin('O')) {
        document.getElementById('status').textContent = '电脑获胜！';
        gameOver = true;
        return;
    }
    
    // 检查平局
    if (checkDraw()) {
        document.getElementById('status').textContent = '平局！';
        gameOver = true;
        return;
    }
    
    // 切换玩家
    currentPlayer = 'X';
    document.getElementById('status').textContent = '玩家X的回合';
    
    // 如果是人机对战且轮到电脑
    if (gameMode === 'human' && currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
}

// 计算潜在获胜机会
function countPotentialWins(player) {
    let count = 0;
    
    // 检查行
    for (let row = 0; row < 3; row++) {
        let playerCount = 0;
        let emptyCount = 0;
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === player) playerCount++;
            else if (board[row][col] === '') emptyCount++;
        }
        if (playerCount === 2 && emptyCount === 1) count++;
    }
    
    // 检查列
    for (let col = 0; col < 3; col++) {
        let playerCount = 0;
        let emptyCount = 0;
        for (let row = 0; row < 3; row++) {
            if (board[row][col] === player) playerCount++;
            else if (board[row][col] === '') emptyCount++;
        }
        if (playerCount === 2 && emptyCount === 1) count++;
    }
    
    // 检查对角线
    let playerCount = 0;
    let emptyCount = 0;
    for (let i = 0; i < 3; i++) {
        if (board[i][i] === player) playerCount++;
        else if (board[i][i] === '') emptyCount++;
    }
    if (playerCount === 2 && emptyCount === 1) count++;
    
    playerCount = 0;
    emptyCount = 0;
    for (let i = 0; i < 3; i++) {
        if (board[i][2-i] === player) playerCount++;
        else if (board[i][2-i] === '') emptyCount++;
    }
    if (playerCount === 2 && emptyCount === 1) count++;
    
    return count;
}

// 启动游戏
window.onload = initGame;