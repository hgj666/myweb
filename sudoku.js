// 数独游戏逻辑
class Sudoku {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.init();
    }

    init() {
        this.generateBoard();
        this.renderBoard();
        this.setupEventListeners();
    }

    generateBoard() {
        // 生成完整解
        this.generateSolution(0, 0);
        
        // 复制解作为初始板
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.solution[i][j] = this.board[i][j];
            }
        }
        
        // 根据难度挖空
        const difficulty = document.getElementById('difficulty').value;
        let cellsToRemove = 0;
        
        switch(difficulty) {
            case 'easy': cellsToRemove = 40; break;
            case 'medium': cellsToRemove = 50; break;
            case 'hard': cellsToRemove = 60; break;
            default: cellsToRemove = 40;
        }
        
        this.removeCells(cellsToRemove);
    }

    generateSolution(row, col) {
        if (row === 9) return true;
        if (col === 9) return this.generateSolution(row + 1, 0);
        if (this.board[row][col] !== 0) return this.generateSolution(row, col + 1);
        
        const nums = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (let num of nums) {
            if (this.isValidPlacement(row, col, num)) {
                this.board[row][col] = num;
                if (this.generateSolution(row, col + 1)) return true;
                this.board[row][col] = 0;
            }
        }
        
        return false;
    }

    removeCells(count) {
        let removed = 0;
        while (removed < count) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (this.board[row][col] !== 0) {
                this.board[row][col] = 0;
                removed++;
            }
        }
    }

    isValidPlacement(row, col, num) {
        // 检查行
        for (let i = 0; i < 9; i++) {
            if (this.board[row][i] === num) return false;
        }
        
        // 检查列
        for (let i = 0; i < 9; i++) {
            if (this.board[i][col] === num) return false;
        }
        
        // 检查3x3宫格
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[boxRow + i][boxCol + j] === num) return false;
            }
        }
        
        return true;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    renderBoard() {
        const boardElement = document.getElementById('sudokuBoard');
        boardElement.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (this.board[i][j] !== 0) {
                    cell.textContent = this.board[i][j];
                    cell.classList.add('fixed');
                }
                
                boardElement.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.board = Array(9).fill().map(() => Array(9).fill(0));
            this.solution = Array(9).fill().map(() => Array(9).fill(0));
            this.generateBoard();
            this.renderBoard();
        });
        
        document.getElementById('checkBtn').addEventListener('click', () => {
            this.checkSolution();
        });
        
        document.getElementById('solveBtn').addEventListener('click', () => {
            this.showSolution();
        });
        
        document.addEventListener('keydown', (e) => {
            if (this.selectedCell && !this.selectedCell.classList.contains('fixed')) {
                const row = parseInt(this.selectedCell.dataset.row);
                const col = parseInt(this.selectedCell.dataset.col);
                
                if (e.key >= '1' && e.key <= '9') {
                    this.board[row][col] = parseInt(e.key);
                    this.selectedCell.textContent = e.key;
                    
                    // 检查冲突
                    if (!this.isValidPlacement(row, col, parseInt(e.key))) {
                        this.selectedCell.style.color = 'red';
                    } else {
                        this.selectedCell.style.color = '';
                    }
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    this.board[row][col] = 0;
                    this.selectedCell.textContent = '';
                    this.selectedCell.style.color = '';
                }
            }
        });
        
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                if (this.selectedCell) {
                    this.selectedCell.classList.remove('selected');
                }
                
                this.selectedCell = cell;
                cell.classList.add('selected');
            });
        });
    }

    checkSolution() {
        let isValid = true;
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.querySelector(`.sudoku-cell[data-row="${i}"][data-col="${j}"]`);
                
                if (this.board[i][j] !== this.solution[i][j]) {
                    cell.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                    isValid = false;
                } else {
                    cell.style.backgroundColor = '';
                }
            }
        }
        
        if (isValid) {
            alert('恭喜！解答正确！');
        } else {
            alert('解答有误，请检查红色标记的格子。');
        }
    }

    showSolution() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.querySelector(`.sudoku-cell[data-row="${i}"][data-col="${j}"]`);
                cell.textContent = this.solution[i][j];
                cell.style.color = 'blue';
            }
        }
    }
}

// 初始化游戏
window.onload = function() {
    new Sudoku();
};