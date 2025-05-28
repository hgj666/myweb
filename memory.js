// 记忆翻牌游戏主逻辑
const gameBoard = document.getElementById('gameBoard');
const timerElement = document.getElementById('time');
const scoreElement = document.getElementById('score');
const resetBtn = document.getElementById('resetBtn');

// 游戏状态
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let timer = 0;
let score = 0;
let timerInterval;
let isGameStarted = false;

// 卡片图案
const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

// 初始化游戏
function initGame() {
    // 创建卡片数组 (每对图案出现两次)
    const cardSymbols = [...symbols, ...symbols];
    
    // 洗牌（使用Fisher-Yates算法）
    for (let i = cardSymbols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardSymbols[i], cardSymbols[j]] = [cardSymbols[j], cardSymbols[i]];
    }
    
    // 清空游戏板
    gameBoard.innerHTML = '';
    
    // 创建卡片元素
    cardSymbols.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        card.addEventListener('click', flipCard);
        
        const backFace = document.createElement('div');
        backFace.className = 'back-face';
        
        const frontFace = document.createElement('div');
        frontFace.className = 'front-face';
        frontFace.textContent = symbol;
        
        card.appendChild(backFace);
        card.appendChild(frontFace);
        card.style.transform = 'rotateY(0deg)';
        
        gameBoard.appendChild(card);
    });
    
    // 重置游戏状态
    cards = document.querySelectorAll('.memory-card');
    flippedCards = [];
    matchedPairs = 0;
    timer = 0;
    score = 0;
    isGameStarted = false;
    
    updateScore();
    updateTimer();
}

// 翻牌
function flipCard() {
    if (!isGameStarted) {
        startTimer();
        isGameStarted = true;
    }
    
    // 如果已经翻了两张牌或者这张牌已经匹配或正在翻转，则不做任何操作
    if (flippedCards.length === 2 || this.classList.contains('flip') || this.classList.contains('flipping')) {
        return;
    }
    
    // 翻牌
    this.classList.add('flipping');
    this.style.pointerEvents = 'none';
    setTimeout(() => {
        this.classList.add('flip');
        this.classList.remove('flipping');
        flippedCards.push(this);
        
        if (flippedCards.length === 2) {
            checkForMatch();
        }
        this.style.pointerEvents = 'auto';
    }, 150);
    

}

// 检查匹配
function checkForMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.symbol === card2.dataset.symbol) {
        // 匹配成功
        card1.removeEventListener('click', flipCard);
        card2.removeEventListener('click', flipCard);
        
        matchedPairs++;
        score += 10;
        updateScore();
        
        // 检查游戏是否结束
        if (matchedPairs === symbols.length) {
            endGame();
        }
        
        // 匹配成功特效
        card1.classList.add('match-success', 'disabled');
        card2.classList.add('match-success', 'disabled');
        
        // 添加3D翻转动画
        setTimeout(() => {
            this.classList.add('flip','animate');
            this.classList.remove('flipping');
        }, 150);
        
        // 失败动画添加抖动效果
        card1.classList.add('shake');
        card2.classList.add('shake');
    } else {
        // 匹配失败
        setTimeout(() => {
            card1.classList.add('flipping');
            card2.classList.add('flipping');
            setTimeout(() => {
                card1.classList.remove('flip');
                card2.classList.remove('flip');
                card1.classList.remove('flipping');
                card2.classList.remove('flipping');
            }, 150);
        }, 1000);
    }
    
    flippedCards = [];
}

// 开始计时
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        updateTimer();
    }, 1000);
}

// 更新计时器显示
function updateTimer() {
    timerElement.textContent = timer;
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
}

// 结束游戏
function endGame() {
    clearInterval(timerInterval);
    alert(`游戏结束！用时: ${timer}秒，得分: ${score}`);
}

// 重置游戏
resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    initGame();
});

// 初始化游戏
initGame();