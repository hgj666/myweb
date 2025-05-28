// 游戏状态
let grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];
let score = 0;
let gameOver = false;

// 初始化游戏
function initGame() {
    grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    score = 0;
    gameOver = false;
    document.getElementById('score').textContent = score;
    
    // 添加两个初始数字
    addRandomTile();
    addRandomTile();
    
    updateView();
}

// 添加随机数字
function addRandomTile() {
    const emptyCells = [];
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({row: i, col: j});
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
}

// 更新视图
function updateView() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            const value = grid[i][j];
            
            cell.textContent = value === 0 ? '' : value;
            cell.className = 'grid-cell';
            
            if (value > 0) {
                cell.classList.add(`tile-${value}`);
            }
        }
    }
    
    document.getElementById('score').textContent = score;
}

// 移动逻辑
function moveLeft() {
    let moved = false;
    
    for (let i = 0; i < 4; i++) {
        // 移除空格
        const row = grid[i].filter(val => val !== 0);
        
        // 合并相同数字
        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                row[j] *= 2;
                score += row[j];
                row.splice(j + 1, 1);
                moved = true;
                j--; // 防止连续合并
            }
        }
        
        // 补全空格
        while (row.length < 4) {
            row.push(0);
        }
        
        if (JSON.stringify(grid[i]) !== JSON.stringify(row)) {
            moved = true;
        }
        
        grid[i] = row;
    }
    
    return moved;
}

// 其他方向移动（右、上、下）
function rotateGrid() {
    const newGrid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            newGrid[i][j] = grid[j][3 - i];
        }
    }
    
    grid = newGrid;
}

function move(direction) {
    if (gameOver) return;
    
    let moved = false;
    
    // 通过旋转网格来复用moveLeft逻辑
    if (direction === 'right') {
        rotateGrid();
        rotateGrid();
        moved = moveLeft();
        rotateGrid();
        rotateGrid();
    } else if (direction === 'up') {
        rotateGrid();
        moved = moveLeft();
        rotateGrid();
        rotateGrid();
        rotateGrid();
    } else if (direction === 'down') {
        rotateGrid();
        rotateGrid();
        rotateGrid();
        moved = moveLeft();
        rotateGrid();
    } else { // left
        moved = moveLeft();
    }
    
    if (moved) {
        addRandomTile();
        updateView();
        
        if (isGameOver()) {
            gameOver = true;
            setTimeout(() => alert('游戏结束！'), 100);
        }
    }
}

// 检查游戏是否结束
function isGameOver() {
    // 检查是否有空格
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                return false;
            }
        }
    }
    
    // 检查是否有可合并的相邻数字
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (j < 3 && grid[i][j] === grid[i][j + 1]) {
                return false;
            }
            if (i < 3 && grid[i][j] === grid[i + 1][j]) {
                return false;
            }
        }
    }
    
    return true;
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            move('left');
            break;
        case 'ArrowRight':
            move('right');
            break;
        case 'ArrowUp':
            move('up');
            break;
        case 'ArrowDown':
            move('down');
            break;
    }
});

// 重新开始按钮
document.getElementById('restartBtn').addEventListener('click', initGame);

// 初始化游戏
initGame();