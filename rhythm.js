// 音乐节奏游戏主逻辑
class RhythmGame {
  constructor() {
    this.score = 0;
    this.combo = 0;
    this.audioContext = null;
    this.analyser = null;
    this.notes = [];
    this.isPlaying = false;
    
    this.initElements();
    this.bindEvents();
  }
  
  initElements() {
    this.scoreElement = document.getElementById('score');
    this.comboElement = document.getElementById('combo');
    this.startButton = document.getElementById('startBtn');
    this.trackElement = document.getElementById('track');
    this.hitAreaElement = document.getElementById('hitArea');
  }
  
  bindEvents() {
    this.startButton.addEventListener('click', () => this.startGame());
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }
  
  startGame() {
    if (this.isPlaying) return;
    
    this.score = 0;
    this.combo = 0;
    this.updateUI();
    this.isPlaying = true;
    
    // 初始化音频上下文
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    
    // 加载音乐文件
    this.loadAudio('music.mp3');
    
    // 生成节奏点
    this.generateNotes();
  }
  
  loadAudio(url) {
    fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        source.start(0);
        
        // 开始游戏循环
        this.gameLoop();
      })
      .catch(error => {
        console.error('音频加载失败:', error);
      });
  }
  
  generateNotes() {
    // 生成4个节奏点，间隔1秒
    for (let i = 1; i <= 4; i++) {
      this.notes.push({
        time: performance.now() + i * 1000,
        element: document.createElement('div')
      });
    }
  }
  
  gameLoop() {
    if (!this.isPlaying) return;
    
    // 更新节奏点位置
    const now = performance.now();
    this.notes.forEach(note => {
      const progress = (now - note.time + 1000) / 1000; // 1秒的动画时间
      if (progress >= 0 && progress <= 1) {
        note.element.style.transform = `translateY(${progress * 300}px)`;
      }
    });
    
    requestAnimationFrame(() => this.gameLoop());
  }
  
  handleKeyPress(e) {
    if (!this.isPlaying) return;
    
    // 检测是否按下了正确的键（空格键）
    if (e.code === 'Space') {
      // 检查是否有节奏点可以击中
      const now = performance.now();
      const hitWindow = 100; // 100毫秒的判定窗口
      
      for (let i = 0; i < this.notes.length; i++) {
        const note = this.notes[i];
        if (Math.abs(note.time - now) < hitWindow) {
          // 击中节奏点
          this.score += 100;
          this.combo += 1;
          this.notes.splice(i, 1); // 移除已击中的节奏点
          this.updateUI();
          return;
        }
      }
      
      // 未击中任何节奏点
      this.combo = 0;
      this.updateUI();
    }
  }
  
  updateUI() {
    this.scoreElement.textContent = this.score;
    this.comboElement.textContent = this.combo;
  }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
  new RhythmGame();
});