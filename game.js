const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const stageElement = document.getElementById('stage');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const nextStageBtn = document.getElementById('nextStageBtn'); // 다음 스테이지 버튼 추가

console.log('MAX_STAGE at game.js start:', typeof MAX_STAGE !== 'undefined' ? MAX_STAGE : 'undefined');

const GRID_SIZE = 50;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 10;
const VIEW_WIDTH = canvas.width / GRID_SIZE;
const VIEW_HEIGHT = canvas.height / GRID_SIZE;

let camera = {
    x: 0,
    y: 0
};

let player = {
    x: 1,
    y: 1,
    direction: 0,
    animX: 1,
    animY: 1,
    moving: false,
    moveProgress: 0
};

let friends = [];
let enemies = [];
let walls = [];
let exitPoint = { x: 28, y: 18 };

let stage = 1;
let score = 0;
let lives = 3;
let gameRunning = false;
let friendsRescued = 0;
let gameLoopTimeoutId; // gameLoop의 setTimeout ID를 저장할 변수

let customImages = {
    player: null,
    friend1: null,
    friend2: null,
    friend3: null,
    friend4: null,
    friend5: null,
    friend6: null,
    friend7: null,
    friend8: null,
    friend9: null,
    friend10: null,
    enemy: null,
    wall: null,
    exit: null
};

// 사운드 객체들
const sounds = {
    background: new Audio('sounds/bg_music.mp3'),
    collision: new Audio('sounds/collision.wav'),
    gameOver: new Audio('sounds/game_over.wav'),
    countdown: new Audio('sounds/countdown_beep.wav'),
    exit: new Audio('sounds/exit_sound.wav'),
    friendRescue: new Audio('sounds/friend_rescue.wav') // 친구 구할 때 효과음 추가
};

// 배경음악 루프 설정
sounds.background.loop = true;

let backgroundColor = '#90EE90';
let playerSpeed = 200;
let enemySpeed = 8;

// 모든 사운드를 미리 로드하는 함수
function preloadSounds() {
    for (const key in sounds) {
        if (sounds.hasOwnProperty(key)) {
            sounds[key].load();
        }
    }
}

const DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },  
    { x: 0, y: 1 },  
    { x: -1, y: 0 } 
];

function initStage() {
    friendsRescued = 0;
    loadStage(stage); // 항상 현재 stage 변수에 해당하는 스테이지를 로드
}

function loadCustomMap(data) {
    friends = data.mapData.friends || [];
    enemies = data.mapData.enemies || [];
    walls = data.mapData.walls || [];
    exitPoint = data.mapData.exit || { x: 28, y: 18 };
    player.x = data.mapData.player.x || 1;
    player.y = data.mapData.player.y || 1;
    player.direction = 1;
    backgroundColor = data.mapData.backgroundColor || '#90EE90';
    playerSpeed = data.mapData.playerSpeed || 200;
    enemySpeed = data.mapData.enemySpeed || 8;
    
    if (data.mapData.stageNumber) {
        stage = data.mapData.stageNumber;
        updateUI();
    }
    
    if (data.images) {
        Object.keys(data.images).forEach(key => {
            const img = new Image();
            img.onload = () => {
                customImages[key] = img;
            };
            img.src = data.images[key];
        });
    }
}

