// 平衡球游戏主逻辑
const canvas = document.getElementById('balanceCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

// 游戏参数
const platformSize = 300;
const ballRadius = 20;
const gravity = 0.2;
const friction = 0.98;
const tiltSensitivity = 0.05;

// 游戏状态
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0
};

let platformAngle = {
    x: 0,
    y: 0
};

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
    gameLoop(); // 重新启动游戏循环
});

function resetGame() {
    ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: 0,
        vy: 0
    };
    platformAngle = { x: 0, y: 0 };
    gameOver = false;
    statusText.textContent = '使用方向键控制平台';
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
    // 根据按键更新平台倾斜角度
    if (keys['ArrowLeft']) platformAngle.x -= tiltSensitivity;
    if (keys['ArrowRight']) platformAngle.x += tiltSensitivity;
    if (keys['ArrowUp']) platformAngle.y -= tiltSensitivity;
    if (keys['ArrowDown']) platformAngle.y += tiltSensitivity;
    
    // 限制平台倾斜角度
    platformAngle.x = Math.max(-0.5, Math.min(0.5, platformAngle.x));
    platformAngle.y = Math.max(-0.5, Math.min(0.5, platformAngle.y));
    
    // 根据平台倾斜角度更新球的速度
    ball.vx += platformAngle.x;
    ball.vy += platformAngle.y;
    
    // 应用重力和摩擦力
    ball.vy += gravity;
    ball.vx *= friction;
    ball.vy *= friction;
    
    // 更新球的位置
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // 边界检查
    if (ball.x < ballRadius) {
        ball.x = ballRadius;
        ball.vx *= -0.5;
    }
    
    if (ball.x > canvas.width - ballRadius) {
        ball.x = canvas.width - ballRadius;
        ball.vx *= -0.5;
    }
    
    if (ball.y < ballRadius) {
        ball.y = ballRadius;
        ball.vy *= -0.5;
    }
    
    // 游戏结束条件
    if (ball.y > canvas.height + ballRadius * 2) {
        gameOver = true;
        statusText.textContent = '游戏结束！球掉落了';
    }
}

// 渲染游戏
function render() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制平台
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(platformAngle.x);
    ctx.rotate(platformAngle.y);
    
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(-platformSize / 2, -platformSize / 2, platformSize, platformSize);
    
    ctx.strokeStyle = '#689F38';
    ctx.lineWidth = 5;
    ctx.strokeRect(-platformSize / 2, -platformSize / 2, platformSize, platformSize);
    
    // 绘制网格线
    ctx.strokeStyle = '#689F38';
    ctx.lineWidth = 1;
    for (let i = -platformSize / 2; i <= platformSize / 2; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, -platformSize / 2);
        ctx.lineTo(i, platformSize / 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-platformSize / 2, i);
        ctx.lineTo(platformSize / 2, i);
        ctx.stroke();
    }
    
    ctx.restore();
    
    // 绘制球
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#E91E63';
    ctx.fill();
    ctx.strokeStyle = '#C2185B';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// 开始游戏
resetGame();
gameLoop();