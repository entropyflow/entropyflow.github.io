class CubeTimer {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.times = [];
        this.spacePressed = false;
        this.readyToStart = false;
        this.timerTimeout = null;

        // DOM elements
        this.timerDisplay = document.getElementById('timer');
        this.scrambleDisplay = document.getElementById('scramble');
        this.timesList = document.getElementById('timesList');
        this.currentAvgDisplay = document.getElementById('currentAvg');
        this.bestTimeDisplay = document.getElementById('bestTime');
        this.ao5Display = document.getElementById('ao5');
        this.ao12Display = document.getElementById('ao12');

        this.setupEventListeners();
        this.generateNewScramble();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                if (!this.isRunning) {
                    this.spacePressed = true;
                    this.timerDisplay.style.color = '#27ae60';
                    this.timerTimeout = setTimeout(() => {
                        if (this.spacePressed) {
                            this.readyToStart = true;
                            this.timerDisplay.style.color = '#e74c3c';
                        }
                    }, 500);
                } else {
                    this.stopTimer();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                clearTimeout(this.timerTimeout);
                this.spacePressed = false;
                if (this.readyToStart) {
                    this.startTimer();
                    this.readyToStart = false;
                }
                this.timerDisplay.style.color = '#2c3e50';
            }
        });
    }

    startTimer() {
        this.isRunning = true;
        this.startTime = Date.now();
        this.updateTimer();
    }

    stopTimer() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        const endTime = Date.now();
        const time = (endTime - this.startTime) / 1000;
        this.times.unshift(time);
        this.updateTimesList();
        this.updateStats();
        this.generateNewScramble();
    }

    updateTimer() {
        if (!this.isRunning) return;
        
        const currentTime = (Date.now() - this.startTime) / 1000;
        this.timerDisplay.textContent = currentTime.toFixed(3);
        requestAnimationFrame(() => this.updateTimer());
    }

    generateNewScramble() {
        const moves = ["R", "L", "U", "D", "F", "B"];
        const modifiers = ["", "'", "2"];
        let scramble = [];
        let lastMove = '';

        for (let i = 0; i < 20; i++) {
            let move;
            do {
                move = moves[Math.floor(Math.random() * moves.length)];
            } while (move === lastMove);
            
            lastMove = move;
            const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
            scramble.push(move + modifier);
        }

        this.scrambleDisplay.textContent = scramble.join(' ');
    }

    updateTimesList() {
        this.timesList.innerHTML = this.times
            .map((time, index) => `<div>第${index + 1}次: ${time.toFixed(3)}秒</div>`)
            .join('');
    }

    calculateAverage(times) {
        if (times.length === 0) return null;
        const sum = times.reduce((a, b) => a + b, 0);
        return sum / times.length;
    }

    calculateAverageOf(n) {
        if (this.times.length < n) return null;
        const relevantTimes = this.times.slice(0, n);
        if (n <= 3) return this.calculateAverage(relevantTimes);

        // 去掉最好和最差成绩
        const sortedTimes = [...relevantTimes].sort((a, b) => a - b);
        const trimmedTimes = sortedTimes.slice(1, -1);
        return this.calculateAverage(trimmedTimes);
    }

    updateStats() {
        const currentAvg = this.calculateAverage(this.times);
        const bestTime = Math.min(...this.times);
        const ao5 = this.calculateAverageOf(5);
        const ao12 = this.calculateAverageOf(12);

        this.currentAvgDisplay.textContent = currentAvg ? currentAvg.toFixed(3) : '-';
        this.bestTimeDisplay.textContent = isFinite(bestTime) ? bestTime.toFixed(3) : '-';
        this.ao5Display.textContent = ao5 ? ao5.toFixed(3) : '-';
        this.ao12Display.textContent = ao12 ? ao12.toFixed(3) : '-';
    }
}

// 初始化计时器
const timer = new CubeTimer(); 