function loadStage(stageNum) {
    console.log('Loading stage:', stageNum);
    
    let stageData = null;
    const modifiedStageKey = `modifiedStage_${stageNum}`;
    const modifiedStage = localStorage.getItem(modifiedStageKey);

    if (modifiedStage) {
        try {
            const data = JSON.parse(modifiedStage);
            stageData = data.mapData;
            // 이미지 로드
            if (data.images) {
                Object.keys(data.images).forEach(key => {
                    const img = new Image();
                    img.onload = () => {
                        customImages[key] = img;
                    };
                    img.src = data.images[key];
                });
            }
            console.log(`Modified stage ${stageNum} loaded from localStorage.`);
        } catch (error) {
            console.error(`Error parsing modified stage ${stageNum} from localStorage:`, error);
            localStorage.removeItem(modifiedStageKey); // 오류 발생 시 삭제
            stageData = STAGES[stageNum]; // 기본 스테이지 로드
            console.log(`Falling back to default stage ${stageNum}.`);
        }
    } else {
        stageData = STAGES[stageNum];
        console.log(`Default stage ${stageNum} loaded from stages.js.`);
    }

    if (!stageData) {
        console.error('No stage data found for stage', stageNum);
        gameComplete();
        return;
    }
    
    friends = stageData.friends.map(f => ({...f, rescued: false}));
    enemies = stageData.enemies.map(e => ({...e, moveTimer: 0}));
    walls = [...stageData.walls];
    exitPoint = {...stageData.exit};
    backgroundColor = stageData.backgroundColor;
    playerSpeed = stageData.playerSpeed || 200;
    enemySpeed = stageData.enemySpeed || 8;
    
    player.x = stageData.player.x;
    player.y = stageData.player.y;
    player.animX = stageData.player.x;
    player.animY = stageData.player.y;
    player.direction = 1;
    player.moving = false;
    player.moveProgress = 0;
}

function loadDefaultStage() {
    loadStage(stage);
}

function updateCamera() {
    camera.x = Math.max(0, Math.min(MAP_WIDTH - VIEW_WIDTH, player.x - VIEW_WIDTH/2));
    camera.y = Math.max(0, Math.min(MAP_HEIGHT - VIEW_HEIGHT, player.y - VIEW_HEIGHT/2));
}

function drawRect(x, y, color, text = '', image = null, bobOffset = 0) {
    const screenX = x - camera.x;
    const screenY = y - camera.y;
    
    if (screenX < 0 || screenX >= VIEW_WIDTH || screenY < 0 || screenY >= VIEW_HEIGHT) {
        return;
    }
    
    const pixelX = screenX * GRID_SIZE + 1;
    const pixelY = screenY * GRID_SIZE + 1 + bobOffset;
    
    if (image && image.complete) {
        ctx.drawImage(image, pixelX, pixelY, GRID_SIZE - 2, GRID_SIZE - 2);
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(pixelX, pixelY, GRID_SIZE - 2, GRID_SIZE - 2);
        
        if (text) {
            ctx.fillStyle = 'black';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(text, pixelX + GRID_SIZE/2, pixelY + GRID_SIZE/2 + 8);
        }
    }
}

function drawAnimatedRect(gridX, gridY, animX, animY, color, text = '', image = null, bobOffset = 0) {
    const screenX = animX - camera.x;
    const screenY = animY - camera.y;
    
    if (screenX < -1 || screenX >= VIEW_WIDTH + 1 || screenY < -1 || screenY >= VIEW_HEIGHT + 1) {
        return;
    }
    
    const pixelX = screenX * GRID_SIZE + 1;
    const pixelY = screenY * GRID_SIZE + 1 + bobOffset;
    
    if (image && image.complete) {
        ctx.drawImage(image, pixelX, pixelY, GRID_SIZE - 2, GRID_SIZE - 2);
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(pixelX, pixelY, GRID_SIZE - 2, GRID_SIZE - 2);
        
        if (text) {
            ctx.fillStyle = 'black';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(text, pixelX + GRID_SIZE/2, pixelY + GRID_SIZE/2 + 8);
        }
    }
}

function drawPlayer() {
    const bobOffset = player.moving ? Math.sin(Date.now() * 0.01) * 2 : 0;
    drawAnimatedRect(player.x, player.y, player.animX, player.animY, '#FF6B6B', '🐱', customImages.player, bobOffset);
}

