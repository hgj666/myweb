// 重构后的游戏核心类
class PuzzleGame {
  constructor(size) {
    this.size = size;
    this.tiles = [];
    this.emptyPos = {x: size-1, y: size-1};
    this.moves = 0;
    this.initBoard();
  }

  initBoard() {
    this.tiles = Array.from({length: this.size ** 2 - 1}, (_, i) => ({
      number: i + 1,
      x: i % this.size,
      y: Math.floor(i / this.size)
    }));
  }

  getAdjacentPositions() {
    return [
      {dx: 1, dy: 0}, {dx: -1, dy: 0},
      {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ].filter(({dx, dy}) => 
      this.emptyPos.x + dx >= 0 && this.emptyPos.x + dx < this.size &&
      this.emptyPos.y + dy >= 0 && this.emptyPos.y + dy < this.size
    );
  }

  shuffle(steps = 100) {
    let lastDirection = null;
    for(let i=0; i<steps; i++) {
      const directions = this.getAdjacentPositions()
        .filter(({dx, dy}) => !lastDirection || dx !== -lastDirection.dx || dy !== -lastDirection.dy);
      
      if(directions.length === 0) break;
      
      const randomDir = directions[Math.floor(Math.random()*directions.length)];
      const targetTile = this.tiles.find(t => 
        t.x === this.emptyPos.x + randomDir.dx &&
        t.y === this.emptyPos.y + randomDir.dy
      );
      
      [targetTile.x, targetTile.y, this.emptyPos.x, this.emptyPos.y] = 
        [this.emptyPos.x, this.emptyPos.y, targetTile.x - randomDir.dx, targetTile.y - randomDir.dy];
      
      lastDirection = randomDir;
    }
    
    if(!this.isSolvable()) {
      [this.tiles[0].x, this.tiles[1].x] = [this.tiles[1].x, this.tiles[0].x];
    }
  }

  isSolvable() {
    let inversions = 0;
    const flat = this.tiles.map(t => t.number);
    
    for(let i=0; i<flat.length; i++) {
      for(let j=i+1; j<flat.length; j++) {
        if(flat[i] > flat[j]) inversions++;
      }
    }
    
    return this.size % 2 === 1 ? inversions % 2 === 0 : 
      (inversions + (this.size - this.emptyPos.y)) % 2 === 1;
  }

  moveTile(tile) {
    const dx = tile.x - this.emptyPos.x;
    const dy = tile.y - this.emptyPos.y;
    
    if((Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0)) {
      [tile.x, tile.y, this.emptyPos.x, this.emptyPos.y] = 
        [this.emptyPos.x, this.emptyPos.y, tile.x, tile.y];
      this.moves++;
      return true;
    }
    return false;
  }

  isSolved() {
    return this.tiles.every((tile, i) => 
      tile.x === i % this.size &&
      tile.y === Math.floor(i / this.size)
    );
  }
}

const game = new PuzzleGame(3);

// 初始化拼图
function initPuzzle() {
  puzzleBoard.innerHTML = '';
  puzzleBoard.style.gridTemplateColumns = `repeat(${game.size}, 1fr)`;
  puzzleBoard.style.display = 'grid';
  puzzleBoard.style.position = 'relative';
  puzzleBoard.style.gap = '2px';
  puzzleBoard.style.width = `${game.size * 100 + (game.size - 1) * 2}px`;
  
  // 创建拼图块
  game.tiles.forEach((tile, index) => {
    const element = document.createElement('div');
    element.className = 'puzzle-tile';
    element.textContent = tile.number;
    element.dataset.index = index;
    element.style.width = '100px';
    element.style.height = '100px';
    element.style.display = 'flex';
    element.style.justifyContent = 'center';
    element.style.alignItems = 'center';
    element.style.backgroundColor = '#3498db';
    element.style.color = 'white';
    element.style.fontSize = '24px';
    element.style.borderRadius = '4px';
    element.style.gridRow = tile.y + 1;
    element.style.gridColumn = tile.x + 1;
    
    // 添加触摸事件支持
    element.addEventListener('touchstart', handleMove, {passive: true});
    element.addEventListener('click', handleMove);
    
    puzzleBoard.appendChild(element);
  });

  // 添加空白格
  const emptyElement = document.createElement('div');
  emptyElement.className = 'puzzle-tile empty';
  emptyElement.style.width = '100px';
  emptyElement.style.height = '100px';
  const emptyRow = game.emptyPos.y + 1;
  const emptyCol = game.emptyPos.x + 1;
  emptyElement.style.gridRow = emptyRow;
  emptyElement.style.gridColumn = emptyCol;
  puzzleBoard.appendChild(emptyElement);
  
  game.shuffle();
  renderTiles();
}

// 移动拼图块
function handleMove(event) {
  // 阻止默认行为防止触摸滚动
  event.preventDefault();
  
  const tile = event.target.closest('.puzzle-tile');
  if (!tile || tile.classList.contains('empty')) return;

  const position = parseInt(tile.dataset.index);
  const targetTile = game.tiles[position];
  
  if (game.moveTile(targetTile)) {
    document.getElementById('move-count').textContent = game.moves;
    renderTiles();
    
    if (game.isSolved()) {
      setTimeout(() => {
        const message = `恭喜完成拼图！\n移动步数: ${game.moves}`;
        alert(message);
      }, 300);
    }
  } else {
    // 添加无效移动反馈
    tile.classList.add('shake');
    setTimeout(() => tile.classList.remove('shake'), 400);
  }
}

// 更新renderTiles函数
function renderTiles() {
  // 确保puzzleBoard存在
  if (!puzzleBoard) {
    console.error('puzzleBoard元素不存在');
    return;
  }
  
  // 清除所有子元素
  puzzleBoard.innerHTML = '';
  
  // 重新创建所有拼图块
  game.tiles.forEach((tile, index) => {
    const element = document.createElement('div');
    element.className = 'puzzle-tile';
    element.textContent = tile.number;
    element.dataset.index = index;
    element.style.width = '100px';
    element.style.height = '100px';
    element.style.display = 'flex';
    element.style.justifyContent = 'center';
    element.style.alignItems = 'center';
    element.style.backgroundColor = '#3498db';
    element.style.color = 'white';
    element.style.fontSize = '24px';
    element.style.borderRadius = '4px';
    element.style.gridRow = tile.y + 1;
    element.style.gridColumn = tile.x + 1;
    
    // 高亮可移动的拼图块
    const dx = tile.x - game.emptyPos.x;
    const dy = tile.y - game.emptyPos.y;
    const isMovable = (Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0);
    element.style.opacity = isMovable ? '1' : '0.8';
    element.style.cursor = isMovable ? 'pointer' : 'default';
    element.style.transition = 'all 0.2s ease';
    
    element.addEventListener('touchstart', handleMove, {passive: true});
    element.addEventListener('click', handleMove);
    
    puzzleBoard.appendChild(element);
  });
  
  // 添加空白格
  const emptyElement = document.createElement('div');
  emptyElement.className = 'puzzle-tile empty';
  emptyElement.style.width = '100px';
  emptyElement.style.height = '100px';
  emptyElement.style.gridRow = game.emptyPos.y + 1;
  emptyElement.style.gridColumn = game.emptyPos.x + 1;
  puzzleBoard.appendChild(emptyElement);
}



// 检查是否相邻
function isAdjacent(pos1, pos2) {
  const row1 = Math.floor(pos1 / size);
  const col1 = pos1 % size;
  const row2 = Math.floor(pos2 / size);
  const col2 = pos2 % size;
  
  return (
    (Math.abs(row1 - row2) === 1 && col1 === col2) ||
    (Math.abs(col1 - col2) === 1 && row1 === row2)
  );
}

// 获取空白格位置
function getEmptyPosition() {
  return emptyPos;
}

// 洗牌


// 检查是否获胜
function checkWin() {
  for (let i = 0; i < tiles.length; i++) {
    if (parseInt(tiles[i].dataset.index) !== i) {
      return false;
    }
  }
  return true;
}

// 绑定洗牌按钮
shuffleBtn.addEventListener('click', shuffle);

// 初始化游戏
initPuzzle();