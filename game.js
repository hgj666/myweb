// 游戏常量
const GRID_SIZE = 20;
const TILE_COUNT = 20;
const GAME_SPEED = 1000;

// 游戏状态
let snake = [{x: 10, y: 10}];
let food = generateFood();
let direction = {x: 0, y: 0};
let lastRenderTime = 0;
let gameOver = false;

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = GRID_SIZE * TILE_COUNT;
canvas.height = GRID_SIZE * TILE_COUNT;

// 主游戏循环
function gameLoop(currentTime) {
    if (gameOver) {
        alert('游戏结束!');
        document.location.reload();
        return;
    }

    window.requestAnimationFrame(gameLoop);
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / (GAME_SPEED / 100)) return;
    
    lastRenderTime = currentTime;
    update();
    draw();
}

// 更新游戏状态
function update() {
    // 移动蛇
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    snake.unshift(head);
    
    // 检测是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        food = generateFood();
    } else {
        snake.pop();
    }
    
    // 检测碰撞
    if (
        head.x < 0 || head.x >= TILE_COUNT || 
        head.y < 0 || head.y >= TILE_COUNT ||
        snake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y)
    ) {
        gameOver = true;
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 创建渐变颜色
        const gradient = ctx.createLinearGradient(
            segment.x * GRID_SIZE, 
            segment.y * GRID_SIZE, 
            segment.x * GRID_SIZE + GRID_SIZE, 
            segment.y * GRID_SIZE + GRID_SIZE
        );
        gradient.addColorStop(0, '#50c878');
        gradient.addColorStop(1, '#228b22');
        
        // 设置渐变填充
        ctx.fillStyle = gradient;
        
        // 绘制圆角矩形
        const radius = 5;
        ctx.beginPath();
        ctx.roundRect(
            segment.x * GRID_SIZE, 
            segment.y * GRID_SIZE, 
            GRID_SIZE, 
            GRID_SIZE, 
            radius
        );
        ctx.fill();
        
        // 为蛇头添加特殊效果
        if (index === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(
                segment.x * GRID_SIZE + GRID_SIZE/2, 
                segment.y * GRID_SIZE + GRID_SIZE/2, 
                GRID_SIZE/4, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }
    });
    
    // 绘制食物
    const gradient = ctx.createRadialGradient(
        food.x * GRID_SIZE + GRID_SIZE/2,
        food.y * GRID_SIZE + GRID_SIZE/2,
        0,
        food.x * GRID_SIZE + GRID_SIZE/2,
        food.y * GRID_SIZE + GRID_SIZE/2,
        GRID_SIZE/2
    );
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(1, '#990000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE/2,
        food.y * GRID_SIZE + GRID_SIZE/2,
        GRID_SIZE/2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 添加发光效果
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
}

// 生成食物
function generateFood() {
    let newFood;
    while (!newFood || snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
    }
    return newFood;
}

// 键盘控制
window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = {x: 0, y: -1};
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = {x: -1, y: 0};
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = {x: 1, y: 0};
            break;
    }
});

// 开始游戏
window.requestAnimationFrame(gameLoop);