function drawFriends() {
    friends.forEach(friend => {
        if (!friend.rescued) {
            const friendType = friend.type || 1;
            const friendImage = customImages[`friend${friendType}`];
            const defaultEmojis = ['😿', '🙀', '😹', '😻', '😽', '🐾', '🐈', '😸', '😺', '😼'];
            const emoji = defaultEmojis[friendType - 1] || '😿';
            const colors = ['#FFE66D', '#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFB347', '#DA70D6', '#20B2AA', '#9370DB'];
            const color = colors[friendType - 1] || '#FFE66D';
            
            drawRect(friend.x, friend.y, color, emoji, friendImage);
        }
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        drawRect(enemy.x, enemy.y, '#8B4513', '🐕', customImages.enemy);
    });
}

function drawWalls() {
    walls.forEach(wall => {
        drawRect(wall.x, wall.y, '#654321', '', customImages.wall);
    });
}

function drawExitPoint() {
    const allFriendsRescued = friends.every(friend => friend.rescued);
    const color = allFriendsRescued ? '#00FF00' : '#888888';
    drawRect(exitPoint.x, exitPoint.y, color, '🚪', customImages.exit);
}

function drawMinimap() {
    const minimapSize = 150;
    const minimapX = canvas.width - minimapSize - 10;
    const minimapY = 10;
    const tileSize = minimapSize / Math.max(MAP_WIDTH, MAP_HEIGHT);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    ctx.strokeStyle = 'white';
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    walls.forEach(wall => {
        ctx.fillStyle = '#654321';
        ctx.fillRect(minimapX + wall.x * tileSize, minimapY + wall.y * tileSize, tileSize, tileSize);
    });
    
    friends.forEach(friend => {
        if (!friend.rescued) {
            const friendType = friend.type || 1;
            const colors = ['#FFE66D', '#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFB347', '#DA70D6', '#20B2AA', '#9370DB'];
            ctx.fillStyle = colors[friendType - 1] || '#FFE66D';
            ctx.fillRect(minimapX + friend.x * tileSize, minimapY + friend.y * tileSize, tileSize, tileSize);
        }
    });
    
    enemies.forEach(enemy => {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(minimapX + enemy.x * tileSize, minimapY + enemy.y * tileSize, tileSize, tileSize);
    });
    
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(minimapX + exitPoint.x * tileSize, minimapY + exitPoint.y * tileSize, tileSize, tileSize);
    
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(minimapX + player.x * tileSize, minimapY + player.y * tileSize, tileSize, tileSize);
    
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(
        minimapX + camera.x * tileSize, 
        minimapY + camera.y * tileSize, 
        VIEW_WIDTH * tileSize, 
        VIEW_HEIGHT * tileSize
    );
    ctx.lineWidth = 1;
}

function movePlayer() {
    if (player.moving) return;
    
    const dir = DIRECTIONS[player.direction];
    const newX = player.x + dir.x;
    const newY = player.y + dir.y;
    
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
        sounds.collision.currentTime = 0;
        sounds.collision.play();
        setTimeout(() => loseLife(), 50); // 50ms 딜레이 후 loseLife 호출
        return;
    }
    
    if (isWall(newX, newY)) {
        sounds.collision.currentTime = 0;
        sounds.collision.play();
        setTimeout(() => loseLife(), 50); // 50ms 딜레이 후 loseLife 호출
        return;
    }
    
    if (isEnemy(newX, newY)) {
        sounds.collision.currentTime = 0;
        sounds.collision.play();
        setTimeout(() => loseLife(), 50); // 50ms 딜레이 후 loseLife 호출
        return;
    }
    
    player.moving = true;
    player.moveProgress = 0;
    const oldX = player.x;
    const oldY = player.y;
    player.x = newX;
    player.y = newY;
    
    animatePlayerMove(oldX, oldY, newX, newY);
    
    checkFriendRescue();
    checkExitPoint();
}

function animatePlayerMove(fromX, fromY, toX, toY) {
    const animationDuration = playerSpeed;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        player.animX = fromX + (toX - fromX) * progress;
        player.animY = fromY + (toY - fromY) * progress;
        player.moveProgress = progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            player.moving = false;
            player.animX = toX;
            player.animY = toY;
        }
    }
    
    animate();
}

