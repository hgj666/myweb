// 游戏状态
const BLOCK_SIZE = 100;
const BOARD_WIDTH = 4;
const BOARD_HEIGHT = 5;

// 方块类型
const BLOCK_TYPES = {
    SMALL: 1,
    HORIZONTAL: 2,
    VERTICAL: 3,
    BIG: 4
};

// 初始布局
let blocks = [];
let selectedBlock = null;
let gameWon = false;
let canvas, ctx;

// 初始化游戏
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 创建方块
    blocks = [
        // 曹操 (2x2)
        { id: 0, x: 1, y: 0, width: 2, height: 2, type: BLOCK_TYPES.BIG },
        // 关羽 (2x1)
        { id: 1, x: 1, y: 2, width: 2, height: 1, type: BLOCK_TYPES.HORIZONTAL },
        // 张飞 (1x2)
        { id: 2, x: 0, y: 0, width: 1, height: 2, type: BLOCK_TYPES.VERTICAL },
        // 赵云 (1x2)
        { id: 3, x: 3, y: 0, width: 1, height: 2, type: BLOCK_TYPES.VERTICAL },
        // 马超 (1x2)
        { id: 4, x: 0, y: 2, width: 1, height: 2, type: BLOCK_TYPES.VERTICAL },
        // 黄忠 (1x2)
        { id: 5, x: 3, y: 2, width: 1, height: 2, type: BLOCK_TYPES.VERTICAL },
        // 小兵 (1x1)
        { id: 6, x: 0, y: 4, width: 1, height: 1, type: BLOCK_TYPES.SMALL },
        { id: 7, x: 1, y: 3, width: 1, height: 1, type: BLOCK_TYPES.SMALL },
        { id: 8, x: 2, y: 3, width: 1, height: 1, type: BLOCK_TYPES.SMALL },
        { id: 9, x: 3, y: 4, width: 1, height: 1, type: BLOCK_TYPES.SMALL }
    ];
    
    gameWon = false;
    
    // 添加事件监听
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    
    // 重新开始按钮
    document.getElementById('restartBtn').addEventListener('click', initGame);
    
    // 开始游戏
    render();
}

// 渲染游戏
function render() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制方块
    blocks.forEach(block => {
        const x = block.x * BLOCK_SIZE;
        const y = block.y * BLOCK_SIZE;
        const width = block.width * BLOCK_SIZE;
        const height = block.height * BLOCK_SIZE;
        
        // 设置方块颜色
        let color;
        switch(block.type) {
            case BLOCK_TYPES.BIG:
                color = '#FF0000';
                break;
            case BLOCK_TYPES.HORIZONTAL:
                color = '#00FF00';
                break;
            case BLOCK_TYPES.VERTICAL:
                color = '#0000FF';
                break;
            default:
                color = '#FFFF00';
        }
        
        // 绘制方块
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // 添加角色名称
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let name = '';
        if (block.id === 0) name = '曹操';
        else if (block.id === 1) name = '关羽';
        else if (block.id === 2) name = '张飞';
        else if (block.id === 3) name = '赵云';
        else if (block.id === 4) name = '马超';
        else if (block.id === 5) name = '黄忠';
        else if (block.id >= 6) name = '士兵';
        
        ctx.fillText(name, x + width/2, y + height/2);
        
        // 如果是选中的方块，添加高亮效果
        if (selectedBlock && selectedBlock.id === block.id) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(name, x + width/2, y + height/2);
        }
    });
    
    // 检查胜利条件
    checkWinCondition();
}

// 鼠标按下事件
function onMouseDown(e) {
    if (gameWon) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 检查点击了哪个方块
    blocks.forEach(block => {
        const x = block.x * BLOCK_SIZE;
        const y = block.y * BLOCK_SIZE;
        const width = block.width * BLOCK_SIZE;
        const height = block.height * BLOCK_SIZE;
        
        if (mouseX >= x && mouseX <= x + width && 
            mouseY >= y && mouseY <= y + height) {
            selectedBlock = block;
        }
    });
}

// 鼠标移动事件
function onMouseMove(e) {
    if (!selectedBlock || gameWon) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 计算移动方向
    const blockCenterX = selectedBlock.x * BLOCK_SIZE + selectedBlock.width * BLOCK_SIZE / 2;
    const blockCenterY = selectedBlock.y * BLOCK_SIZE + selectedBlock.height * BLOCK_SIZE / 2;
    
    const dx = mouseX - blockCenterX;
    const dy = mouseY - blockCenterY;
    
    // 判断主要移动方向
    if (Math.abs(dx) > Math.abs(dy)) {
        // 水平移动
        if (dx > 0) {
            moveBlock(selectedBlock, 1, 0);
        } else {
            moveBlock(selectedBlock, -1, 0);
        }
    } else {
        // 垂直移动
        if (dy > 0) {
            moveBlock(selectedBlock, 0, 1);
        } else {
            moveBlock(selectedBlock, 0, -1);
        }
    }
    
    render();
}

// 鼠标释放事件
function onMouseUp() {
    selectedBlock = null;
}

// 移动方块
function moveBlock(block, dx, dy) {
    // 检查边界
    if (block.x + dx < 0 || 
        block.x + block.width + dx > BOARD_WIDTH ||
        block.y + dy < 0 || 
        block.y + block.height + dy > BOARD_HEIGHT) {
        return false;
    }
    
    // 检查碰撞
    for (let otherBlock of blocks) {
        if (otherBlock.id === block.id) continue;
        
        if (block.x + block.width + dx > otherBlock.x &&
            block.x + dx < otherBlock.x + otherBlock.width &&
            block.y + block.height + dy > otherBlock.y &&
            block.y + dy < otherBlock.y + otherBlock.height) {
            return false;
        }
    }
    
    // 移动方块
    block.x += dx;
    block.y += dy;
    return true;
}

// 检查胜利条件
function checkWinCondition() {
    // 检查曹操是否到达出口 (底部中间)
    const caoBlock = blocks.find(block => block.type === BLOCK_TYPES.BIG);
    if (caoBlock && caoBlock.x === 1 && caoBlock.y === 3) {
        gameWon = true;
        setTimeout(() => alert('恭喜你赢了！'), 100);
    }
}

// 初始化游戏
initGame();