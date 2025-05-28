// 实时策略游戏核心类
class RTSGame {
  constructor() {
    this.units = [];
    this.resources = { gold: 500, wood: 500, food: 200 };
    this.selectedUnits = [];
    this.gameTime = 0;
    this.buildings = [];
    this.initGame();
  }

  initGame() {
    // 初始化游戏地图和单位
    this.createUnit('worker', 100, 100);
    this.createUnit('soldier', 200, 100);
  }

  createUnit(type, x, y) {
    const unit = { type, x, y, health: 100, attack: 10 };
    this.units.push(unit);
    return unit;
  }

  selectUnits(rect) {
    this.selectedUnits = this.units.filter(unit => 
      unit.x >= rect.x && unit.x <= rect.x + rect.width &&
      unit.y >= rect.y && unit.y <= rect.y + rect.height
    );
  }

  moveSelectedUnits(targetX, targetY) {
    this.selectedUnits.forEach(unit => {
      if(unit.type !== 'building') {
        unit.targetX = targetX;
        unit.targetY = targetY;
      }
    });
  }

  update(deltaTime) {
    this.gameTime += deltaTime;
    
    // 更新所有单位的位置
    this.units.forEach(unit => {
      if (unit.targetX && unit.targetY) {
        const dx = unit.targetX - unit.x;
        const dy = unit.targetY - unit.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance > 2) {
          const speed = unit.type === 'worker' ? 3 : 2;
          unit.x += (dx/distance) * speed;
          unit.y += (dy/distance) * speed;
        } else {
          unit.x = unit.targetX;
          unit.y = unit.targetY;
          delete unit.targetX;
          delete unit.targetY;
        }
      }
    });
    
    // 更新建筑资源生产
    this.buildings.forEach(building => {
      if(building.type === 'mine') {
        this.resources.gold += 0.1;
      }
      if(building.type === 'farm') {
        this.resources.food += 0.05;
      }
    });
  }

  // 建造建筑
  buildStructure(type, x, y) {
    const costs = {
      'barracks': {gold: 200, wood: 150},
      'farm': {gold: 100, wood: 50},
      'mine': {gold: 150, wood: 100},
      'townhall': {gold: 400, wood: 300}
    };
    
    if (!costs[type]) return false;
    
    // 检查资源是否足够
    if (this.resources.gold >= costs[type].gold && 
        this.resources.wood >= costs[type].wood) {
      // 扣除资源
      this.resources.gold -= costs[type].gold;
      this.resources.wood -= costs[type].wood;
      
      // 创建建筑
      const building = {type, x, y, health: 200, isBuilding: true};
      this.buildings.push(building);
      
      // 建筑特殊效果
      if(type === 'farm') this.resources.food += 50;
      if(type === 'mine') this.resources.gold += 10;
      
      return true;
    }
    return false;
  }

  // 改进移动功能
  moveSelectedUnits(targetX, targetY) {
    this.selectedUnits.forEach(unit => {
      unit.targetX = targetX;
      unit.targetY = targetY;
    });
  }
}

const game = new RTSGame();

// 初始化游戏
function initRTS() {
  const canvas = document.getElementById('rtsCanvas');
  const ctx = canvas.getContext('2d');
  
  // 游戏主循环
  function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制单位和建筑
    game.units.forEach(unit => {
      if(unit.isBuilding) {
        ctx.fillStyle = 'gray';
        ctx.fillRect(unit.x - 15, unit.y - 15, 30, 30);
      } else {
        ctx.fillStyle = unit.type === 'worker' ? 'blue' : 'red';
        ctx.fillRect(unit.x - 10, unit.y - 10, 20, 20);
      }
    });
    
    // 绘制选中单位标记
    game.selectedUnits.forEach(unit => {
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      const size = unit.isBuilding ? 34 : 24;
      ctx.strokeRect(unit.x - size/2, unit.y - size/2, size, size);
    });
    
    // 显示资源数量
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`金: ${Math.floor(game.resources.gold)}`, 20, 30);
    ctx.fillText(`木: ${Math.floor(game.resources.wood)}`, 20, 50);
    ctx.fillText(`食: ${Math.floor(game.resources.food)}`, 20, 70);
    
    requestAnimationFrame(gameLoop);
  }
  
  // 鼠标事件处理
  let isDragging = false;
  let startX, startY;
  
  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.offsetX;
    startY = e.offsetY;
  });
  
  canvas.addEventListener('mousemove', e => {
    if (isDragging) {
      const width = e.offsetX - startX;
      const height = e.offsetY - startY;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制单位
      game.units.forEach(unit => {
        ctx.fillStyle = unit.type === 'worker' ? 'blue' : 'red';
        ctx.fillRect(unit.x - 10, unit.y - 10, 20, 20);
      });
      
      // 绘制选择框
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, startY, width, height);
    }
  });
  
  canvas.addEventListener('mouseup', e => {
    if (isDragging) {
      isDragging = false;
      const width = e.offsetX - startX;
      const height = e.offsetY - startY;
      
      game.selectUnits({
        x: Math.min(startX, e.offsetX),
        y: Math.min(startY, e.offsetY),
        width: Math.abs(width),
        height: Math.abs(height)
      });
    } else {
      // 移动选中的单位
      game.moveSelectedUnits(e.offsetX, e.offsetY);
    }
  });
  
  // 开始游戏循环
  requestAnimationFrame(gameLoop);
}

// 绑定开始按钮
document.getElementById('startBtn').addEventListener('click', initRTS);