function moveEnemies() {
    enemies.forEach(enemy => {
        enemy.moveTimer++;
        if (enemy.moveTimer >= enemySpeed) {
            enemy.moveTimer = 0;
            
            const dir = DIRECTIONS[enemy.direction];
            const newX = enemy.x + dir.x;
            const newY = enemy.y + dir.y;
            
            if (!isWall(newX, newY) && newX >= 0 && newX < MAP_WIDTH && newY >= 0 && newY < MAP_HEIGHT) {
                enemy.x = newX;
                enemy.y = newY;
            } else {
                enemy.direction = (enemy.direction + 1) % 4;
            }
        }
    });
}

function isWall(x, y) {
    return walls.some(wall => wall.x === x && wall.y === y);
}

function isEnemy(x, y) {
    return enemies.some(enemy => enemy.x === x && enemy.y === y);
}

function checkFriendRescue() {
    friends.forEach(friend => {
        if (!friend.rescued && friend.x === player.x && friend.y === player.y) {
            friend.rescued = true;
            friendsRescued++;
            score += 100;
            // updateUI(); // 스테이지 번호 업데이트는 nextStage에서만
            sounds.friendRescue.currentTime = 0;
            sounds.friendRescue.play(); // 친구 구할 때 효과음 재생
        }
    });
}

function checkExitPoint() {
    if (player.x === exitPoint.x && player.y === exitPoint.y) {
        console.log("Player reached exit point!");
        console.log("Current friends array:", friends);
        const allFriendsRescued = friends.every(friend => friend.rescued);
        console.log("All friends rescued status:", allFriendsRescued);
        if (allFriendsRescued) {
            nextStage();
        }
    }
}

function nextStage() {
    const currentStage = stage;
    score += 500;
    updateUI();
    
    if (stage >= MAX_STAGE) { // 마지막 스테이지 클리어 시
        gameComplete();
        return;
    }
    
    console.log(`스테이지 ${currentStage} 클리어!`);
    sounds.exit.currentTime = 0;
    sounds.exit.play(); // 출구 사운드 재생
    clearTimeout(gameLoopTimeoutId); // 기존 게임 루프 중지
    gameRunning = false; // 게임 일시 정지

    // 다음 스테이지 버튼 보여주기
    nextStageBtn.classList.remove('hidden');
    nextStageBtn.innerHTML = `스테이지 ${currentStage} 클리어!<br>다음 스테이지로!`;

    // 다음 스테이지 버튼 클릭 이벤트 리스너 (한 번만 추가되도록)
    nextStageBtn.onclick = () => {
        nextStageBtn.classList.add('hidden'); // 버튼 숨기기
        stage++; // 다음 스테이지로 이동
        initStage(); // 다음 스테이지 초기화
        startCountdown(gameLoop); // 카운트다운 후 새 게임 루프 시작
    };
}

function gameComplete() {
    showEndingScreen(score);
}

function loseLife() {
    lives--;
    updateUI();
    
    if (lives <= 0) {
        gameOver();
    } else {
        console.log(`생명 -1! 남은 생명: ${lives}`); // alert 대신 console.log
        clearTimeout(gameLoopTimeoutId); // 기존 게임 루프 중지
        gameRunning = false; // 재시작 준비 중에는 false
        initStage(); // 스테이지 초기화 및 친구들 리셋
        startCountdown(gameLoop); // 카운트다운 후 새 게임 루프 시작
    }
}

function gameOver() {
    gameRunning = false;
    startBtn.disabled = false;
    startBtn.textContent = '다시 시작';
    sounds.background.pause(); // 배경 음악 중지
    sounds.gameOver.play(); // 게임 오버 사운드 재생
    showEndingScreen(score); // 엔딩 화면 호출
}

