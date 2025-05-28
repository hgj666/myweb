// 推箱子游戏逻辑
const canvas = document.getElementById('sokobanCanvas');
const ctx = canvas.getContext('2d');

// 游戏状态
const gameState = {
    player: { x: 1, y: 1 },
    boxes: [],
    targets: [],
    walls: [],
    level: 0,
    levels: [
        // 第一关
        {
            player: { x: 1, y: 1 },
            boxes: [{ x: 2, y: 2 }],
            targets: [{ x: 3, y: 3 }],
            walls: [
                { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
                { x: 0, y: 1 }, { x: 4, y: 1 },
                { x: 0, y: 2 }, { x: 4, y: 2 },
                { x: 0, y: 3 }, { x: 4, y: 3 },
                { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }
            ]
        },
        // 第二关
        {
            player: { x: 2, y: 1 },
            boxes: [{ x: 2, y: 2 }, { x: 3, y: 2 }],
            targets: [{ x: 1, y: 3 }, { x: 4, y: 3 }],
            walls: [
                { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
                { x: 0, y: 1 }, { x: 5, y: 1 },
                { x: 0, y: 2 }, { x: 5, y: 2 },
                { x: 0, y: 3 }, { x: 5, y: 3 },
                { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }
            ]
        },
        // 第三关
        {
            player: { x: 1, y: 2 },
            boxes: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 3 }],
            targets: [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 1, y: 4 }],
            walls: [
                { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
                { x: 0, y: 1 }, { x: 5, y: 1 },
                { x: 0, y: 2 }, { x: 5, y: 2 },
                { x: 0, y: 3 }, { x: 5, y: 3 },
                { x: 0, y: 4 }, { x: 5, y: 4 },
                { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }
            ]
        },
        // 第四关
        {
            player: { x: 2, y: 1 },
            boxes: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 1, y: 3 }],
            targets: [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 1, y: 4 }, { x: 2, y: 4 }],
            walls: [
                { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
                { x: 0, y: 1 }, { x: 5, y: 1 },
                { x: 0, y: 2 }, { x: 5, y: 2 },
                { x: 0, y: 3 }, { x: 5, y: 3 },
                { x: 0, y: 4 }, { x: 5, y: 4 },
                { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }
            ]
        },
        // 第五关
        {
            player: { x: 3, y: 1 },
            boxes: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 1, y: 3 }, { x: 3, y: 3 }],
            targets: [{ x: 1, y: 1 }, { x: 5, y: 1 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }],
            walls: [
                { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
                { x: 0, y: 1 }, { x: 6, y: 1 },
                { x: 0, y: 2 }, { x: 6, y: 2 },
                { x: 0, y: 3 }, { x: 6, y: 3 },
                { x: 0, y: 4 }, { x: 6, y: 4 },
                { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }
            ]
        }
    ]
};

// 初始化游戏
function initGame() {
    const currentLevel = gameState.levels[gameState.level];
    gameState.player = { ...currentLevel.player };
    gameState.boxes = currentLevel.boxes.map(box => ({ ...box }));
    gameState.targets = currentLevel.targets.map(target => ({ ...target }));
    gameState.walls = currentLevel.walls.map(wall => ({ ...wall }));
    
    // 添加事件监听
    document.addEventListener('keydown', handleKeyPress);
    
    // 开始游戏循环
    gameLoop();
}

// 游戏主循环
function gameLoop() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制游戏元素
    drawGame();
    
    // 检查胜利条件
    if (checkWin()) {
        alert('恭喜过关！');
        nextLevel();
    }
    
    requestAnimationFrame(gameLoop);
}

// 绘制游戏元素
function drawGame() {
    // 绘制墙壁
    ctx.fillStyle = '#2c3e50';
    gameState.walls.forEach(wall => {
        ctx.fillRect(wall.x * 50, wall.y * 50, 50, 50);
    });
    
    // 绘制目标位置
    ctx.fillStyle = '#e74c3c';
    gameState.targets.forEach(target => {
        ctx.beginPath();
        ctx.arc(target.x * 50 + 25, target.y * 50 + 25, 15, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制箱子
    ctx.fillStyle = '#f39c12';
    gameState.boxes.forEach(box => {
        ctx.fillRect(box.x * 50 + 5, box.y * 50 + 5, 40, 40);
    });
    
    // 绘制玩家
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(gameState.player.x * 50 + 25, gameState.player.y * 50 + 25, 20, 0, Math.PI * 2);
    ctx.fill();
}

// 处理键盘输入
function handleKeyPress(e) {
    let dx = 0, dy = 0;
    
    switch (e.key) {
        case 'ArrowUp': dy = -1; break;
        case 'ArrowDown': dy = 1; break;
        case 'ArrowLeft': dx = -1; break;
        case 'ArrowRight': dx = 1; break;
        default: return;
    }
    
    movePlayer(dx, dy);
}

// 移动玩家
function movePlayer(dx, dy) {
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;
    
    // 检查是否撞墙
    if (isWall(newX, newY)) return;
    
    // 检查是否推动箱子
    const boxIndex = gameState.boxes.findIndex(box => box.x === newX && box.y === newY);
    if (boxIndex !== -1) {
        const newBoxX = newX + dx;
        const newBoxY = newY + dy;
        
        // 检查箱子是否可以移动
        if (isWall(newBoxX, newBoxY) || 
            gameState.boxes.some(box => box.x === newBoxX && box.y === newBoxY)) {
            return;
        }
        
        // 移动箱子
        gameState.boxes[boxIndex].x = newBoxX;
        gameState.boxes[boxIndex].y = newBoxY;
    }
    
    // 移动玩家
    gameState.player.x = newX;
    gameState.player.y = newY;
}

// 检查是否是墙壁
function isWall(x, y) {
    return gameState.walls.some(wall => wall.x === x && wall.y === y);
}

// 检查胜利条件
function checkWin() {
    return gameState.targets.every(target => 
        gameState.boxes.some(box => box.x === target.x && box.y === target.y)
    );
}

// 下一关
function nextLevel() {
    gameState.level = (gameState.level + 1) % gameState.levels.length;
    initGame();
}

// 重置游戏
function resetGame() {
    initGame();
}

// 初始化按钮事件
document.getElementById('startBtn').addEventListener('click', initGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// 开始游戏
initGame();