// 绘画游戏主逻辑
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');
const colorPicker = document.getElementById('color-picker');
const clearBtn = document.getElementById('clear-btn');

// 绘画状态
let isDrawing = false;
let currentColor = '#000000';
let lastX = 0;
let lastY = 0;

// 设置初始画布背景
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = currentColor;

// 颜色选择器事件
colorPicker.addEventListener('input', function(e) {
    currentColor = e.target.value;
    ctx.fillStyle = currentColor;
    ctx.strokeStyle = currentColor;
    statusText.textContent = `当前颜色: ${currentColor}`;
});

// 清除画布事件
clearBtn.addEventListener('click', function() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = currentColor;
    statusText.textContent = '画布已清除';
});

// 鼠标事件处理
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    isDrawing = false;
}