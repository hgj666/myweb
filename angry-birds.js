// 游戏常量
const BIRD_RADIUS = 20;
const PIG_RADIUS = 25;
const BLOCK_WIDTH = 50;
const BLOCK_HEIGHT = 20;
const SLING_X = 100;
const SLING_Y = 400;
const GRAVITY = 0.5;
const ELASTICITY = 0.7;

// 游戏状态
let bird = {x: SLING_X, y: SLING_Y, radius: BIRD_RADIUS, vx: 0, vy: 0, isLaunched: false};
let pigs = [];
let blocks = [];
let score = 0;
let gameOver = false;
let isDragging = false;
let mouseX = 0;
let mouseY = 0;

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');

// 初始化游戏
function initGame() {
    // 创建障碍物和猪
    createLevel();
    
    // 事件监听
    canvas.addEventListener('mousedown', handleMouseDown, false);
    canvas.addEventListener('mousemove', handleMouseMove, false);
    canvas.addEventListener('mouseup', handleMouseUp, false);
    restartBtn.addEventListener('click', restartGame);
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 创建关卡
function createLevel() {
    pigs = [];
    blocks = [];
    
    // 添加猪
    pigs.push({x: 600, y: 400, radius: PIG_RADIUS});
    pigs.push({x: 700, y: 400, radius: PIG_RADIUS});
    
    // 添加障碍物
    blocks.push({x: 500, y: 450, width: BLOCK_WIDTH, height: BLOCK_HEIGHT});
    blocks.push({x: 650, y: 450, width: BLOCK_WIDTH, height: BLOCK_HEIGHT});
    blocks.push({x: 750, y: 450, width: BLOCK_WIDTH, height: BLOCK_HEIGHT});
}

// 游戏主循环
function gameLoop() {
    if (gameOver) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 更新物理
    updatePhysics();
    
    // 绘制游戏
    drawGame();
    
    // 继续循环
    requestAnimationFrame(gameLoop);
}

// 更新物理状态
function updatePhysics() {
    // 应用重力
    if (bird.isLaunched) {
        bird.vy += GRAVITY;
        // 添加空气阻力效果
        bird.vx *= 0.99;
        bird.vy *= 0.99;
    }
    
    // 更新小鸟位置
    bird.x += bird.vx;
    bird.y += bird.vy;
    
    // 边界检测
    if (bird.y + bird.radius > canvas.height) {
        bird.y = canvas.height - bird.radius;
        bird.vy *= -ELASTICITY;
        // 地面摩擦力
        bird.vx *= 0.7;
    }
    
    // 碰撞检测
    checkCollisions();
}

// 绘制游戏
function drawGame() {
    // 绘制背景
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制地面
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // 绘制弹弓
    drawSlingshot();
    
    // 绘制小鸟
    drawBird();
    
    // 绘制猪
    drawPigs();
    
    // 绘制障碍物
    drawBlocks();
    
    // 绘制分数
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.fillText(`分数: ${score}`, 20, 30);
}

// 绘制弹弓
function drawSlingshot() {
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 5;
    
    // 弹弓支架
    ctx.beginPath();
    ctx.moveTo(SLING_X - 30, SLING_Y + 50);
    ctx.lineTo(SLING_X, SLING_Y);
    ctx.lineTo(SLING_X + 30, SLING_Y + 50);
    ctx.stroke();
    
    // 如果正在拖动，绘制橡皮筋和轨迹预测线
    if (isDragging) {
        ctx.beginPath();
        ctx.moveTo(SLING_X, SLING_Y);
        ctx.lineTo(bird.x, bird.y);
        ctx.stroke();
        
        // 绘制轨迹预测线
        drawTrajectory();
    }
}

// 绘制轨迹预测线
function drawTrajectory() {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    
    const steps = 30;
    const vx = (SLING_X - bird.x) * 0.2;
    const vy = (SLING_Y - bird.y) * 0.2;
    
    let x = bird.x;
    let y = bird.y;
    let currentVx = vx;
    let currentVy = vy;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    for (let i = 0; i < steps; i++) {
        currentVy += GRAVITY;
        currentVx *= 0.99;
        currentVy *= 0.99;
        
        x += currentVx;
        y += currentVy;
        
        // 地面检测
        if (y + BIRD_RADIUS > canvas.height) {
            y = canvas.height - BIRD_RADIUS;
            currentVy *= -ELASTICITY;
            currentVx *= 0.7;
        }
        
        ctx.lineTo(x, y);
    }
    
    ctx.stroke();
}

// 绘制小鸟
function drawBird() {
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(bird.x + 5, bird.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 瞳孔
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + 5, bird.y - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 嘴巴
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.radius, bird.y);
    ctx.lineTo(bird.x + bird.radius + 10, bird.y - 5);
    ctx.lineTo(bird.x + bird.radius + 10, bird.y + 5);
    ctx.closePath();
    ctx.fill();
}

// 绘制猪
function drawPigs() {
    pigs.forEach(pig => {
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(pig.x, pig.y, pig.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(pig.x - 5, pig.y - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pig.x + 5, pig.y - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // 瞳孔
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(pig.x - 5, pig.y - 5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pig.x + 5, pig.y - 5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 鼻子
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(pig.x, pig.y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 绘制障碍物
function drawBlocks() {
    blocks.forEach(block => {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(block.x, block.y, block.width, block.height);
    });
}

// 碰撞检测
function checkCollisions() {
    // 检测小鸟与猪的碰撞
    for (let i = pigs.length - 1; i >= 0; i--) {
        const pig = pigs[i];
        const dx = bird.x - pig.x;
        const dy = bird.y - pig.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < bird.radius + pig.radius) {
            pigs.splice(i, 1);
            score += 100;
            
            // 检查游戏是否结束
            if (pigs.length === 0) {
                gameOver = true;
                ctx.fillStyle = '#000';
                ctx.font = '48px Arial';
                ctx.fillText('胜利!', canvas.width/2 - 50, canvas.height/2);
            }
        }
    }
    
    // 检测小鸟与障碍物的碰撞
    blocks.forEach(block => {
        // 简化的矩形与圆形碰撞检测
        const testX = Math.max(block.x, Math.min(bird.x, block.x + block.width));
        const testY = Math.max(block.y, Math.min(bird.y, block.y + block.height));
        
        const distX = bird.x - testX;
        const distY = bird.y - testY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        if (distance < bird.radius) {
            // 简单的反弹效果
            if (testX === block.x || testX === block.x + block.width) {
                bird.vx *= -ELASTICITY;
            } else {
                bird.vy *= -ELASTICITY;
            }
        }
    });
}

// 鼠标按下事件
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // 检查是否点击了小鸟
    const dx = mouseX - bird.x;
    const dy = mouseY - bird.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < bird.radius && !isDragging) {
        isDragging = true;
    }
}

// 鼠标移动事件
function handleMouseMove(e) {
    if (!isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // 限制拖动范围
    const maxDrag = 150;
    const dx = mouseX - SLING_X;
    const dy = mouseY - SLING_Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > maxDrag) {
        const angle = Math.atan2(dy, dx);
        mouseX = SLING_X + Math.cos(angle) * maxDrag;
        mouseY = SLING_Y + Math.sin(angle) * maxDrag;
    }
}

// 鼠标释放事件
function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    
    // 更新小鸟位置到当前鼠标位置
    bird.x = mouseX;
    bird.y = mouseY;
    
    // 计算发射速度(从鼠标位置指向弹弓位置)
    bird.vx = (SLING_X - bird.x) * 0.2;
    bird.vy = (SLING_Y - bird.y) * 0.2;
    bird.isLaunched = true;
    
    console.log('发射参数:', {vx: bird.vx, vy: bird.vy});
}

// 重新开始游戏
function restartGame() {
    bird = {x: SLING_X, y: SLING_Y, radius: BIRD_RADIUS, vx: 0, vy: 0};
    score = 0;
    gameOver = false;
    createLevel();
}

// 开始游戏
initGame();