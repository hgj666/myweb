// 物理引擎常量
// 物理引擎常量
const FPS = 60;
const GRAVITY = 1.2; // 调整重力效果更真实
const DOMINO_WIDTH = 12;
const DOMINO_HEIGHT = 50;
const SPACING = 28; // 优化间距计算
const ENERGY_TRANSFER = 0.95; // 提高能量传递效率
const FALL_THRESHOLD = 8; // 优化触发阈值
const ROTATION_DAMPING = 0.96; // 调整旋转阻尼系数
const MIN_IMPACT_ANGLE = 15; // 最小碰撞角度

class Domino {
  constructor(x, y, angle = 0) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.angularVelocity = 0;
    this.falling = false;
  }

  update() {
    if (this.falling) {
      // 改进物理计算：考虑角度和阻尼
      const angleRad = this.angle * Math.PI / 180;
      this.angularVelocity += GRAVITY * Math.sin(angleRad);
      this.angle += this.angularVelocity;
      this.angularVelocity *= ROTATION_DAMPING; // 应用旋转阻尼
      
      if (this.angle >= 90) {
        this.angle = 90;
        this.angularVelocity = 0;
        this.falling = false;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y + DOMINO_HEIGHT/2);
    ctx.rotate((this.angle * Math.PI) / 180);
    
    // 创建渐变效果
    const gradient = ctx.createLinearGradient(-DOMINO_WIDTH/2, -DOMINO_HEIGHT, DOMINO_WIDTH/2, 0);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#2E7D32');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(-DOMINO_WIDTH/2, -DOMINO_HEIGHT, DOMINO_WIDTH, DOMINO_HEIGHT);
    
    // 添加阴影效果
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.restore();
  }
}

const dominoes = [];
let isSimulating = false;
let canvas, ctx;

function init() {
  canvas = document.getElementById('dominoCanvas');
  ctx = canvas.getContext('2d');
  
  document.getElementById('addDomino').addEventListener('click', addRandomDomino);
  document.getElementById('startSim').addEventListener('click', startSimulation);
  document.getElementById('resetBtn').addEventListener('click', reset);
  
  canvas.addEventListener('mousedown', handleCanvasClick);
  
  // 初始骨牌排列
  for (let i = 0; i < 10; i++) {
    dominoes.push(new Domino(200 + i * SPACING, 400));
  }
  
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (isSimulating) {
    dominoes.forEach(domino => domino.update());
    checkCollisions();
  }
  
  dominoes.forEach(domino => domino.draw(ctx));
  requestAnimationFrame(gameLoop);
}

function checkCollisions() {
  for (let i = 0; i < dominoes.length - 1; i++) {
    const current = dominoes[i];
    const next = dominoes[i + 1];
    
    // 精确碰撞检测
const currentTop = {
  x: current.x + DOMINO_HEIGHT/2 * Math.sin(current.angle * Math.PI / 180),
  y: current.y - DOMINO_HEIGHT/2 * Math.cos(current.angle * Math.PI / 180)
};

const nextBase = {
  x: next.x - DOMINO_HEIGHT/2 * Math.sin(next.angle * Math.PI / 180),
  y: next.y + DOMINO_HEIGHT/2 * Math.cos(next.angle * Math.PI / 180)
};

// 改进碰撞检测：考虑相对速度和接触点
const distance = Math.hypot(currentTop.x - nextBase.x, currentTop.y - nextBase.y);
const relativeSpeed = Math.abs(current.angularVelocity) * DOMINO_HEIGHT/2;

if (current.falling && !next.falling &&
    distance < SPACING * 0.95 && 
    Math.abs(current.angle) > MIN_IMPACT_ANGLE &&
    relativeSpeed > 0.25) {
  
  next.falling = true;
  // 改进能量传递：考虑距离、角度和位置
  const impactFactor = 1 - (distance / SPACING);
  const positionFromEnd = dominoes.length - 1 - i;
  const energyBoost = positionFromEnd < 10 ? 1.5 + (0.1 * (9 - positionFromEnd)) : 1;
  const angleFactor = Math.pow(Math.cos(current.angle * Math.PI / 180), 0.7);
  
  next.angularVelocity = current.angularVelocity * ENERGY_TRANSFER * 
    angleFactor * impactFactor * energyBoost;
    
  // 添加连锁反应增强效果
  if (positionFromEnd < 10) {
    next.angularVelocity *= 1.1 + (0.03 * (9 - positionFromEnd));
  }
}
  }
}

function addRandomDomino() {
  const x = Math.random() * (canvas.width - 100) + 50;
  const y = Math.random() * (canvas.height - 100) + 50;
  dominoes.push(new Domino(x, y));
}

function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  dominoes.push(new Domino(x, y));
}

function startSimulation() {
  if (dominoes.length > 0) {
    dominoes[0].angle = 5; // 设置初始倾斜角度
    dominoes[0].falling = true;
    isSimulating = true;
    requestAnimationFrame(gameLoop); // 确保动画循环被触发
  }
}

function reset() {
  dominoes.length = 0;
  isSimulating = false;
  
  // 重置初始骨牌排列
  for (let i = 0; i < 10; i++) {
    dominoes.push(new Domino(200 + i * SPACING, 400));
  }
}

// 初始化游戏
init();