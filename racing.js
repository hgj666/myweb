// 游戏状态
let car = {
    x: 400,
    y: 500,
    width: 30,
    height: 50,
    speed: 0,
    maxSpeed: 5,
    acceleration: 0.1,
    rotation: 0
};

let obstacles = [];
const OBSTACLE_COUNT = 5;

let road = {
    width: 400,
    curves: [],
    segments: []
};

let score = 0;
let gameOver = false;
let canvas, ctx;

// 初始化游戏
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    car = {
        x: 400,
        y: 500,
        width: 30,
        height: 50,
        speed: 0,
        maxSpeed: 5,
        acceleration: 0.1,
        rotation: 0
    };
    
    score = 0;
    gameOver = false;
    document.getElementById('score').textContent = score;
    
    generateRoad();
    
    // 游戏循环
    requestAnimationFrame(gameLoop);
}

// 生成赛道
function generateRoad() {
    road.segments = [];
    obstacles = [];
    
    // 创建直线赛道
    for (let i = 0; i < 100; i++) {
        road.segments.push({
            x1: 300,
            y1: i * 100,
            x2: 500,
            y2: i * 100
        });
    }
    
    // 生成随机障碍物
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
        obstacles.push({
            x: 300 + Math.random() * 200,
            y: -1000 + Math.random() * 2000,
            width: 30 + Math.random() * 30,
            height: 30 + Math.random() * 30
        });
    }
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
    // 更新车辆位置
    car.y -= car.speed;
    
    // 边界检测
    if (car.x < 300 || car.x > 500) {
        gameOver = true;
        setTimeout(() => alert('游戏结束！'), 100);
    }
    
    // 障碍物碰撞检测
    obstacles.forEach(obstacle => {
        if (car.x < obstacle.x + obstacle.width &&
            car.x + car.width > obstacle.x &&
            car.y < obstacle.y + obstacle.height &&
            car.y + car.height > obstacle.y) {
            gameOver = true;
            setTimeout(() => alert('撞到障碍物！游戏结束！'), 100);
        }
    });
    
    // 计分
    score += Math.floor(car.speed);
    document.getElementById('score').textContent = score;
}

// 渲染游戏
function render() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制赛道
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 10;
    
    road.segments.forEach(segment => {
        ctx.beginPath();
        ctx.moveTo(segment.x1, segment.y1 - car.y + 500);
        ctx.lineTo(segment.x2, segment.y2 - car.y + 500);
        ctx.stroke();
    });
    
    // 绘制障碍物
    obstacles.forEach(obstacle => {
        // 创建障碍物渐变
        const obstacleGradient = ctx.createLinearGradient(
            obstacle.x, 
            obstacle.y - car.y + 500,
            obstacle.x + obstacle.width, 
            obstacle.y - car.y + 500 + obstacle.height
        );
        obstacleGradient.addColorStop(0, '#FF8C00');
        obstacleGradient.addColorStop(1, '#FF4500');
        
        ctx.fillStyle = obstacleGradient;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.fillRect(
            obstacle.x,
            obstacle.y - car.y + 500,
            obstacle.width,
            obstacle.height
        );
        ctx.shadowBlur = 0;
    });
    
    // 绘制车辆
    ctx.save();
    ctx.translate(car.x, 500);
    ctx.rotate(car.rotation);
    
    // 创建赛车渐变
    const carGradient = ctx.createLinearGradient(
        -car.width/2, 
        -car.height/2,
        car.width/2, 
        car.height/2
    );
    carGradient.addColorStop(0, '#FF0000');
    carGradient.addColorStop(1, '#990000');
    
    ctx.fillStyle = carGradient;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 15;
    ctx.fillRect(-car.width/2, -car.height/2, car.width, car.height);
    ctx.shadowBlur = 0;
    
    ctx.restore();
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            car.rotation = -0.1;
            car.x -= 5;
            break;
        case 'ArrowRight':
            car.rotation = 0.1;
            car.x += 5;
            break;
        case 'ArrowUp':
            car.speed = Math.min(car.speed + car.acceleration, car.maxSpeed);
            break;
        case 'ArrowDown':
            car.speed = Math.max(car.speed - car.acceleration, 0);
            break;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        car.rotation = 0;
    }
});

// 重新开始按钮
document.getElementById('restartBtn').addEventListener('click', initGame);

// 初始化游戏
initGame();