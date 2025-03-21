const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const startButton = document.getElementById('start-button');
const mainMenu = document.getElementById('main-menu');
const scoreDisplay = document.getElementById('score');
const lengthDisplay = document.getElementById('length');
const leaderboardList = document.getElementById('leaderboard-list');

let snakeColor = '#00ff00';
let bgColor = '#0E273B'; // สีพื้นหลังเกมจาก Superseed brand kit
let snake = [{ x: 400, y: 300 }];
let direction = { x: 0, y: 0 };
let coins = [];
let score = 0;
let length = 10;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
let zoom = 1;

// โหลดภาพโลโก้ Superseed สำหรับเหรียญ
const coinImage = new Image();
coinImage.src = 'https://github.com/superseed-xyz/brand-kit/raw/main/logos-wordmarks/logos/small.png';

// เริ่มเกม
startButton.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    canvas.style.display = 'block';
    initGame();
});

// การควบคุมด้วยเมาส์
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;
    const angle = Math.atan2(mouseY - snake[0].y, mouseX - snake[0].x);
    direction.x = Math.cos(angle) * 5;
    direction.y = Math.sin(angle) * 5;
});

// ซูมเข้า/ออก
document.addEventListener('keydown', (e) => {
    if (e.key === '+') zoom = Math.min(zoom + 0.1, 2);
    if (e.key === '-') zoom = Math.max(zoom - 0.1, 0.5);
});

// เริ่มต้นเกม
function initGame() {
    coins = [];
    snake = [{ x: 400, y: 300 }];
    direction = { x: 0, y: 0 };
    score = 0;
    length = 10;
    spawnCoins();
    updateLeaderboard();
    gameLoop();
}

// สร้างเหรียญ SUPR
function spawnCoins() {
    for (let i = 0; i < 10; i++) {
        coins.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 20 + 10
        });
    }
}

// วาดงูให้เหมือนจริง (มีตา)
function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = snakeColor;
        if (index === 0) { // หัวงู
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, 12, 0, Math.PI * 2);
            ctx.fill();
            // วาดตา
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(segment.x - 4, segment.y - 4, 2, 0, Math.PI * 2);
            ctx.arc(segment.x + 4, segment.y - 4, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(segment.x - 4, segment.y - 4, 1, 0, Math.PI * 2);
            ctx.arc(segment.x + 4, segment.y - 4, 1, 0, Math.PI * 2);
            ctx.fill();
        } else { // ลำตัว
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, 10, 0, Math.PI * 2);
            ctx.fill();
            // ลายบนลำตัว
            ctx.fillStyle = '#ffffff33';
            ctx.fillRect(segment.x - 5, segment.y - 2, 10, 4);
        }
    });
}

// อัปเดตเกม
function gameLoop() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // เคลื่อนที่งู
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    if (snake.length > length) snake.pop();

    // วาดงู
    drawSnake();

    // วาดเหรียญ SUPR เป็นโลโก้
    coins.forEach((coin, index) => {
        ctx.drawImage(coinImage, coin.x - coin.size / 2, coin.y - coin.size / 2, coin.size, coin.size);

        // ตรวจสอบการกินเหรียญ
        if (Math.hypot(coin.x - head.x, coin.y - head.y) < coin.size / 2 + 12) {
            coins.splice(index, 1);
            score += Math.floor(coin.size / 2);
            length += 1;
            coins.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 20 + 10
            });
        }
    });

    // อัปเดตคะแนน
    scoreDisplay.textContent = score;
    lengthDisplay.textContent = length;

    // ตรวจสอบการชนขอบ
    if (head.x < 0 || head.x > canvas.width || head.y < 0 || head.y > canvas.height) {
        endGame();
        return;
    }

    requestAnimationFrame(gameLoop);
}

// จบเกม
function endGame() {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5);
    localStorage.setItem('highScores', JSON.stringify(highScores));
    canvas.style.display = 'none';
    mainMenu.style.display = 'block';
    updateLeaderboard();
}

// อัปเดต Leaderboard
function updateLeaderboard() {
    leaderboardList.innerHTML = '';
    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score}`;
        leaderboardList.appendChild(li);
    });
}