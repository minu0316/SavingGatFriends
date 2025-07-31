const canvas = document.getElementById('editorCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 50;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 10;

let currentTool = 'wall';
let mapData = {
    walls: [],
    friends: [],
    enemies: [],
    player: { x: 1, y: 1 },
    exit: { x: 18, y: 8 },
    backgroundColor: '#90EE90',
    stageNumber: 1,
    stageName: '',
    playerSpeed: 200,
    enemySpeed: 8
};

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

function initEditor() {
    const savedMap = localStorage.getItem('currentEditedMap');
    if (savedMap) {
        try {
            const data = JSON.parse(savedMap);
            mapData = data.mapData;
            
            if (mapData.backgroundColor) {
                document.getElementById('backgroundColorPicker').value = mapData.backgroundColor;
            }
            
            if (mapData.stageNumber) {
                document.getElementById('stageNumber').value = mapData.stageNumber;
            }
            
            if (mapData.stageName) {
                document.getElementById('stageName').value = mapData.stageName;
            }
            
            if (mapData.playerSpeed) {
                document.getElementById('playerSpeed').value = mapData.playerSpeed;
                document.getElementById('playerSpeedValue').textContent = mapData.playerSpeed + 'ms';
            }
            
            if (mapData.enemySpeed) {
                document.getElementById('enemySpeed').value = mapData.enemySpeed;
                document.getElementById('enemySpeedValue').textContent = mapData.enemySpeed + ' 프레임';
            }
            
            if (data.images) {
                Object.keys(data.images).forEach(key => {
                    const img = new Image();
                    img.onload = () => {
                        customImages[key] = img;
                        const preview = document.getElementById(`${key}Preview`);
                        if (preview) {
                            preview.src = data.images[key];
                            preview.style.display = 'inline';
                        }
                        drawMap();
                    };
                    img.src = data.images[key];
                });
            }
        } catch (error) {
            console.error('저장된 맵을 불러오는데 실패했습니다:', error);
            localStorage.removeItem('currentEditedMap'); // 오류 발생 시 저장된 맵 삭제
        }
    }

    drawGrid();
    drawMap();
    setupEventListeners();
    populateStageSelect(); // 스테이지 드롭다운 채우기
}

function populateStageSelect() {
    const stageSelect = document.getElementById('stageSelect');
    stageSelect.innerHTML = ''; // 기존 옵션 초기화
    for (let i = 1; i <= MAX_STAGE; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `스테이지 ${i}: ${STAGES[i].stageName}`;
        stageSelect.appendChild(option);
    }
}

function loadStageIntoEditor(stageNum) {
    const stageData = STAGES[stageNum];
    if (!stageData) {
        alert('해당 스테이지를 찾을 수 없습니다!');
        return;
    }

    // 맵 데이터 업데이트
    mapData = {
        walls: [...stageData.walls],
        friends: stageData.friends.map(f => ({...f})),
        enemies: stageData.enemies.map(e => ({...e})),
        player: {...stageData.player},
        exit: {...stageData.exit},
        backgroundColor: stageData.backgroundColor,
        stageNumber: stageData.stageNumber,
        stageName: stageData.stageName,
        playerSpeed: stageData.playerSpeed,
        enemySpeed: stageData.enemySpeed
    };

    // UI 업데이트
    document.getElementById('backgroundColorPicker').value = mapData.backgroundColor;
    document.getElementById('stageNumber').value = mapData.stageNumber;
    document.getElementById('stageName').value = mapData.stageName;
    document.getElementById('playerSpeed').value = mapData.playerSpeed;
    document.getElementById('playerSpeedValue').textContent = mapData.playerSpeed + 'ms';
    document.getElementById('enemySpeed').value = mapData.enemySpeed;
    document.getElementById('enemySpeedValue').textContent = mapData.enemySpeed + ' 프레임';

    // 이미지 초기화 (기본 이미지로)
    Object.keys(customImages).forEach(key => {
        customImages[key] = null;
        const preview = document.getElementById(`${key}Preview`);
        if (preview) {
            preview.src = '';
            preview.style.display = 'none';
        }
    });

    drawMap();
    alert(`스테이지 ${stageNum} (${stageData.stageName})이(가) 에디터에 로드되었습니다.`);
}

function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= MAP_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * GRID_SIZE, 0);
        ctx.lineTo(x * GRID_SIZE, MAP_HEIGHT * GRID_SIZE);
        ctx.stroke();
    }
    
    for (let y = 0; y <= MAP_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * GRID_SIZE);
        ctx.lineTo(MAP_WIDTH * GRID_SIZE, y * GRID_SIZE);
        ctx.stroke();
    }
}

