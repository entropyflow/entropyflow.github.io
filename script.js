let startTime;
let timerInterval;
let isRunning = false;
let isHolding = false;
let holdStartTime;
let records = JSON.parse(localStorage.getItem('cubeRecords')) || [];

// DOM 元素
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('milliseconds');
const scrambleText = document.getElementById('scrambleText');
const recordList = document.getElementById('recordList');
const clearRecordsBtn = document.getElementById('clearRecords');
const exportRecordsBtn = document.getElementById('exportRecords');
const bestTimeDisplay = document.getElementById('bestTime');
const avg5Display = document.getElementById('avg5');
const avg12Display = document.getElementById('avg12');
const avg100Display = document.getElementById('avg100');
const currentAvg5Display = document.getElementById('currentAvg5');
const currentAvg12Display = document.getElementById('currentAvg12');
const timerDisplay = document.querySelector('.timer-display');
const timerStatus = document.querySelector('.timer-status');

// 魔方打乱公式生成
const moves = {
    U: ["U", "U'", "U2"],
    D: ["D", "D'", "D2"],
    L: ["L", "L'", "L2"],
    R: ["R", "R'", "R2"],
    F: ["F", "F'", "F2"],
    B: ["B", "B'", "B2"]
};

function generateScramble() {
    let scramble = [];
    let lastMove = '';
    let lastAxis = '';
    
    for (let i = 0; i < 20; i++) {
        let possibleMoves = [];
        for (let face in moves) {
            if (face !== lastMove && face !== getOppositeFace(lastMove)) {
                if (getAxis(face) !== lastAxis) {
                    possibleMoves = possibleMoves.concat(moves[face]);
                }
            }
        }
        
        let move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        scramble.push(move);
        lastMove = move[0];
        lastAxis = getAxis(lastMove);
    }
    
    return scramble.join(' ');
}

function getOppositeFace(face) {
    const opposites = {
        'U': 'D',
        'D': 'U',
        'L': 'R',
        'R': 'L',
        'F': 'B',
        'B': 'F'
    };
    return opposites[face] || '';
}

function getAxis(face) {
    const axes = {
        'U': 'UD',
        'D': 'UD',
        'L': 'LR',
        'R': 'LR',
        'F': 'FB',
        'B': 'FB'
    };
    return axes[face] || '';
}

// 更新显示时间
function updateDisplay() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    const milliseconds = Math.floor(elapsedTime % 1000);
    
    // 使用 requestAnimationFrame 来更新显示
    requestAnimationFrame(() => {
        minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        millisecondsDisplay.textContent = milliseconds.toString().padStart(3, '0');
    });
}

// 设置计时器状态
function setTimerState(state) {
    timerDisplay.className = 'timer-display';
    timerStatus.className = 'timer-status';
    
    switch(state) {
        case 'ready':
            timerDisplay.classList.add('ready');
            timerStatus.classList.add('ready');
            break;
        case 'running':
            timerDisplay.classList.add('running');
            timerStatus.classList.add('running');
            break;
        case 'idle':
            // 默认状态，不需要添加类
            break;
    }
}

// 开始计时
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now();
        // 使用 requestAnimationFrame 代替 setInterval
        function animate() {
            if (isRunning) {
                updateDisplay();
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
        setTimerState('running');
    }
}

// 停止计时
function stopTimer() {
    if (isRunning) {
        isRunning = false;
        setTimerState('idle');
        
        // 保存记录
        const time = `${minutesDisplay.textContent}:${secondsDisplay.textContent}.${millisecondsDisplay.textContent}`;
        const record = {
            time: time,
            date: new Date().toISOString(),
            scramble: scrambleText.textContent
        };
        records.unshift(record);
        if (records.length > 5) records.pop(); // 只保留最近5条记录
        localStorage.setItem('cubeRecords', JSON.stringify(records));
        
        updateRecordList();
        updateStats();
        generateNewScramble();
    }
}

// 重置计时器
function resetTimer() {
    isRunning = false;
    minutesDisplay.textContent = '00';
    secondsDisplay.textContent = '00';
    millisecondsDisplay.textContent = '000';
}

// 更新记录列表
function updateRecordList() {
    recordList.innerHTML = '';
    records.forEach((record, index) => {
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        
        const date = new Date(record.date);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
        
        recordItem.innerHTML = `
            <span class="record-number">${index + 1}</span>
            <span class="record-time">${record.time}</span>
            <span class="record-date">${dateStr}</span>
        `;
        
        recordList.appendChild(recordItem);
    });
}

// 更新统计信息
function updateStats() {
    if (records.length === 0) return;
    
    // 最快时间
    const bestTime = records.reduce((min, record) => {
        const time = parseTime(record.time);
        return time < min ? time : min;
    }, Infinity);
    bestTimeDisplay.textContent = formatTime(bestTime);
    
    // 计算平均值
    const times = records.map(record => parseTime(record.time));
    avg5Display.textContent = calculateAverage(times.slice(0, 5));
    avg12Display.textContent = calculateAverage(times.slice(0, 12));
    avg100Display.textContent = calculateAverage(times.slice(0, 100));
    
    // 计算当前平均值（不包括最新记录）
    const currentTimes = times.slice(1);
    currentAvg5Display.textContent = calculateAverage(currentTimes.slice(0, 5));
    currentAvg12Display.textContent = calculateAverage(currentTimes.slice(0, 12));
}

function parseTime(timeStr) {
    const [minutes, seconds, milliseconds] = timeStr.split(/[:.]/).map(Number);
    return minutes * 60000 + seconds * 1000 + milliseconds * 10;
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

function calculateAverage(times) {
    if (times.length === 0) return '-';
    
    // 移除最快和最慢的时间
    times.sort((a, b) => a - b);
    times = times.slice(1, -1);
    
    if (times.length === 0) return '-';
    
    const sum = times.reduce((a, b) => a + b, 0);
    const average = sum / times.length;
    return formatTime(average);
}

// 生成新的打乱公式
function generateNewScramble() {
    scrambleText.textContent = generateScramble();
}

// 清除记录
function clearRecords() {
    if (confirm('确定要清除所有记录吗？')) {
        records = [];
        localStorage.removeItem('cubeRecords');
        updateRecordList();
        updateStats();
    }
}

// 导出记录
function exportRecords() {
    const data = JSON.stringify(records, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cube-records-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 事件监听器
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isHolding) {
        isHolding = true;
        holdStartTime = Date.now();
        event.preventDefault();
        
        if (isRunning) {
            stopTimer();
        } else {
            setTimerState('ready');
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space' && isHolding) {
        isHolding = false;
        const holdDuration = Date.now() - holdStartTime;
        event.preventDefault();
        
        if (holdDuration >= 500) {
            startTimer();
        } else {
            setTimerState('idle');
        }
    }
});

clearRecordsBtn.addEventListener('click', clearRecords);
exportRecordsBtn.addEventListener('click', exportRecords);

// 初始化
generateNewScramble();
updateRecordList();
updateStats(); 