// 太空射击游戏主逻辑
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 玩家飞船
const player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    color: '#3498db'
};

// 子弹数组
let bullets = [];
// 射击冷却时间
let canShoot = true;
const shootCooldown = 300; // 毫秒

// 敌人数组
let enemies = [];

// 分数
let score = 0;

// 键盘控制
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    ' ': false
};

// 监听键盘事件
document.addEventListener('keydown', (e) => {
    console.log('按键按下:', e.code); // 调试日志
    if (e.code in keys) {
        keys[e.code] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code in keys) {
        keys[e.code] = false;
    }
});

// 游戏主循环
function gameLoop() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 更新玩家位置
    updatePlayer();
    
    // 更新子弹
    updateBullets();
    
    // 更新敌人
    updateEnemies();
    
    // 检测碰撞
    checkCollisions();
    
    // 绘制游戏元素
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawScore();
    
    // 生成新敌人
    if (Math.random() < 0.02) {
        createEnemy();
    }
    
    requestAnimationFrame(gameLoop);
}

// 开始游戏
gameLoop();

// 其他游戏函数实现...
function updatePlayer() {
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys.ArrowUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
    if (keys[' '] && canShoot) {
        fireBullet();
        canShoot = false;
        setTimeout(() => {
            canShoot = true;
        }, shootCooldown);
    }
}

function fireBullet() {
    // 确保子弹从飞船中心发射
    const bullet = {
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 15,
        speed: 7,
        color: '#e74c3c'
    };
    bullets.push(bullet);
    console.log('子弹发射:', bullet); // 调试日志
}

function createEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: 2 + Math.random() * 2,
        color: '#f1c40f'
    });
}

// 其他游戏函数...
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
        }
    }
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], enemies[j])) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 10;
                break;
            }
        }
    }
}

function checkCollision(obj1, obj2) {
    // 更精确的碰撞检测，考虑中心点距离
    const obj1CenterX = obj1.x + obj1.width / 2;
    const obj1CenterY = obj1.y + obj1.height / 2;
    const obj2CenterX = obj2.x + obj2.width / 2;
    const obj2CenterY = obj2.y + obj2.height / 2;
    
    const distanceX = Math.abs(obj1CenterX - obj2CenterX);
    const distanceY = Math.abs(obj1CenterY - obj2CenterY);
    
    const minDistanceX = (obj1.width + obj2.width) / 2;
    const minDistanceY = (obj1.height + obj2.height) / 2;
    
    return distanceX < minDistanceX && distanceY < minDistanceY;
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
    ctx.fillStyle = '#e74c3c';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemies() {
    ctx.fillStyle = '#f1c40f';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`分数: ${score}`, 10, 30);
}