function updateUI() {
    stageElement.textContent = stage;
    scoreElement.textContent = score;
    
    let heartsText = '';
    for (let i = 0; i < lives; i++) {
        heartsText += '❤️';
    }
    for (let i = lives; i < 3; i++) {
        heartsText += '🖤';
    }
    livesElement.textContent = heartsText;
}

function gameLoop() {
    if (!gameRunning) {
        clearTimeout(gameLoopTimeoutId);
        return;
    }
    
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    movePlayer();
    moveEnemies();
    updateCamera();
    
    drawWalls();
    drawFriends();
    drawEnemies();
    drawExitPoint();
    drawPlayer();
    
    gameLoopTimeoutId = setTimeout(gameLoop, 100);
}

function startCountdown(callback) {
    const countdownOverlay = document.getElementById('countdownOverlay');
    const countdownNumber = document.getElementById('countdownNumber');
    let count = 3;

    countdownOverlay.classList.remove('hidden');
    countdownNumber.textContent = count;
    sounds.countdown.currentTime = 0;
    sounds.countdown.play();

    const countdownInterval = setInterval(() => {
        count--;
        if (count >= 0) { // Keep updating and playing sound for 3, 2, 1, GO!
            if (count > 0) {
                countdownNumber.textContent = count;
            } else { // count === 0
                countdownNumber.textContent = 'GO!';
            }
            sounds.countdown.currentTime = 0;
            sounds.countdown.play();
        } else { // count < 0, countdown finished
            clearInterval(countdownInterval);
            countdownOverlay.classList.add('hidden');
            gameRunning = true; // Set gameRunning to true only when countdown is truly over
            if (callback) callback();
        }
    }, 1000);
}

function startGame() {
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');

    const customMap = localStorage.getItem('customMap');
    if (customMap) {
        try {
            const mapData = JSON.parse(customMap);
            loadCustomMap(mapData);
            localStorage.removeItem('customMap'); // 테스트 맵은 한 번 사용 후 삭제
            stage = mapData.mapData.stageNumber || 1; // 테스트 맵의 스테이지 번호로 설정
        } catch (error) {
            console.error('Error loading custom map from localStorage:', error);
            localStorage.removeItem('customMap');
            stage = 1; // 오류 발생 시 1스테이지로 초기화
        }
    } else {
        stage = 1; // 일반 시작 시 1스테이지로 초기화
    }

    score = 0;
    lives = 3;
    gameRunning = false; // 게임 시작 시 gameRunning을 false로 설정
    
    startBtn.disabled = true;
    startBtn.textContent = '게임 중...';
    
    initStage();
    updateUI();
    preloadSounds(); // 사운드 미리 로드
    sounds.background.play(); // 배경 음악 재생
    startCountdown(gameLoop); // 카운트다운 후 게임 루프 시작
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            player.direction = (player.direction + 3) % 4;
            break;
        case 'ArrowRight':
            player.direction = (player.direction + 1) % 4;
            break;
    }
});

startBtn.addEventListener('click', startGame);

ctx.clearRect(0, 0, canvas.width, canvas.height);
updateUI();