function drawTile(x, y, color, text = '', image = null) {
    if (image && image.complete) {
        ctx.drawImage(image, x * GRID_SIZE + 1, y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(x * GRID_SIZE + 1, y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        
        if (text) {
            ctx.fillStyle = 'black';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(text, x * GRID_SIZE + GRID_SIZE/2, y * GRID_SIZE + GRID_SIZE/2 + 8);
        }
    }
}

function drawMap() {
    ctx.fillStyle = mapData.backgroundColor || '#90EE90';
    ctx.fillRect(0, 0, MAP_WIDTH * GRID_SIZE, MAP_HEIGHT * GRID_SIZE);
    drawGrid();
    
    mapData.walls.forEach(wall => {
        drawTile(wall.x, wall.y, '#654321', '', customImages.wall);
    });
    
    mapData.friends.forEach(friend => {
        const friendType = friend.type || 1;
        const friendImage = customImages[`friend${friendType}`];
        const defaultEmojis = ['😿', '🙀', '😹', '😻', '😽', '🐾', '🐈', '😸', '😺', '😼'];
        const emoji = defaultEmojis[friendType - 1] || '😿';
        const colors = ['#FFE66D', '#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFB347', '#DA70D6', '#20B2AA', '#9370DB'];
        const color = colors[friendType - 1] || '#FFE66D';
        
        drawTile(friend.x, friend.y, color, emoji, friendImage);
    });
    
    mapData.enemies.forEach(enemy => {
        drawTile(enemy.x, enemy.y, '#8B4513', '🐕', customImages.enemy);
    });
    
    drawTile(mapData.player.x, mapData.player.y, '#FF6B6B', '🐱', customImages.player);
    drawTile(mapData.exit.x, mapData.exit.y, '#00FF00', '🚪', customImages.exit);
}

function getGridPosition(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((clientY - rect.top) / GRID_SIZE);
    return { x, y };
}

function placeTile(x, y) {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return;
    
    removeTileAt(x, y);
    
    switch (currentTool) {
        case 'wall':
            mapData.walls.push({ x, y });
            break;
        case 'friend1':
            mapData.friends.push({ x, y, rescued: false, type: 1 });
            break;
        case 'friend2':
            mapData.friends.push({ x, y, rescued: false, type: 2 });
            break;
        case 'friend3':
            mapData.friends.push({ x, y, rescued: false, type: 3 });
            break;
        case 'friend4':
            mapData.friends.push({ x, y, rescued: false, type: 4 });
            break;
        case 'friend5':
            mapData.friends.push({ x, y, rescued: false, type: 5 });
            break;
        case 'friend6':
            mapData.friends.push({ x, y, rescued: false, type: 6 });
            break;
        case 'friend7':
            mapData.friends.push({ x, y, rescued: false, type: 7 });
            break;
        case 'friend8':
            mapData.friends.push({ x, y, rescued: false, type: 8 });
            break;
        case 'friend9':
            mapData.friends.push({ x, y, rescued: false, type: 9 });
            break;
        case 'friend10':
            mapData.friends.push({ x, y, rescued: false, type: 10 });
            break;
        case 'enemy':
            mapData.enemies.push({ x, y, direction: 0, moveTimer: 0 });
            break;
        case 'player':
            mapData.player = { x, y };
            break;
        case 'exit':
            mapData.exit = { x, y };
            break;
        case 'empty':
            break;
    }
    
    drawMap();
}

function removeTileAt(x, y) {
    mapData.walls = mapData.walls.filter(wall => !(wall.x === x && wall.y === y));
    mapData.friends = mapData.friends.filter(friend => !(friend.x === x && friend.y === y));
    mapData.enemies = mapData.enemies.filter(enemy => !(enemy.x === x && enemy.y === y));
    
    if (mapData.player.x === x && mapData.player.y === y && currentTool !== 'player') {
        mapData.player = { x: 1, y: 1 };
    }
    if (mapData.exit.x === x && mapData.exit.y === y && currentTool !== 'exit') {
        mapData.exit = { x: 28, y: 18 };
    }
}

function setupEventListeners() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.tool-btn.active').classList.remove('active');
            e.target.classList.add('active');
            currentTool = e.target.dataset.tool;
        });
    });
    
    canvas.addEventListener('click', (e) => {
        const pos = getGridPosition(e.clientX, e.clientY);
        placeTile(pos.x, pos.y);
    });
    
    document.getElementById('clearBtn').addEventListener('click', clearMap);
    document.getElementById('saveBtn').addEventListener('click', saveMap);
    document.getElementById('exportBtn').addEventListener('click', exportStageCode);
    document.getElementById('loadBtn').addEventListener('change', loadMap);
    document.getElementById('testBtn').addEventListener('click', testMap);
    
    document.getElementById('loadStageBtn').addEventListener('click', () => {
        const stageNum = parseInt(document.getElementById('stageSelect').value);
        loadStageIntoEditor(stageNum);
    });
    
    document.getElementById('backgroundColorPicker').addEventListener('change', (e) => {
        mapData.backgroundColor = e.target.value;
        drawMap();
    });
    
    document.getElementById('stageNumber').addEventListener('change', (e) => {
        mapData.stageNumber = parseInt(e.target.value) || 1;
    });
    
    document.getElementById('stageName').addEventListener('input', (e) => {
        mapData.stageName = e.target.value;
    });
    
    document.getElementById('playerSpeed').addEventListener('input', (e) => {
        mapData.playerSpeed = parseInt(e.target.value);
        document.getElementById('playerSpeedValue').textContent = e.target.value + 'ms';
    });
    
    document.getElementById('enemySpeed').addEventListener('input', (e) => {
        mapData.enemySpeed = parseInt(e.target.value);
        document.getElementById('enemySpeedValue').textContent = e.target.value + ' 프레임';
    });
    
    setupImageUploads();
}

