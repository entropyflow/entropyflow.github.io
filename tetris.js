// 游戏常量
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    '#D7CCC8', // 空白
    '#B17A65', // 和风棕
    '#8C7B75', // 深灰棕
    '#A69B97', // 浅灰棕
    '#D4A5A5', // 樱花粉
    '#9BA7B0', // 青磷灰
    '#A8B4A5', // 抹茶绿
    '#B4A582'  // 枯草色
];

// 方块形状
const SHAPES = [
    [],
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]], // J
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]], // L
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]], // S
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]], // T
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]]  // Z
];

// 游戏状态
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let score = 0;
let level = 1;
let gameLoop;
let currentPiece = null;
let nextPiece = null;
let isPaused = false;

// 获取画布上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

// 方块类
class Piece {
    constructor(shape = Math.floor(Math.random() * 7) + 1) {
        this.shape = shape;
        this.grid = SHAPES[shape];
        this.x = Math.floor((COLS - this.grid[0].length) / 2);
        this.y = 0;
        this.color = COLORS[shape];
    }

    draw(ctx, offsetX = 0, offsetY = 0) {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(
                        ctx,
                        this.x + x + offsetX,
                        this.y + y + offsetY,
                        this.color
                    );
                }
            });
        });
    }
}

// 绘制单个方块
function drawBlock(ctx, x, y, color) {
    const blockX = x * BLOCK_SIZE;
    const blockY = y * BLOCK_SIZE;
    
    // 主体
    ctx.fillStyle = color;
    ctx.fillRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
    
    // 亮边
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(blockX, blockY, BLOCK_SIZE, 2);
    ctx.fillRect(blockX, blockY, 2, BLOCK_SIZE);
    
    // 暗边
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(blockX + BLOCK_SIZE - 2, blockY, 2, BLOCK_SIZE);
    ctx.fillRect(blockX, blockY + BLOCK_SIZE - 2, BLOCK_SIZE, 2);
}

// 绘制游戏板
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(ctx, x, y, COLORS[value]);
            }
        });
    });
}

// 绘制下一个方块
function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (nextPiece) {
        const offsetX = 1;
        const offsetY = 1;
        nextPiece.draw(nextCtx, offsetX, offsetY);
    }
}

// 碰撞检测
function collision(piece, moveX = 0, moveY = 0) {
    return piece.grid.some((row, y) => {
        return row.some((value, x) => {
            if (!value) return false;
            const newX = piece.x + x + moveX;
            const newY = piece.y + y + moveY;
            return (
                newX < 0 ||
                newX >= COLS ||
                newY >= ROWS ||
                (newY >= 0 && board[newY][newX])
            );
        });
    });
}

// 合并方块到游戏板
function merge() {
    currentPiece.grid.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = currentPiece.y + y;
                if (boardY >= 0) {
                    board[boardY][currentPiece.x + x] = currentPiece.shape;
                }
            }
        });
    });
}

// 清除完整的行
function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(value => value)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared) {
        score += linesCleared * 100 * level;
        document.getElementById('score').textContent = score;
        if (score >= level * 1000) {
            level++;
            document.getElementById('level').textContent = level;
        }
    }
}

// 旋转方块
function rotate() {
    const grid = currentPiece.grid;
    const newGrid = grid[0].map((_, i) =>
        grid.map(row => row[i]).reverse()
    );
    const previousGrid = currentPiece.grid;
    currentPiece.grid = newGrid;
    if (collision(currentPiece)) {
        currentPiece.grid = previousGrid;
    }
}

// 游戏主循环
function update() {
    if (isPaused) return;
    
    if (collision(currentPiece, 0, 1)) {
        merge();
        clearLines();
        if (currentPiece.y <= 0) {
            // 游戏结束
            alert('游戏结束！得分：' + score);
            resetGame();
            return;
        }
        currentPiece = nextPiece;
        nextPiece = new Piece();
        drawNextPiece();
    } else {
        currentPiece.y++;
    }
    
    drawBoard();
    currentPiece.draw(ctx);
}

// 键盘控制
document.addEventListener('keydown', event => {
    if (isPaused && event.key !== 'p') return;
    
    switch (event.key) {
        case 'ArrowLeft':
            if (!collision(currentPiece, -1, 0)) {
                currentPiece.x--;
            }
            break;
        case 'ArrowRight':
            if (!collision(currentPiece, 1, 0)) {
                currentPiece.x++;
            }
            break;
        case 'ArrowDown':
            if (!collision(currentPiece, 0, 1)) {
                currentPiece.y++;
                score += 1;
                document.getElementById('score').textContent = score;
            }
            break;
        case 'ArrowUp':
            rotate();
            break;
        case 'p':
            pauseGame();
            break;
    }
    
    drawBoard();
    currentPiece.draw(ctx);
});

// 开始游戏
function startGame() {
    if (!gameLoop) {
        currentPiece = new Piece();
        nextPiece = new Piece();
        drawNextPiece();
        gameLoop = setInterval(update, 1000 / level);
    }
    isPaused = false;
}

// 暂停游戏
function pauseGame() {
    isPaused = !isPaused;
}

// 重置游戏
function resetGame() {
    clearInterval(gameLoop);
    gameLoop = null;
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    level = 1;
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    isPaused = false;
    drawBoard();
    startGame();
}

// 初始化画布
ctx.scale(1, 1);
nextCtx.scale(1, 1);
drawBoard(); 