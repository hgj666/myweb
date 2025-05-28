// 游戏常量
const GRAVITY = 0.4;
const JUMP_FORCE = -14;
const AIR_RESISTANCE = 0.98;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 50;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 50;
const GAME_SPEED = 5;

class Player {
  constructor() {
    this.x = 100;
    this.y = 300;
    this.velocityY = 0;
    this.isJumping = false;
  }

  update() {
    // 应用重力
    this.velocityY += GRAVITY;
    this.velocityY *= AIR_RESISTANCE;
    this.y += this.velocityY;
    
    // 地面检测
    if (this.y > 300) {
      this.y = 300;
      this.velocityY = 0;
      this.isJumping = false;
    }
  }

  jump() {
    if (!this.isJumping) {
      this.velocityY = JUMP_FORCE;
      this.isJumping = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
  }
}

class Obstacle {
  constructor(x) {
    this.x = x;
    this.y = 300 - OBSTACLE_HEIGHT;
    this.width = OBSTACLE_WIDTH;
    this.height = OBSTACLE_HEIGHT;
  }

  update() {
    this.x -= GAME_SPEED;
  }

  draw(ctx) {
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const player = new Player();
const obstacles = [];
let score = 0;
let isGameRunning = false;
let canvas, ctx;
let lastObstacleTime = 0;

function init() {
  canvas = document.getElementById('parkourCanvas');
  ctx = canvas.getContext('2d');
  
  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('resetBtn').addEventListener('click', resetGame);
  
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      player.jump();
    }
  });
  
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (isGameRunning) {
    player.update();
    
    // 生成障碍物
    const currentTime = Date.now();
    if (currentTime - lastObstacleTime > 1500) {
      obstacles.push(new Obstacle(canvas.width));
      lastObstacleTime = currentTime;
    }
    
    // 更新和绘制障碍物
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update();
      obstacles[i].draw(ctx);
      
      // 移除屏幕外的障碍物
      if (obstacles[i].x < -obstacles[i].width) {
        obstacles.splice(i, 1);
        score++;
        continue; // 跳过碰撞检测
      }
      
      // 碰撞检测
      if (checkCollision(player, obstacles[i])) {
        gameOver();
        break;
      }
    }
    
    // 显示分数
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`分数: ${score}`, 20, 30);
  }
  
  player.draw(ctx);
  requestAnimationFrame(gameLoop);
}

function checkCollision(player, obstacle) {
  // 更精确的碰撞检测，考虑玩家和障碍物的中心点距离
  const playerCenterX = player.x + PLAYER_WIDTH/2;
  const playerCenterY = player.y + PLAYER_HEIGHT/2;
  const obstacleCenterX = obstacle.x + obstacle.width/2;
  const obstacleCenterY = obstacle.y + obstacle.height/2;
  
  // 计算中心点距离
  const distanceX = Math.abs(playerCenterX - obstacleCenterX);
  const distanceY = Math.abs(playerCenterY - obstacleCenterY);
  
  // 当距离小于两者半宽/半高之和时发生碰撞
  return player.x < obstacle.x + obstacle.width &&
       player.x + PLAYER_WIDTH > obstacle.x &&
       player.y < obstacle.y + obstacle.height &&
       player.y + PLAYER_HEIGHT > obstacle.y;
}

function startGame() {
  isGameRunning = true;
  score = 0;
  obstacles.length = 0;
}

function gameOver() {
  isGameRunning = false;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('游戏结束', canvas.width/2, canvas.height/2 - 30);
  ctx.fillText(`最终分数: ${score}`, canvas.width/2, canvas.height/2 + 30);
  ctx.textAlign = 'left';
}

function resetGame() {
  isGameRunning = false;
  player.y = 300;
  player.velocityY = 0;
  obstacles.length = 0;
  score = 0;
}

// 初始化游戏
init();