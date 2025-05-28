// RPG游戏主逻辑
const canvas = document.getElementById('rpgCanvas');
const ctx = canvas.getContext('2d');

// 游戏状态
let gameState = {
    player: {
        x: 400,
        y: 250,
        width: 32,
        height: 32,
        speed: 5,
        health: 100,
        attack: 10,
        defense: 5,
        exp: 0,
        level: 1,
        isAttacking: false,
        attackCooldown: 0,
        attackRange: 50
    },
    enemies: [],
    items: [],
    map: {
        width: 800,
        height: 600,
        tiles: [],
        tileSize: 32
    },
    isRunning: false,
    score: 0
};

// 初始化游戏
function initGame() {
    // 初始化地图
    generateMap();
    
    // 初始化敌人
    spawnEnemies(5);
    
    gameState.isRunning = true;
    gameLoop();
}

// 生成地图
function generateMap() {
    const { width, height, tileSize } = gameState.map;
    const cols = width / tileSize;
    const rows = height / tileSize;
    
    for (let y = 0; y < rows; y++) {
        gameState.map.tiles[y] = [];
        for (let x = 0; x < cols; x++) {
            // 随机生成地形：0-空地，1-墙壁，2-草地
            gameState.map.tiles[y][x] = Math.random() > 0.8 ? 1 : Math.random() > 0.7 ? 2 : 0;
        }
    }
}

// 生成敌人
function spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
        gameState.enemies.push({
            x: Math.random() * gameState.map.width,
            y: Math.random() * gameState.map.height,
            width: 32,
            height: 32,
            speed: 2 + Math.random() * 2,
            health: 30,
            attack: 5,
            type: Math.floor(Math.random() * 3) // 0-普通，1-精英，2-首领
        });
    }
}

// 游戏主循环
function gameLoop() {
    if (!gameState.isRunning) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 更新游戏状态
    updateGame();
    
    // 渲染游戏
    renderGame();
    
    // 继续循环
    requestAnimationFrame(gameLoop);
}

// 更新游戏状态
function updateGame() {
    // 边界检测
    const { player, map } = gameState;
    player.x = Math.max(0, Math.min(player.x, map.width - player.width));
    player.y = Math.max(0, Math.min(player.y, map.height - player.height));
    
    // 更新敌人AI
    updateEnemies();
    
    // 检测碰撞
    checkCollisions();
    
    // 更新攻击冷却
    if (gameState.player.attackCooldown > 0) {
        gameState.player.attackCooldown--;
    } else {
        gameState.player.isAttacking = false;
    }
}

// 更新敌人行为
function updateEnemies() {
    gameState.enemies.forEach(enemy => {
        // 简单追踪AI
        const dx = gameState.player.x - enemy.x;
        const dy = gameState.player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }
    });
}

// 碰撞检测
function checkCollisions() {
    // 玩家与敌人碰撞
    gameState.enemies.forEach((enemy, index) => {
        if (checkCollision(gameState.player, enemy)) {
            // 简单战斗逻辑
            const damage = Math.max(1, enemy.attack - gameState.player.defense / 2);
            gameState.player.health -= damage;
            
            if (gameState.player.health <= 0) {
                gameOver();
            }
        }
    });
}

function checkAttack() {
    gameState.enemies.forEach((enemy, index) => {
        const dx = gameState.player.x - enemy.x;
        const dy = gameState.player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < gameState.player.attackRange) {
            const damage = Math.max(1, gameState.player.attack - enemy.health / 10);
            enemy.health -= damage;
            if (enemy.health <= 0) {
                gameState.enemies.splice(index, 1);
                gameState.player.exp += 10;
                if (gameState.player.exp >= 100) {
                    gameState.player.level++;
                    gameState.player.exp = 0;
                    gameState.player.attack += 5;
                    gameState.player.defense += 2;
                }
            }
        }
    });
}

// 碰撞检测辅助函数
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// 游戏结束
function gameOver() {
    gameState.isRunning = false;
    alert('游戏结束！');
}

// 渲染游戏
function renderGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 渲染地图
    renderMap();
    
    // 渲染玩家
    renderPlayer();
    
    // 渲染敌人
    renderEnemies();
    
    // 渲染UI
    renderUI();
}

// 渲染地图
function renderMap() {
    const { tiles, tileSize } = gameState.map;
    
    for (let y = 0; y < tiles.length; y++) {
        for (let x = 0; x < tiles[y].length; x++) {
            switch(tiles[y][x]) {
                case 0: // 空地
                    ctx.fillStyle = '#f0f0f0';
                    break;
                case 1: // 墙壁
                    ctx.fillStyle = '#888888';
                    break;
                case 2: // 草地
                    ctx.fillStyle = '#88cc88';
                    break;
            }
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

// 渲染玩家
function renderPlayer() {
    const { player } = gameState;
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 绘制血条
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y - 10, player.width, 5);
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y - 10, player.width * (player.health / 100), 5);
}

// 渲染敌人
function renderEnemies() {
    gameState.enemies.forEach(enemy => {
        // 根据敌人类型设置颜色
        switch(enemy.type) {
            case 0: ctx.fillStyle = '#ff0000'; break; // 普通
            case 1: ctx.fillStyle = '#ff9900'; break; // 精英
            case 2: ctx.fillStyle = '#9900ff'; break; // 首领
        }
        
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // 绘制血条
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * (enemy.health / 30), 5);
    });
}

// 渲染UI
function renderUI() {
    const { player } = gameState;
    
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`生命值: ${player.health}`, 20, 20);
    ctx.fillText(`等级: ${player.level}`, 20, 40);
    ctx.fillText(`经验: ${player.exp}`, 20, 60);
    ctx.fillText(`攻击: ${player.attack}`, 20, 80);
    ctx.fillText(`防御: ${player.defense}`, 20, 100);
}

// 事件监听
document.getElementById('startBtn').addEventListener('click', initGame);

// 键盘控制
window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            gameState.player.y -= gameState.player.speed;
            break;
        case 'ArrowDown':
            gameState.player.y += gameState.player.speed;
            break;
        case 'ArrowLeft':
            gameState.player.x -= gameState.player.speed;
            break;
        case 'ArrowRight':
            gameState.player.x += gameState.player.speed;
            break;
        case ' ':
            if (gameState.player.attackCooldown <= 0) {
                gameState.player.isAttacking = true;
                gameState.player.attackCooldown = 30;
                checkAttack();
            }
            break;
    }
});