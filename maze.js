// 迷宫游戏主逻辑
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

// 游戏参数
const cellSize = 20;
const playerSize = 15;
const wallColor = '#333';
const pathColor = '#eee';
const playerColor = '#E91E63';
const exitColor = '#4CAF50';

// 游戏状态
let maze = [];
let player = { x: 1, y: 1 };
let exit = { x: 23, y: 23 };
let gameOver = false;
let keys = {};

// 键盘控制
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 重置游戏
resetBtn.addEventListener('click', function() {
    resetGame();
    gameLoop();
});

function resetGame() {
    generateMaze();
    player = { x: 1, y: 1 };
    exit = { x: 23, y: 23 };
    gameOver = false;
    statusText.textContent = '使用方向键移动角色';
}

// 生成迷宫
function generateMaze() {
    // 简单迷宫生成算法
    const size = 25;
    maze = Array(size).fill().map(() => Array(size).fill(1));
    
    // 创建路径
    for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
            if (Math.random() > 0.3) {
                maze[y][x] = 0;
            }
        }
    }
    
    // 确保起点和终点是通路
    maze[1][1] = 0;
    maze[23][23] = 0;
}

// 游戏主循环
function gameLoop() {
    if (gameOver) return;
    
    update();
    render();
    
    requestAnimationFrame(gameLoop);
}

// 更新游戏状态
function update() {
    // 保存旧位置
    const oldX = player.x;
    const oldY = player.y;
    
    // 根据按键移动玩家
    const newX = player.x + (keys['ArrowRight'] ? 0.2 : 0) - (keys['ArrowLeft'] ? 0.2 : 0);
    const newY = player.y + (keys['ArrowDown'] ? 0.2 : 0) - (keys['ArrowUp'] ? 0.2 : 0);
    
    // 检查新位置是否有效
    const newCellX = Math.floor(newX);
    const newCellY = Math.floor(newY);
    
    // 边界检查
    if (newX < 0 || newX >= maze[0].length || newY < 0 || newY >= maze.length) {
        return;
    }
    
    // 检查当前单元格和相邻单元格是否为墙壁
    if (maze[newCellY][newCellX] === 0) {
        // 检查对角线移动是否穿过墙壁
        if (newCellX !== Math.floor(player.x) && newCellY !== Math.floor(player.y)) {
            if (maze[Math.floor(player.y)][newCellX] === 1 || maze[newCellY][Math.floor(player.x)] === 1) {
                return;
            }
        }
        
        // 检查移动方向上的所有中间单元格
        const dx = newX - player.x;
        const dy = newY - player.y;
        const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 10;
        
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const checkX = player.x + dx * t;
            const checkY = player.y + dy * t;
            const cellX = Math.floor(checkX);
            const cellY = Math.floor(checkY);
            
            if (maze[cellY][cellX] === 1) {
                return;
            }
        }
        
        player.x = newX;
        player.y = newY;
    }
    
    // 检查是否到达出口
    if (player.x === exit.x && player.y === exit.y) {
        gameOver = true;
        statusText.textContent = '恭喜通关！';
    }
}

// 渲染游戏
function render() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制迷宫
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            ctx.fillStyle = maze[y][x] === 1 ? wallColor : pathColor;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
    
    // 绘制出口
    ctx.fillStyle = exitColor;
    ctx.fillRect(exit.x * cellSize, exit.y * cellSize, cellSize, cellSize);
    
    // 绘制玩家
    ctx.fillStyle = playerColor;
    ctx.fillRect(
        player.x * cellSize + (cellSize - playerSize) / 2,
        player.y * cellSize + (cellSize - playerSize) / 2,
        playerSize,
        playerSize
    );
}

// 开始游戏
resetGame();
gameLoop();