function setupImageUploads() {
    const imageTypes = ['player', 'friend1', 'friend2', 'friend3', 'friend4', 'friend5', 'friend6', 'friend7', 'friend8', 'friend9', 'friend10', 'enemy', 'wall', 'exit'];
    
    imageTypes.forEach(type => {
        const input = document.getElementById(`${type}Img`);
        const preview = document.getElementById(`${type}Preview`);
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        customImages[type] = img;
                        preview.src = e.target.result;
                        preview.style.display = 'inline';
                        drawMap();
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

function clearMap() {
    if (confirm('정말로 맵을 모두 지우시겠습니까?')) {
        mapData = {
            walls: [],
            friends: [],
            enemies: [],
            player: { x: 1, y: 1 },
            exit: { x: 18, y: 8 },
            backgroundColor: '#90EE90',
            stageNumber: 1,
            stageName: '',
            playerSpeed: 200,
            enemySpeed: 8
        };
        document.getElementById('backgroundColorPicker').value = '#90EE90';
        document.getElementById('stageNumber').value = '1';
        document.getElementById('stageName').value = '';
        document.getElementById('playerSpeed').value = '200';
        document.getElementById('enemySpeed').value = '8';
        document.getElementById('playerSpeedValue').textContent = '200ms';
        document.getElementById('enemySpeedValue').textContent = '8 프레임';
        drawMap();
    }
}

function saveMap() {
    const dataToSave = {
        mapData: mapData,
        images: getImageData()
    };

    if (mapData.stageNumber && mapData.stageNumber > 0) {
        localStorage.setItem(`modifiedStage_${mapData.stageNumber}`, JSON.stringify(dataToSave));
        alert(`스테이지 ${mapData.stageNumber}이(가) 저장되었습니다!`);
    } else {
        localStorage.setItem('currentEditedMap', JSON.stringify(dataToSave));
        alert('현재 맵이 저장되었습니다!');
    }
}

function getImageData() {
    const imageData = {};
    Object.keys(customImages).forEach(key => {
        if (customImages[key]) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = customImages[key].width;
            canvas.height = customImages[key].height;
            ctx.drawImage(customImages[key], 0, 0);
            imageData[key] = canvas.toDataURL();
        }
    });
    return imageData;
}

function loadMap(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                mapData = data.mapData;
                
                if (mapData.backgroundColor) {
                    document.getElementById('backgroundColorPicker').value = mapData.backgroundColor;
                }
                
                if (mapData.stageNumber) {
                    document.getElementById('stageNumber').value = mapData.stageNumber;
                }
                
                if (mapData.stageName) {
                    document.getElementById('stageName').value = mapData.stageName;
                }
                
                if (mapData.playerSpeed) {
                    document.getElementById('playerSpeed').value = mapData.playerSpeed;
                    document.getElementById('playerSpeedValue').textContent = mapData.playerSpeed + 'ms';
                }
                
                if (mapData.enemySpeed) {
                    document.getElementById('enemySpeed').value = mapData.enemySpeed;
                    document.getElementById('enemySpeedValue').textContent = mapData.enemySpeed + ' 프레임';
                }
                
                if (data.images) {
                    Object.keys(data.images).forEach(key => {
                        const img = new Image();
                        img.onload = () => {
                            customImages[key] = img;
                            document.getElementById(`${key}Preview`).src = data.images[key];
                            document.getElementById(`${key}Preview`).style.display = 'inline';
                            drawMap();
                        };
                        img.src = data.images[key];
                    });
                }
                
                drawMap();
            } catch (error) {
                alert('맵 파일을 불러오는데 실패했습니다.');
            }
        };
        reader.readAsText(file);
    }
}

