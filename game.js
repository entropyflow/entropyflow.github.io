const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = gridSize;
let dy = 0;
let score = 0;
let gameInterval;
let isGameRunning = false;

// 初始化游戏
function initGame() {
    snake = [
        { x: 5 * gridSize, y: 5 * gridSize }
    ];
    generateFood();
    score = 0;
    document.getElementById('score').textContent = score;
    dx = gridSize;
    dy = 0;
}

// 生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount) * gridSize,
        y: Math.floor(Math.random() * tileCount) * gridSize
    };
    
    // 确保食物不会生成在蛇身上
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) {
            generateFood();
            break;
        }
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    ctx.fillStyle = '#4CAF50';
    for (let part of snake) {
        ctx.fillRect(part.x, part.y, gridSize - 2, gridSize - 2);
    }
    
    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
}

// 移动蛇
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver();
        return;
    }
    
    // 检查是否撞到自己
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

// 游戏主循环
function gameLoop() {
    moveSnake();
    draw();
}

// 开始游戏
function startGame() {
    if (!isGameRunning) {
        initGame();
        isGameRunning = true;
        gameInterval = setInterval(gameLoop, 150);
    }
}

// 重置游戏
function resetGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    initGame();
    draw();
}

// 游戏结束
function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    alert('游戏结束！得分：' + score);
}

// 键盘控制
document.addEventListener('keydown', (event) => {
    if (!isGameRunning) return;
    
    switch (event.key) {
        case 'ArrowUp':
            if (dy === 0) {
                dx = 0;
                dy = -gridSize;
            }
            break;
        case 'ArrowDown':
            if (dy === 0) {
                dx = 0;
                dy = gridSize;
            }
            break;
        case 'ArrowLeft':
            if (dx === 0) {
                dx = -gridSize;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx === 0) {
                dx = gridSize;
                dy = 0;
            }
            break;
    }
});

// 初始化游戏画面
initGame();
draw(); 