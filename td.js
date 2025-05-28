// 塔防游戏主逻辑
const canvas = document.getElementById('tdCanvas');
const ctx = canvas.getContext('2d');

// 游戏状态
let gameState = {
    money: 100,
    health: 20,
    wave: 1,
    towers: [],
    enemies: [],
    projectiles: [],
    path: [],
    isRunning: false,
    lastSpawnTime: 0,
    spawnInterval: 2000,
    selectedTower: null
};

// 初始化游戏
function initGame() {
    // 生成敌人路径
    generatePath();
    
    // 初始化游戏状态
    gameState.isRunning = true;
    gameState.lastSpawnTime = Date.now();
    
    // 添加点击事件
    canvas.addEventListener('click', handleCanvasClick);
    
    // 开始游戏循环
    gameLoop();
}

// 处理画布点击
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 检查是否点击了塔
    gameState.selectedTower = null;
    gameState.towers.forEach(tower => {
        const dx = x - tower.x;
        const dy = y - tower.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 40) {
            gameState.selectedTower = tower;
            
            // 检查是否点击了升级按钮
            if (y < tower.y - 50 && y > tower.y - 80 && 
                x > tower.x - 50 && x < tower.x + 50) {
                upgradeTower(tower);
            }
        }
    });
}

// 生成敌人路径
function generatePath() {
    // 简单直线路径
    gameState.path = [
        {x: 0, y: 300},
        {x: 800, y: 300}
    ];
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
    // 生成敌人
    spawnEnemies();
    
    // 更新敌人
    updateEnemies();
    
    // 更新防御塔
    updateTowers();
    
    // 更新投射物
    updateProjectiles();
}

// 生成敌人
function spawnEnemies() {
    const now = Date.now();
    if (now - gameState.lastSpawnTime > gameState.spawnInterval) {
        gameState.enemies.push({
            x: gameState.path[0].x,
            y: gameState.path[0].y,
            width: 30,
            height: 30,
            speed: 1 + Math.random(),
            health: 30,
            pathIndex: 0
        });
        gameState.lastSpawnTime = now;
    }
}

// 更新敌人
function updateEnemies() {
    gameState.enemies.forEach((enemy, index) => {
        // 移动敌人
        const nextPoint = gameState.path[enemy.pathIndex + 1];
        if (nextPoint) {
            const dx = nextPoint.x - enemy.x;
            const dy = nextPoint.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                enemy.x += (dx / dist) * enemy.speed;
                enemy.y += (dy / dist) * enemy.speed;
                
                // 检查是否到达路径点
                if (dist < enemy.speed) {
                    enemy.pathIndex++;
                }
            }
        } else {
            // 敌人到达终点
            gameState.health--;
            gameState.enemies.splice(index, 1);
            
            if (gameState.health <= 0) {
                gameOver();
            }
        }
    });
}

// 防御塔升级
function upgradeTower(tower) {
    if (gameState.money >= tower.upgradeCost) {
        gameState.money -= tower.upgradeCost;
        tower.level++;
        tower.damage *= 1.5;
        tower.range *= 1.2;
        tower.attackSpeed *= 0.9;
        tower.upgradeCost = Math.floor(tower.upgradeCost * 1.8);
        return true;
    }
    return false;
}

// 创建防御塔
function createTower(x, y) {
    gameState.towers.push({
        x: x,
        y: y,
        damage: 10,
        range: 150,
        attackSpeed: 60,
        cooldown: 0,
        level: 1,
        upgradeCost: 50
    });
}

// 更新防御塔
function updateTowers() {
    gameState.towers.forEach(tower => {
        // 寻找目标
        if (tower.cooldown <= 0) {
            const target = findTarget(tower);
            if (target) {
                // 发射投射物
                gameState.projectiles.push({
                    x: tower.x,
                    y: tower.y,
                    targetX: target.x,
                    targetY: target.y,
                    damage: tower.damage,
                    speed: 5,
                    target: target
                });
                tower.cooldown = tower.attackSpeed;
            }
        } else {
            tower.cooldown--;
        }
    });
}

// 寻找目标
function findTarget(tower) {
    let closestEnemy = null;
    let minDist = Infinity;
    
    gameState.enemies.forEach(enemy => {
        const dx = enemy.x - tower.x;
        const dy = enemy.y - tower.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < tower.range && dist < minDist) {
            closestEnemy = enemy;
            minDist = dist;
        }
    });
    
    return closestEnemy;
}

// 更新投射物
function updateProjectiles() {
    gameState.projectiles.forEach((proj, index) => {
        // 移动投射物
        const dx = proj.targetX - proj.x;
        const dy = proj.targetY - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            proj.x += (dx / dist) * proj.speed;
            proj.y += (dy / dist) * proj.speed;
            
            // 检查是否命中
            if (dist < proj.speed) {
                if (proj.target) {
                    proj.target.health -= proj.damage;
                    if (proj.target.health <= 0) {
                        // 敌人死亡
                        const enemyIndex = gameState.enemies.indexOf(proj.target);
                        if (enemyIndex !== -1) {
                            gameState.enemies.splice(enemyIndex, 1);
                            gameState.money += 10;
                        }
                    }
                }
                gameState.projectiles.splice(index, 1);
            }
        }
    });
}

// 渲染升级UI
function renderUpgradeUI() {
    if (gameState.selectedTower) {
        const tower = gameState.selectedTower;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(tower.x - 50, tower.y - 80, 100, 50);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`等级: ${tower.level}`, tower.x - 40, tower.y - 60);
        ctx.fillText(`升级: ${tower.upgradeCost}金`, tower.x - 40, tower.y - 40);
    }
}

// 渲染游戏
function renderGame() {
    // 渲染路径
    renderPath();
    // 渲染升级UI
    renderUpgradeUI();
    
    // 渲染敌人
    renderEnemies();
    
    // 渲染防御塔
    renderTowers();
    
    // 渲染投射物
    renderProjectiles();
    
    // 更新UI
    updateUI();
}

// 渲染路径
function renderPath() {
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 10;
    ctx.beginPath();
    
    gameState.path.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    
    ctx.stroke();
}

// 渲染敌人
function renderEnemies() {
    gameState.enemies.forEach(enemy => {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x - enemy.width/2, enemy.y - enemy.height/2, enemy.width, enemy.height);
        
        // 绘制血条
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x - enemy.width/2, enemy.y - enemy.height/2 - 10, enemy.width, 5);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x - enemy.width/2, enemy.y - enemy.height/2 - 10, enemy.width * (enemy.health / 30), 5);
    });
}

// 渲染防御塔
function renderTowers() {
    gameState.towers.forEach(tower => {
        ctx.fillStyle = '#0000ff';
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制攻击范围
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// 渲染投射物
function renderProjectiles() {
    gameState.projectiles.forEach(proj => {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 更新UI
function updateUI() {
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('health').textContent = gameState.health;
    document.getElementById('wave').textContent = gameState.wave;
}

// 游戏结束
function gameOver() {
    gameState.isRunning = false;
    alert('游戏结束！');
}

// 放置防御塔
function placeTower(x, y) {
    if (gameState.money >= 50) {
        gameState.towers.push({
            x: x,
            y: y,
            range: 150,
            damage: 10,
            attackSpeed: 60,
            cooldown: 0
        });
        gameState.money -= 50;
    }
}

// 事件监听
document.getElementById('startBtn').addEventListener('click', initGame);

// 点击放置防御塔
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    placeTower(x, y);
});