function exportStageCode() {
    const stageCode = `
    ${mapData.stageNumber}: {
        stageNumber: ${mapData.stageNumber},
        stageName: "${mapData.stageName || `스테이지 ${mapData.stageNumber}`}",
        backgroundColor: '${mapData.backgroundColor}',
        playerSpeed: ${mapData.playerSpeed || 200},
        enemySpeed: ${mapData.enemySpeed || 8},
        player: { x: ${mapData.player.x}, y: ${mapData.player.y} },
        exit: { x: ${mapData.exit.x}, y: ${mapData.exit.y} },
        friends: [
${mapData.friends.map(f => `            { x: ${f.x}, y: ${f.y}, rescued: false, type: ${f.type || 1} }`).join(',\n')}
        ],
        enemies: [
${mapData.enemies.map(e => `            { x: ${e.x}, y: ${e.y}, direction: ${e.direction || 0}, moveTimer: 0 }`).join(',\n')}
        ],
        walls: [
${mapData.walls.map(w => `            { x: ${w.x}, y: ${w.y} }`).join(',\n')}
        ]
    }`;
    
    // 클립보드에 복사
    navigator.clipboard.writeText(stageCode.trim()).then(() => {
        alert('스테이지 코드가 클립보드에 복사되었습니다!\n\nstages.js 파일의 STAGES 객체에 붙여넣기 하세요.');
    }).catch(() => {
        // 클립보드 실패 시 텍스트 영역에 표시
        const textarea = document.createElement('textarea');
        textarea.value = stageCode.trim();
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('스테이지 코드가 클립보드에 복사되었습니다!\n\nstages.js 파일의 STAGES 객체에 붙여넣기 하세요.');
    });
}

function testMap() {
    localStorage.setItem('customMap', JSON.stringify({
        mapData: mapData,
        images: getImageData()
    }));
    
    window.open('index.html', '_blank');
}

initEditor();