// 液体物理模拟
const canvas = document.getElementById('liquidCanvas');
const ctx = canvas.getContext('2d');

// 设置画布大小
canvas.width = 800;
canvas.height = 600;

// 粒子类
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 5;
        this.vx = Math.random() * 2 - 1;
        this.vy = Math.random() * 2 - 1;
    }

    // 更新粒子位置
    update() {
        this.x += this.vx;
        this.y += this.vy;

        // 边界检测
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    // 绘制粒子
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
    }
}

// 粒子数组
let particles = [];

// 初始化粒子
function init() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }
}

// 动画循环
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制所有粒子
    for (let particle of particles) {
        particle.update();
        particle.draw();
    }

    requestAnimationFrame(animate);
}

// 添加点击事件添加粒子
document.getElementById('addLiquidBtn').addEventListener('click', () => {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }
});

// 清空按钮
document.getElementById('clearBtn').addEventListener('click', () => {
    particles = [];
});

// 启动模拟
init();
animate();