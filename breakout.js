// 游戏常量
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 10;
const BRICK_ROWS = 7;
const BRICK_COLUMNS = 10;
const BRICK_WIDTH = 70;
const BRICK_PADDING = 8;
const BRICK_HEIGHT = 30;
const BALL_SPEED = 5;

class Paddle {
  constructor() {
    this.x = 400;
    this.y = 450;
    this.dx = 0;
    this.speed = 10;
  }

  update(canvasWidth) {
    this.x += this.dx;
    this.x = Math.max(0, Math.min(canvasWidth - PADDLE_WIDTH, this.x));
  }

  draw(ctx) {
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + PADDLE_HEIGHT);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, PADDLE_WIDTH, PADDLE_HEIGHT, 8);
    ctx.fill();
  }
}

class Ball {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 400;
    this.y = 430;
    this.dx = BALL_SPEED;
    this.dy = -BALL_SPEED;
  }

  update(canvasWidth, canvasHeight) {
    this.x += this.dx;
    this.y += this.dy;

    // 边界碰撞
    if (this.x < BALL_RADIUS || this.x > canvasWidth - BALL_RADIUS) this.dx *= -1;
    if (this.y < BALL_RADIUS) this.dy *= -1;
  }

  draw(ctx) {
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, BALL_RADIUS
    );
    gradient.addColorStop(0, '#e74c3c');
    gradient.addColorStop(1, '#c0392b');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Brick {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.status = true;
  }

  draw(ctx) {
    if (!this.status) return;
    
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x + BRICK_WIDTH, this.y);
    gradient.addColorStop(0, '#2ecc71');
    gradient.addColorStop(1, '#27ae60');
    
    // 在挡板绘制方法中添加发光特效
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#2980b9';
    
    // 在小球绘制方法中添加辉光效果
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(231, 76, 60, 0.8)';
    
    // 在砖块绘制方法中添加立体阴影
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, BRICK_WIDTH, BRICK_HEIGHT, 4);
    ctx.fill();
  }
}

const paddle = new Paddle();
const ball = new Ball();
const bricks = [];
let isGameRunning = false;
let score = 0;
let canvas, ctx;

function init() {
  canvas = document.getElementById('breakoutCanvas');
  ctx = canvas.getContext('2d');

  // 初始化砖块
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLUMNS; c++) {
      const x = c * (BRICK_WIDTH + BRICK_PADDING) + 30;
      const y = r * (BRICK_HEIGHT + BRICK_PADDING) + 50;
      bricks.push(new Brick(x, y));
    }
  }

  document.getElementById('startBtn').addEventListener('click', () => {
    isGameRunning = true;
    ball.reset();
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    isGameRunning = false;
    bricks.forEach(brick => brick.status = true);
    score = 0;
    paddle.x = 400;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') paddle.dx = -paddle.speed;
    if (e.key === 'ArrowRight') paddle.dx = paddle.speed;
  });

  document.addEventListener('keyup', () => {
    paddle.dx = 0;
  });

  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isGameRunning) {
    paddle.update(canvas.width);
    ball.update(canvas.width, canvas.height);
    checkCollisions();
  }

  // 绘制游戏元素
  paddle.draw(ctx);
  ball.draw(ctx);
  bricks.forEach(brick => brick.draw(ctx));

  // 显示分数
  ctx.fillStyle = '#2c3e50';
  ctx.font = '20px Arial';
  ctx.fillText(`分数: ${score}`, 20, 30);

  // 游戏结束检测
  if (ball.y > canvas.height - BALL_RADIUS) {
    isGameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width/2, canvas.height/2);
    ctx.textAlign = 'left';
  }

  requestAnimationFrame(gameLoop);
}

function checkCollisions() {
  // 挡板碰撞
  if (ball.y + BALL_RADIUS > paddle.y && 
      ball.x > paddle.x && 
      ball.x < paddle.x + PADDLE_WIDTH) {
    const hitPos = (ball.x - paddle.x) / PADDLE_WIDTH;
    const angle = (hitPos - 0.5) * Math.PI/3;
    ball.dx = Math.sin(angle) * BALL_SPEED;
    ball.dy = -Math.cos(angle) * BALL_SPEED;
  }

  // 砖块碰撞
  bricks.forEach(brick => {
    if (brick.status && 
        ball.x + BALL_RADIUS > brick.x &&
        ball.x - BALL_RADIUS < brick.x + BRICK_WIDTH &&
        ball.y + BALL_RADIUS > brick.y &&
        ball.y - BALL_RADIUS < brick.y + BRICK_HEIGHT) {
      brick.status = false;
      score += 10;
      
      // 确定碰撞方向
      const overlapX = Math.min(
        ball.x + BALL_RADIUS - brick.x,
        brick.x + BRICK_WIDTH - (ball.x - BALL_RADIUS)
      );
      const overlapY = Math.min(
        ball.y + BALL_RADIUS - brick.y,
        brick.y + BRICK_HEIGHT - (ball.y - BALL_RADIUS)
      );

      if (overlapX < overlapY) {
        ball.dx *= -1;
      } else {
        ball.dy *= -1;
      }
    }
  });
}

// 初始化游戏
init();