// 엔딩 화면 관련 함수들
function showEndingScreen(finalScore) {
    gameRunning = false;
    startBtn.disabled = false;
    startBtn.textContent = '다시 시작';
    sounds.background.pause(); // 엔딩 화면에서 배경 음악 중지
    
    // 엔딩 화면 HTML 생성
    const endingHTML = `
        <div class="ending-screen" id="endingScreen" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #2c3e50;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            color: white;
            text-align: center;
            font-family: Arial, sans-serif;
        ">
            <div class="ending-content" style="max-width: 600px; padding: 40px;">
                <h1 style="font-size: 3em; margin: 20px 0; color: #ecf0f1;">🎉 축하합니다! 🎉</h1>
                <p style="font-size: 1.3em; margin: 20px 0; color: #bdc3c7;">모든 고양이 친구들을 구하셨습니다!</p>
                <div class="score-display" style="
                    margin: 30px 0;
                    padding: 20px;
                    background-color: rgba(241, 196, 15, 0.1);
                    border-radius: 10px;
                    border: 2px solid #f1c40f;
                ">
                    <h2 style="color: #f1c40f; margin: 0; font-size: 2em;">최종 점수: ${finalScore}</h2>
                </div>
                <div class="initials-section" style="
                    margin: 30px 0;
                    padding: 20px;
                    background-color: rgba(52, 152, 219, 0.1);
                    border-radius: 10px;
                    border: 2px solid #3498db;
                ">
                    <p style="color: #3498db; font-size: 1.2em; margin-bottom: 15px;">이름을 입력하세요 (3글자):</p>
                    <div class="initials-input" style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
                        <input type="text" maxlength="3" class="initial-box" id="initialsInput" style="
                            width: 150px; height: 50px; font-size: 24px; text-align: center;
                            background-color: #34495e; color: white; border: 2px solid #3498db;
                            border-radius: 5px; font-weight: bold; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; /* 한글 폰트 추가 */
                        ">
                    </div>
                    <button onclick="saveHighScore(${finalScore})" style="
                        background-color: #27ae60; color: white; border: none;
                        padding: 12px 25px; border-radius: 5px; font-size: 1.1em;
                        cursor: pointer; transition: background-color 0.3s;
                    ">점수 저장</button>
                </div>
                <div class="ending-buttons" style="display: flex; justify-content: center; gap: 15px; margin-top: 30px;">
                    <button onclick="restartGame()" style="
                        background-color: #3498db; color: white; border: none;
                        padding: 15px 30px; border-radius: 5px; font-size: 1.1em;
                        cursor: pointer; transition: background-color 0.3s;
                    ">다시 하기</button>
                    <button onclick="goToMainMenu()" style="
                        background-color: #e74c3c; color: white; border: none;
                        padding: 15px 30px; border-radius: 5px; font-size: 1.1em;
                        cursor: pointer; transition: background-color 0.3s;
                    ">메인 메뉴</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', endingHTML);
    
    // 이니셜 입력 박스 이벤트 리스너
    const initialBoxes = document.querySelectorAll('.initial-box');
    initialBoxes.forEach((box, index) => {
        box.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
            if (e.target.value && index < initialBoxes.length - 1) {
                initialBoxes[index + 1].focus();
            }
        });
        
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                initialBoxes[index - 1].focus();
            }
        });
    });
    
    // 첫 번째 입력 박스에 포커스
    if (initialBoxes[0]) {
        initialBoxes[0].focus();
    }
}

function saveHighScore(finalScore) {
    const initials = document.getElementById('initialsInput').value.trim();
    
    if (initials.length !== 3) {
        alert('이니셜은 3글자로 입력해주세요!');
        return;
    }
    
    let highScores = JSON.parse(localStorage.getItem('savingCatsHighScores')) || [];
    
    const newScore = {
        initials: initials,
        score: finalScore,
        stage: stage, // 현재 스테이지 정보 추가
        date: new Date().toLocaleDateString('ko-KR')
    };
    
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 5); // 상위 5개만 저장
    
    localStorage.setItem('savingCatsHighScores', JSON.stringify(highScores));
    
    alert(`점수가 저장되었습니다!
이니셜: ${initials}
점수: ${finalScore}`);
    showEndingScreen(finalScore); // 점수 저장 후 엔딩 화면 갱신
}

function restartGame() {
    const endingScreen = document.getElementById('endingScreen');
    if (endingScreen) {
        endingScreen.remove();
    }
    startGame();
}

function goToMainMenu() {
    const endingScreen = document.getElementById('endingScreen');
    if (endingScreen) {
        endingScreen.remove();
    }
    location.reload();
}

// 엔딩 화면 관련 함수들
function showEndingScreen(finalScore) {
    gameRunning = false;
    startBtn.disabled = false;
    startBtn.textContent = '다시 시작';
    sounds.background.pause(); // 엔딩 화면에서 배경 음악 중지

    let highScores = JSON.parse(localStorage.getItem('savingCatsHighScores')) || [];
    let highScoresListHTML = highScores.map((score, index) => `<li>${index + 1}. ${score.initials} - ${score.score}점 (스테이지 ${score.stage || '-'}) (${score.date})</li>`).join('');

    // 엔딩 화면 HTML 생성
    const endingHTML = `
        <div class="ending-screen" id="endingScreen" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #2c3e50;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            color: white;
            text-align: center;
            font-family: Arial, sans-serif;
        ">
            <div class="ending-content" style="max-width: 600px; padding: 40px;">
                <h1 style="font-size: 3em; margin: 20px 0; color: #ecf0f1;">🎉 축하합니다! 🎉</h1>
                <p style="font-size: 1.3em; margin: 20px 0; color: #bdc3c7;">모든 고양이 친구들을 구하셨습니다!</p>
                <div class="score-display" style="
                    margin: 30px 0;
                    padding: 20px;
                    background-color: rgba(241, 196, 15, 0.1);
                    border-radius: 10px;
                    border: 2px solid #f1c40f;
                ">
                    <h2 style="color: #f1c40f; margin: 0; font-size: 2em;">최종 점수: ${finalScore}</h2>
                </div>
                <div class="initials-section" style="
                    margin: 30px 0;
                    padding: 20px;
                    background-color: rgba(52, 152, 219, 0.1);
                    border-radius: 10px;
                    border: 2px solid #3498db;
                ">
                    <p style="color: #3498db; font-size: 1.2em; margin-bottom: 15px;">이름을 입력하세요 (3글자):</p>
                    <div class="initials-input" style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
                        <input type="text" maxlength="3" class="initial-box" id="initialsInput" style="
                            width: 150px; height: 50px; font-size: 24px; text-align: center;
                            background-color: #34495e; color: white; border: 2px solid #3498db;
                            border-radius: 5px; font-weight: bold; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; /* 한글 폰트 추가 */
                        ">
                    </div>
                    <button onclick="saveHighScore(${finalScore})" style="
                        background-color: #27ae60; color: white; border: none;
                        padding: 12px 25px; border-radius: 5px; font-size: 1.1em;
                        cursor: pointer; transition: background-color 0.3s;
                    ">점수 저장</button>
                </div>
                <div class="high-scores-section" style="
                    margin: 30px 0;
                    padding: 20px;
                    background-color: rgba(46, 204, 113, 0.1);
                    border-radius: 10px;
                    border: 2px solid #2ecc71;
                ">
                    <h2 style="color: #2ecc71; margin: 0; font-size: 1.8em;">역대 최고 점수</h2>
                    <ol style="list-style-position: inside; padding: 0; color: #ecf0f1;">
                        ${highScoresListHTML}
                    </ol>
                </div>
                <div class="ending-buttons" style="display: flex; justify-content: center; gap: 15px; margin-top: 30px;">
                    <button onclick="restartGame()" style="
                        background-color: #3498db; color: white; border: none;
                        padding: 15px 30px; border-radius: 5px; font-size: 1.1em;
                        cursor: pointer; transition: background-color 0.3s;
                    ">다시 하기</button>
                    <button onclick="goToMainMenu()" style="
                        background-color: #e74c3c; color: white; border: none;
                        padding: 15px 30px; border-radius: 5px; font-size: 1.1em;
                        cursor: pointer; transition: background-color 0.3s;
                    ">메인 메뉴</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', endingHTML);
    
    // 이니셜 입력 박스 이벤트 리스너 (단일 입력 필드에 맞게 수정)
    const initialsInput = document.getElementById('initialsInput');
    if (initialsInput) {
        initialsInput.addEventListener('input', (e) => {
            // 한글 입력 허용, 대문자 변환 제거
            e.target.value = e.target.value.slice(0, 3); // 3글자 제한
        });
        initialsInput.focus();
    }
}