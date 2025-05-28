// 游戏常量
const DIFFICULTIES = {
  easy: { size: 10, mines: 10 },
  medium: { size: 16, mines: 40 },
  hard: { size: 20, mines: 99 }
};
let GRID_SIZE = DIFFICULTIES.easy.size;
const CELL_SIZE = 40;
let MINE_COUNT = DIFFICULTIES.easy.mines;

// 游戏状态
let grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
let revealed = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));
let flagged = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));
let gameOver = false;
let minesPlaced = false;
let canvas, ctx;
let statusDisplay;

// 初始化游戏
function initGame(difficulty = 'easy') {
    // 设置难度
    GRID_SIZE = DIFFICULTIES[difficulty].size;
    MINE_COUNT = DIFFICULTIES[difficulty].mines;
    
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    statusDisplay = document.getElementById('statusDisplay');
    
    // 调整画布大小
    canvas.width = GRID_SIZE * CELL_SIZE;
    canvas.height = GRID_SIZE * CELL_SIZE;
    
    // 重置游戏状态
    grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    revealed = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));
    flagged = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));
    gameOver = false;
    minesPlaced = false;
    
    // 添加事件监听
    canvas.addEventListener('mousedown', handleClick);
    canvas.addEventListener('contextmenu', e => e.preventDefault()); // 禁用右键菜单
    
    // 添加难度选择按钮事件
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            initGame(btn.dataset.difficulty);
        });
    });

    document.getElementById('restartBtn').addEventListener('click', () => initGame());
    
    // 更新状态显示
    updateMineCount();
    
    // 绘制初始网格
    drawGrid();
}

// 绘制网格
function drawGrid() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    
    // 绘制网格线
    for (let i = 0; i <= GRID_SIZE; i++) {
        // 横线
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
        
        // 竖线
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
    }
    
    // 绘制单元格内容
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (revealed[y][x]) {
                drawCell(x, y);
            } else if (flagged[y][x]) {
                drawFlag(x, y);
            } else {
                drawCoveredCell(x, y);
            }
        }
    }
}

// 绘制未揭示的单元格
function drawCoveredCell(x, y) {
    const cellX = x * CELL_SIZE;
    const cellY = y * CELL_SIZE;
    
    // 绘制3D效果
    ctx.fillStyle = '#ddd';
    ctx.fillRect(cellX + 1, cellY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    
    // 高光
    ctx.fillStyle = '#fff';
    ctx.fillRect(cellX + 1, cellY + 1, CELL_SIZE - 3, 2);
    ctx.fillRect(cellX + 1, cellY + 1, 2, CELL_SIZE - 3);
    
    // 阴影
    ctx.fillStyle = '#999';
    ctx.fillRect(cellX + CELL_SIZE - 3, cellY + 1, 2, CELL_SIZE - 2);
    ctx.fillRect(cellX + 1, cellY + CELL_SIZE - 3, CELL_SIZE - 2, 2);
}

// 绘制单元格内容
function drawCell(x, y) {
    const cellX = x * CELL_SIZE;
    const cellY = y * CELL_SIZE;
    
    // 绘制已揭示的单元格背景
    ctx.fillStyle = '#bbb';
    ctx.fillRect(cellX + 1, cellY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    
    // 如果是地雷
    if (grid[y][x] === -1) {
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(
            cellX + CELL_SIZE / 2,
            cellY + CELL_SIZE / 2,
            CELL_SIZE / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();
    } else if (grid[y][x] > 0) {
        // 显示数字
        ctx.fillStyle = getNumberColor(grid[y][x]);
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            grid[y][x],
            cellX + CELL_SIZE / 2,
            cellY + CELL_SIZE / 2
        );
    }
}

// 绘制旗帜
function drawFlag(x, y) {
    const cellX = x * CELL_SIZE;
    const cellY = y * CELL_SIZE;
    
    // 旗杆
    ctx.fillStyle = '#000';
    ctx.fillRect(
        cellX + CELL_SIZE / 2 - 1,
        cellY + 5,
        2,
        CELL_SIZE - 10
    );
    
    // 旗面
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.moveTo(cellX + CELL_SIZE / 2 + 1, cellY + 10);
    ctx.lineTo(cellX + CELL_SIZE - 5, cellY + CELL_SIZE / 2);
    ctx.lineTo(cellX + CELL_SIZE / 2 + 1, cellY + CELL_SIZE - 10);
    ctx.fill();
}

// 获取数字颜色
function getNumberColor(num) {
    const colors = [
        '', // 0
        '#0000ff', // 1
        '#008000', // 2
        '#ff0000', // 3
        '#000080', // 4
        '#800000', // 5
        '#008080', // 6
        '#000000', // 7
        '#808080'  // 8
    ];
    return colors[num];
}

// 处理点击事件
function handleClick(e) {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    // 确保在网格范围内
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    
    // 第一次点击时放置地雷
    if (!minesPlaced) {
        placeMines(x, y);
        minesPlaced = true;
    }
    
    // 右键标记旗帜
    if (e.button === 2) {
        if (!revealed[y][x]) {
            flagged[y][x] = !flagged[y][x];
            drawGrid();
            updateMineCount();
        }
        return;
    }
    
    // 左键点击
    if (!flagged[y][x] && !revealed[y][x]) {
        revealCell(x, y);
        drawGrid();
        
        // 检查游戏结束条件
        if (grid[y][x] === -1) {
            gameOver = true;
            revealAllMines();
            statusDisplay.textContent = '游戏结束!';
        } else if (checkWin()) {
            gameOver = true;
            statusDisplay.textContent = '恭喜你赢了!';
        }
    }
}

// 放置地雷
function placeMines(firstX, firstY) {
    let minesPlaced = 0;
    
    while (minesPlaced < MINE_COUNT) {
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        
        // 确保第一次点击的位置及其周围没有地雷
        if (Math.abs(x - firstX) <= 1 && Math.abs(y - firstY) <= 1) continue;
        
        if (grid[y][x] !== -1) {
            grid[y][x] = -1;
            minesPlaced++;
            
            // 更新周围格子的数字
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    
                    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && grid[ny][nx] !== -1) {
                        grid[ny][nx]++;
                    }
                }
            }
        }
    }
}

// 揭示单元格
function revealCell(x, y) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || revealed[y][x] || flagged[y][x]) {
        return;
    }
    
    revealed[y][x] = true;
    
    // 如果是空白格子，递归揭示周围格子
    if (grid[y][x] === 0) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx !== 0 || dy !== 0) {
                    revealCell(x + dx, y + dy);
                }
            }
        }
    }
}

// 揭示所有地雷
function revealAllMines() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (grid[y][x] === -1) {
                revealed[y][x] = true;
            }
        }
    }
    drawGrid();
}

// 检查胜利条件
function checkWin() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (grid[y][x] !== -1 && !revealed[y][x]) {
                return false;
            }
        }
    }
    return true;
}

// 更新剩余地雷数
function updateMineCount() {
    const flaggedCount = flagged.flat().filter(Boolean).length;
    statusDisplay.textContent = `剩余地雷: ${MINE_COUNT - flaggedCount}`;
}

// 初始化游戏
window.onload = initGame;