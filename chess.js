// 中国象棋游戏逻辑
const ROWS = 10;
const COLS = 9;
const CELL_SIZE = 50;

// 棋子类型
const PIECES = {
    'R': '车',
    'H': '马',
    'E': '相',
    'A': '士',
    'K': '将',
    'C': '炮',
    'P': '兵'
};

// 初始棋盘布局
const INIT_BOARD = [
    ['R', 'H', 'E', 'A', 'K', 'A', 'E', 'H', 'R'],
    ['', '', '', '', '', '', '', '', ''],
    ['', 'C', '', '', '', '', '', 'C', ''],
    ['P', '', 'P', '', 'P', '', 'P', '', 'P'],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['p', '', 'p', '', 'p', '', 'p', '', 'p'],
    ['', 'c', '', '', '', '', '', 'c', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['r', 'h', 'e', 'a', 'k', 'a', 'e', 'h', 'r']
];

let board = [];
let selectedPiece = null;
let gameHistory = [];

function updateBoard() {
    const boardElement = document.getElementById('chessBoard');
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = document.getElementById(`cell-${y}-${x}`);
            cell.innerHTML = '';
            
            if (board[y][x]) {
                const piece = document.createElement('div');
                piece.className = 'chess-piece';
                piece.textContent = PIECES[board[y][x].toUpperCase()];
                piece.style.color = board[y][x] === board[y][x].toUpperCase() ? 'red' : 'black';
                cell.appendChild(piece);
            }
        }
    }
}

function initBoard() {
    const boardElement = document.getElementById('chessBoard');
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, ${CELL_SIZE}px)`;
    boardElement.style.gridTemplateRows = `repeat(${ROWS}, ${CELL_SIZE}px)`;
    
    // 初始化棋盘数据
    board = JSON.parse(JSON.stringify(INIT_BOARD));
    
    // 创建棋盘格子
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = document.createElement('div');
            cell.className = 'chess-cell';
            cell.id = `cell-${y}-${x}`;
            
            // 设置棋子
            if (board[y][x]) {
                const piece = document.createElement('div');
                piece.className = 'chess-piece';
                piece.textContent = PIECES[board[y][x].toUpperCase()];
                piece.style.color = board[y][x] === board[y][x].toUpperCase() ? 'red' : 'black';
                cell.appendChild(piece);
            }
            
            // 添加点击事件
            cell.addEventListener('click', () => handleCellClick(y, x));
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(y, x) {
    if (!selectedPiece) {
        // 选择棋子
        if (board[y][x]) {
            selectedPiece = { y, x };
            document.getElementById(`cell-${y}-${x}`).style.backgroundColor = '#a5d6a7';
        }
    } else {
        // 移动棋子
        const { y: fromY, x: fromX } = selectedPiece;
        
        // 验证移动是否合法
        if (!isValidMove(fromY, fromX, y, x)) {
            alert('非法移动！');
            return;
        }
        
        // 保存当前状态到历史记录
        gameHistory.push({
            board: JSON.parse(JSON.stringify(board)),
            from: { y: fromY, x: fromX },
            to: { y, x }
        });
        
        // 移动棋子
        board[y][x] = board[fromY][fromX];
        board[fromY][fromX] = '';
        
        // 重置选择状态
        document.getElementById(`cell-${fromY}-${fromX}`).style.backgroundColor = '';
        selectedPiece = null;
        
        // 更新棋盘显示
        updateBoard();
    }
}

function isPathClear(fromY, fromX, toY, toX, count = 0) {
    let pieces = 0;
    if (fromY === toY) {
        const minX = Math.min(fromX, toX);
        const maxX = Math.max(fromX, toX);
        for (let x = minX + 1; x < maxX; x++) {
            if (board[fromY][x]) pieces++;
        }
    } else if (fromX === toX) {
        const minY = Math.min(fromY, toY);
        const maxY = Math.max(fromY, toY);
        for (let y = minY + 1; y < maxY; y++) {
            if (board[y][fromX]) pieces++;
        }
    }
    return pieces === count;
}

function isValidMove(fromY, fromX, toY, toX) {
    // 基本移动规则验证
    const piece = board[fromY][fromX];
    
    // 不能原地移动
    if (fromY === toY && fromX === toX) {
        return false;
    }
    
    // 不能吃自己的棋子
    if (board[toY][toX] && 
        (piece === piece.toUpperCase()) === (board[toY][toX] === board[toY][toX].toUpperCase())) {
        return false;
    }
    
    // 具体棋子移动规则
    switch(piece.toUpperCase()) {
        case 'R': // 车
            return (fromY === toY || fromX === toX) && isPathClear(fromY, fromX, toY, toX);
        case 'H': // 马
            const dx = Math.abs(fromX - toX);
            const dy = Math.abs(fromY - toY);
            if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;
            
            // 绊马腿检测
            const blockX = fromX + (toX - fromX)/2;
            const blockY = fromY + (toY - fromY)/2;
            return !board[dx === 2 ? fromY : blockY][dx === 1 ? fromX : blockX];
        case 'E': // 相
            return Math.abs(fromY - toY) === 2 && Math.abs(fromX - toX) === 2 && 
                   isPathClear(fromY, fromX, toY, toX);
        case 'A': // 士
            return Math.abs(fromY - toY) === 1 && Math.abs(fromX - toX) === 1 && 
                   ((piece === piece.toUpperCase() && toY >= 7) || 
                   (piece !== piece.toUpperCase() && toY <= 2));
        case 'K': // 将
            return ((Math.abs(fromY - toY) === 1 && fromX === toX) || 
                   (Math.abs(fromX - toX) === 1 && fromY === toY)) && 
                   ((piece === piece.toUpperCase() && toY <= 2 && toX >= 3 && toX <= 5) || 
                   (piece !== piece.toUpperCase() && toY >= 7 && toX >= 3 && toX <= 5));
        case 'C': // 炮
            if (board[toY][toX]) {
                return isPathClear(fromY, fromX, toY, toX, 1);
            } else {
                return isPathClear(fromY, fromX, toY, toX, 0);
            }
        case 'P': // 兵
            if (piece === piece.toUpperCase()) { // 红方
                return (fromY > toY && fromX === toX) || 
                       (fromY <= 4 && Math.abs(fromX - toX) === 1 && fromY === toY);
            } else { // 黑方
                return (fromY < toY && fromX === toX) || 
                       (fromY >= 5 && Math.abs(fromX - toX) === 1 && fromY === toY);
            }
        default:
            return false;
    }
}

function undoMove() {
    if (gameHistory.length > 0) {
        const lastMove = gameHistory.pop();
        board = lastMove.board;
        initBoard();
    }
}

// 初始化游戏
initBoard();

// 按钮事件
document.getElementById('startBtn').addEventListener('click', initBoard);
document.getElementById('undoBtn').addEventListener('click', undoMove);
document.getElementById('restartBtn').addEventListener('click', () => {
    gameHistory = [];
    initBoard();
});